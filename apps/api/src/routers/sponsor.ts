import { router, publicProcedure } from "../trpc.js";
import { z } from "zod";
import prismaModule from "../prisma.js";
import { paymentService } from "../services/payment.service.js";
import { TRPCError } from "@trpc/server";
import { rz_instance } from "../clients/razorpay.js";
import crypto from "crypto";

const { prisma } = prismaModule;

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

// fixed monthly sponsorship amount
const SPONSOR_MONTHLY_AMOUNT = 50000;
const SPONSOR_CURRENCY = "USD";
const SPONSOR_PLAN_ID = process.env.RAZORPAY_SPONSOR_PLAN_ID || "";

const verifySubscriptionSignature = (
    subscriptionId: string,
    paymentId: string,
    signature: string
): boolean => {
    try {
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            throw new Error("RAZORPAY_KEY_SECRET not configured");
        }

        const generatedSignatureHex = crypto
            .createHmac("sha256", keySecret)
            .update(`${subscriptionId}|${paymentId}`)
            .digest("hex");

        const a = Buffer.from(signature, "hex");
        const b = Buffer.from(generatedSignatureHex, "hex");

        if (a.length !== b.length) return false;

        return crypto.timingSafeEqual(a, b);
    } catch (error) {
        console.error("subscription signature verification error:", error);
        return false;
    }
};

