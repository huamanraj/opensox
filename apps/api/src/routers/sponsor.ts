import { router, publicProcedure, protectedProcedure } from "../trpc.js";
import { z } from "zod";
import prismaModule from "../prisma.js";
import { paymentService } from "../services/payment.service.js";

const { prisma } = prismaModule;

export const sponsorRouter = router({
    // Create a subscription for sponsorship
    createSubscription: protectedProcedure
        .input(
            z.object({
                planId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }: { ctx: any, input: any }) => {
            const user = ctx.user;

            // Create Razorpay order
            // Note: In a real scenario, we might want to fetch the plan price from DB
            // For now, we'll assume a fixed price or fetch from plan
            const plan = await prisma.plan.findUnique({
                where: { id: input.planId },
            });

            if (!plan) {
                throw new Error("Plan not found");
            }

            const order = await paymentService.createOrder({
                amount: plan.price,
                currency: plan.currency,
                receipt: `sponsor_${user.id}_${Date.now()}`,
                notes: {
                    user_id: user.id,
                    plan_id: input.planId,
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

    // Submit sponsor assets
    // Submit sponsor assets
    submitAssets: protectedProcedure
        .input(
            z.object({
                companyName: z.string(),
                description: z.string(),
                website: z.string().url(),
                imageUrl: z.string().url(),
                razorpayPaymentId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }: { ctx: any, input: any }) => {
            // Verify payment exists and is successful
            const payment = await prisma.payment.findUnique({
                where: { razorpayPaymentId: input.razorpayPaymentId },
            });

            if (!payment || payment.status !== "captured") {
                throw new Error("Valid payment not found");
            }

            // Check if this payment belongs to the user
            if (payment.userId !== ctx.user.id) {
                throw new Error("Unauthorized");
            }

            // Upsert sponsor record
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
                        company_name: input.companyName,
                        description: input.description,
                        website: input.website,
                        image_url: input.imageUrl,
                        razorpay_payment_id: input.razorpayPaymentId,
                        plan_status: "active",
                    },
                });
            }
        }),

    // Get pending sponsorships for the current user
    getPendingSponsorship: protectedProcedure.query(async ({ ctx }: { ctx: any }) => {
        const userPayments = await prisma.payment.findMany({
            where: {
                userId: ctx.user.id,
                status: "captured",
            },
            orderBy: { createdAt: "desc" },
            take: 5,
        });

        for (const payment of userPayments) {
            const sponsor = await prisma.sponsor.findFirst({
                where: { razorpay_payment_id: payment.razorpayPaymentId },
            });

            if (!sponsor || sponsor.plan_status === "pending_submission") {
                // Check if this payment is likely for sponsorship (e.g. has subscriptionId)
                if (payment.subscriptionId) {
                    return {
                        paymentId: payment.razorpayPaymentId,
                        amount: payment.amount,
                        date: payment.createdAt,
                    };
                }
            }
        }
        return null;
    }),

    // Get active sponsors
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
