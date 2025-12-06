import { router, publicProcedure } from "../trpc.js";
import { z } from "zod";
import prismaModule from "../prisma.js";
import { paymentService } from "../services/payment.service.js";
import { TRPCError } from "@trpc/server";
import { rz_instance } from "../clients/razorpay.js";

const { prisma } = prismaModule;

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

// fixed monthly subscription amount: $500 = 50000 cents (USD)
const SPONSOR_MONTHLY_AMOUNT = 50000; // $500 in cents
const SPONSOR_CURRENCY = "USD";

export const sponsorRouter = router({
    // upload image to cloudinary (public, no auth required)
    uploadImage: publicProcedure
        .input(z.object({ file: z.string() }))
        .mutation(async ({ input }: { input: { file: string } }) => {
            try {
                const result = await cloudinary.uploader.upload(input.file, {
                    folder: "opensox/sponsors",
                });
                return { url: result.secure_url };
            } catch (error) {
                console.error("cloudinary upload error:", error);
                throw new Error("image upload failed");
            }
        }),

    // create payment order for sponsorship (public, no auth required)
    createSubscription: publicProcedure
        .mutation(async () => {
            // generate receipt id
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 10);
            const receipt = `sp_${timestamp}_${randomId}`;

            const order = await paymentService.createOrder({
                amount: SPONSOR_MONTHLY_AMOUNT,
                currency: SPONSOR_CURRENCY,
                receipt,
                notes: {
                    type: "sponsor",
                },
            });

            if ("error" in order) {
                throw new Error(order.error.description);
            }

            return {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID,
            };
        }),

    // verify payment and create sponsor record (public, no auth required)
    verifyPayment: publicProcedure
        .input(
            z.object({
                razorpay_payment_id: z.string(),
                razorpay_order_id: z.string(),
                razorpay_signature: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                // verify signature
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

                // CRITICAL: validate order attributes to prevent replay/misuse
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

                // Upsert payment to avoid race conditions / duplicates
                await prisma.payment.upsert({
                    where: { razorpayPaymentId: input.razorpay_payment_id },
                    update: {
                        razorpayOrderId: input.razorpay_order_id,
                        amount: SPONSOR_MONTHLY_AMOUNT,
                        currency: SPONSOR_CURRENCY,
                        status: "captured",
                    },
                    create: {
                        razorpayPaymentId: input.razorpay_payment_id,
                        razorpayOrderId: input.razorpay_order_id,
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

                // find existing sponsor record
                const existingSponsor = await prisma.sponsor.findFirst({
                    where: { razorpay_payment_id: input.razorpayPaymentId },
                });

                if (existingSponsor) {
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
                } else {
                    return await prisma.sponsor.create({
                        data: {
                            razorpay_payment_id: input.razorpayPaymentId,
                            company_name: input.companyName,
                            description: input.description,
                            website: input.website,
                            image_url: input.imageUrl,
                            plan_status: "active",
                        },
                    });
                }
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
        });
    }),
});