export const sponsorRouter = router({
    // upload image to cloudinary (public, no auth required)
    uploadImage: publicProcedure
        .input(
            z.object({
                file: z
                    .string()
                    .refine(
                        (val) => {
                            // Accept data URLs and raw base64 strings; size under 5MB
                            const isDataUrl = /^data:.*;base64,/.test(val);
                            const base64Payload = isDataUrl ? val.split(",")[1] ?? "" : val;
                            // Base64 size approximation: bytes = (length * 3) / 4
                            const base64SizeBytes = Math.floor((base64Payload.length * 3) / 4);
                            const under5MB = base64SizeBytes > 0 && base64SizeBytes < 5 * 1024 * 1024;
                            // If data URL, ensure it's an image MIME type
                            const mimeOk = !isDataUrl || /^data:image\/(png|jpe?g|webp);base64,/.test(val);
                            return under5MB && mimeOk;
                        },
                        { message: "file must be an image data URL or base64 under 5MB (png/jpg/jpeg/webp)" }
                    ),
            })
        )
        .mutation(async ({ input }: { input: { file: string } }) => {
            try {
                const result = await cloudinary.uploader.upload(input.file, {
                    folder: "opensox/sponsors",
                    resource_type: "image",
                    allowed_formats: ["jpg", "jpeg", "png", "webp"],
                });
                return { url: result.secure_url };
            } catch (error) {
                console.error("cloudinary upload error:", error);
                throw new Error("image upload failed");
            }
        }),

    // create razorpay subscription for sponsorship (public, no auth required)
    createSubscription: publicProcedure
        .mutation(async () => {
            if (!SPONSOR_PLAN_ID) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "sponsor subscription plan not configured",
                });
            }

            try {
                const subscription = await rz_instance.subscriptions.create({
                    plan_id: SPONSOR_PLAN_ID,
                    total_count: 999,
                    customer_notify: 1,
                    notes: {
                        type: "sponsor",
                    },
                });

                return {
                    subscriptionId: subscription.id,
                    planId: subscription.plan_id,
                    status: subscription.status,
                    key: process.env.RAZORPAY_KEY_ID,
                };
            } catch (error) {
                console.error("failed to create sponsor subscription:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "failed to create sponsor subscription",
                });
            }
        }),

    // verify payment and create sponsor record (public, no auth required)
    verifyPayment: publicProcedure
        .input(
            z.object({
                razorpay_payment_id: z.string(),
                razorpay_order_id: z.string().optional(),
                razorpay_subscription_id: z.string().optional(),
                razorpay_signature: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                let subscriptionId: string | null = input.razorpay_subscription_id ?? null;

                if (input.razorpay_order_id) {
                    const isValidSignature = paymentService.verifyPaymentSignature(
                        input.razorpay_order_id,
                        input.razorpay_payment_id,
                        input.razorpay_signature
                    );

                    if (!isValidSignature) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "invalid payment signature",
                        });
                    }

                    const order = await rz_instance.orders.fetch(input.razorpay_order_id);
                    if (
                        !order ||
                        order.amount !== SPONSOR_MONTHLY_AMOUNT ||
                        order.currency !== SPONSOR_CURRENCY ||
                        order.notes?.type !== "sponsor"
                    ) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "invalid order details",
                        });
                    }
                } else if (subscriptionId) {
                    const isValidSignature = verifySubscriptionSignature(
                        subscriptionId,
                        input.razorpay_payment_id,
                        input.razorpay_signature
                    );

                    if (!isValidSignature) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "invalid subscription payment signature",
                        });
                    }

                    if (!SPONSOR_PLAN_ID) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "sponsor subscription plan not configured",
                        });
                    }

                    const subscription = await rz_instance.subscriptions.fetch(subscriptionId);
                    if (!subscription || subscription.plan_id !== SPONSOR_PLAN_ID) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "invalid subscription details",
                        });
                    }
                } else {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "missing order or subscription information",
                    });
                }

                // upsert payment to avoid race conditions / duplicates
                await prisma.payment.upsert({
                    where: { razorpayPaymentId: input.razorpay_payment_id },
                    update: {
                        razorpayOrderId: input.razorpay_order_id ?? "",
                        amount: SPONSOR_MONTHLY_AMOUNT,
                        currency: SPONSOR_CURRENCY,
                        status: "captured",
                    },
                    create: {
                        razorpayPaymentId: input.razorpay_payment_id,
                        razorpayOrderId: input.razorpay_order_id ?? "",
                        amount: SPONSOR_MONTHLY_AMOUNT,
                        currency: SPONSOR_CURRENCY,
                        status: "captured",
                    },
                });

                // Fetch payment details with proper typing
                type RazorpayPaymentDetails = {
                    contact?: string | number;
                    email?: string;
                    notes?: { name?: string } | null;
                };

                const paymentDetails = (await rz_instance.payments.fetch(
                    input.razorpay_payment_id
                )) as RazorpayPaymentDetails;

                let contactName: string | null = null;
                let contactEmail: string | null = null;
                let contactPhone: string | null = null;

                if (paymentDetails.contact != null) {
                    contactPhone = String(paymentDetails.contact);
                }
                if (paymentDetails.email) {
                    contactEmail = String(paymentDetails.email);
                }
                if (paymentDetails.notes?.name) {
                    contactName = String(paymentDetails.notes.name);
                }

                // create or update sponsor record with pending_submission status
                const existingSponsor = await prisma.sponsor.findFirst({
                    where: { razorpay_payment_id: input.razorpay_payment_id },
                });

                if (!existingSponsor) {
                    await prisma.sponsor.create({
                        data: {
                            razorpay_payment_id: input.razorpay_payment_id,
                            razorpay_sub_id: subscriptionId,
                            plan_status: "pending_submission",
                            company_name: "",
                            description: "",
                            website: "",
                            image_url: "",
                            contact_name: contactName,
                            contact_email: contactEmail,
                            contact_phone: contactPhone,
                        },
                    });
                } else {
                    // update existing sponsor with contact details if not already set
                    await prisma.sponsor.update({
                        where: { id: existingSponsor.id },
                        data: {
                            contact_name: contactName || existingSponsor.contact_name,
                            contact_email: contactEmail || existingSponsor.contact_email,
                            contact_phone: contactPhone || existingSponsor.contact_phone,
                            razorpay_sub_id: subscriptionId || existingSponsor.razorpay_sub_id,
                        },
                    });
                }

                return {
                    success: true,
                    paymentId: input.razorpay_payment_id,
                };
            } catch (error) {
                console.error("error in verifyPayment:", error);
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "failed to verify payment",
                    cause: error,
                });
            }
        }),

    // submit sponsor assets (public, no auth required)
    submitAssets: publicProcedure
        .input(
            z.object({
                companyName: z.string(),
                description: z.string(),
                website: z.string().url(),
                imageUrl: z.string().url(),
                razorpayPaymentId: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                // verify payment exists and is successful
                const payment = await prisma.payment.findUnique({
                    where: { razorpayPaymentId: input.razorpayPaymentId },
                });

                if (!payment || payment.status !== "captured") {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "valid payment not found or not captured",
                    });
                }

                // fetch payment details from razorpay to get the linked order or subscription
                const rpPayment = await rz_instance.payments.fetch(input.razorpayPaymentId);
                const linkedOrderId = (rpPayment as any)?.order_id as string | undefined;
                const linkedSubscriptionId = (rpPayment as any)?.subscription_id as
                    | string
                    | undefined;

                if (!linkedOrderId && !linkedSubscriptionId) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "payment not linked to a valid order or subscription",
                    });
                }

                if (linkedOrderId) {
                    const order = await rz_instance.orders.fetch(linkedOrderId);
                    if (
                        !order ||
                        order.amount !== SPONSOR_MONTHLY_AMOUNT ||
                        order.currency !== SPONSOR_CURRENCY ||
                        order.notes?.type !== "sponsor"
                    ) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "invalid order details for sponsor plan",
                        });
                    }
                } else if (linkedSubscriptionId) {
                    if (!SPONSOR_PLAN_ID) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "sponsor subscription plan not configured",
                        });
                    }

                    const subscription = await rz_instance.subscriptions.fetch(
                        linkedSubscriptionId
                    );
                    if (
                        !subscription ||
                        subscription.plan_id !== SPONSOR_PLAN_ID
                    ) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "invalid subscription details for sponsor plan",
                        });
                    }
                }

                // Enforce flow: Sponsor must exist with pending_submission from verifyPayment
                const existingSponsor = await prisma.sponsor.findFirst({
                    where: {
                        razorpay_payment_id: input.razorpayPaymentId,
                        plan_status: "pending_submission",
                    },
                });

                if (!existingSponsor) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message:
                            "sponsorship not in pending submission state; complete verification first",
                    });
                }

                // Update sponsor to active with submitted assets
                return await prisma.sponsor.update({
                    where: { id: existingSponsor.id },
                    data: {
                        company_name: input.companyName,
                        description: input.description,
                        website: input.website,
                        image_url: input.imageUrl,
                        plan_status: "active",
                    },
                });
            } catch (error) {
                console.error("error in submitAssets:", error);
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "something went wrong during sponsorship submission",
                    cause: error,
                });
            }
        }),

    // get active sponsors (public)
    getActiveSponsors: publicProcedure.query(async () => {
        return await prisma.sponsor.findMany({
            where: {
                plan_status: "active",
            },
            orderBy: {
                created_at: "desc",
            },
            select: {
                id: true,
                company_name: true,
                image_url: true, // public-facing logo/image URL
                website: true,    // public-facing website URL
                plan_status: true,
                created_at: true,
            },
        });
    }),
});
