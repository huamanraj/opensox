import type { Request, Response } from "express";
import crypto from "crypto";
import prismaModule from "./prisma.js";
import { rz_instance } from "./clients/razorpay.js";

const { prisma } = prismaModule;

export const handleRazorpayWebhook = async (req: Request, res: Response) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("RAZORPAY_WEBHOOK_SECRET not configured");
            return res.status(500).json({ error: "Webhook not configured" });
        }

        // Get signature from headers
        const signature = req.headers["x-razorpay-signature"] as string;
        if (!signature) {
            return res.status(400).json({ error: "Missing signature" });
        }

        // Verify webhook signature
        // req.body is already a buffer because of express.raw() middleware in index.ts
        const body = req.body.toString();
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(body)
            .digest("hex");

        const isValidSignature = crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );

        if (!isValidSignature) {
            console.error("Invalid webhook signature");
            return res.status(400).json({ error: "Invalid signature" });
        }

        // Parse the event
        const event = JSON.parse(body);
        const eventType = event.event;
        const payload = event.payload;

        console.log(`Received Razorpay webhook: ${eventType}`);

        switch (eventType) {
            case "payment.captured":
                await handlePaymentCaptured(payload);
                break;
            case "subscription.charged":
                await handleSubscriptionCharged(payload);
                break;
            case "subscription.pending":
            case "subscription.halted":
            case "subscription.cancelled":
            case "payment.failed":
                await handleSubscriptionStatusChange(eventType, payload);
                break;
            // Add other events as needed
        }

        return res.status(200).json({ status: "ok" });
    } catch (error: any) {
        console.error("Webhook error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// handle payment.captured event for sponsors
async function handlePaymentCaptured(payload: any) {
    const payment = payload.payment.entity;
    const paymentId = payment.id;
    const orderId = payment.order_id;
    const amount = payment.amount;
    const currency = payment.currency;

    // extract customer contact details from payment entity (if available in webhook)
    let contactName: string | null = null;
    let contactEmail: string | null = null;
    let contactPhone: string | null = null;

    if (payment.contact) {
        contactPhone = String(payment.contact);
    }
    if (payment.email) {
        contactEmail = payment.email;
    }
    if (payment.notes && payment.notes.name) {
        contactName = payment.notes.name;
    }

    // if contact details not in webhook payload, fetch from razorpay api
    if (!contactPhone || !contactEmail) {
        try {
            const paymentDetails = await rz_instance.payments.fetch(paymentId);
            if (paymentDetails.contact && !contactPhone) {
                contactPhone = String(paymentDetails.contact);
            }
            if (paymentDetails.email && !contactEmail) {
                contactEmail = paymentDetails.email;
            }
            if (paymentDetails.notes && paymentDetails.notes.name && !contactName) {
                contactName = paymentDetails.notes.name;
            }
        } catch (error) {
            console.error("failed to fetch payment details from razorpay:", error);
            // continue without contact details if fetch fails
        }
    }
    
    // check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
        where: { razorpayPaymentId: paymentId },
    });

    if (!existingPayment) {
        // create payment record without user (for sponsors)
        await prisma.payment.create({
            data: {
                razorpayPaymentId: paymentId,
                razorpayOrderId: orderId,
                amount: amount,
                currency: currency,
                status: "captured",
            },
        });
    }

    // create or update sponsor record with pending_submission status
    const existingSponsor = await prisma.sponsor.findFirst({
        where: { razorpay_payment_id: paymentId },
    });

    if (!existingSponsor) {
        await prisma.sponsor.create({
            data: {
                razorpay_payment_id: paymentId,
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
}

async function handleSubscriptionCharged(payload: any) {
    const payment = payload.payment.entity;
    const subscription = payload.subscription.entity;

    // Update sponsor status to active if it matches a known subscription
    // We might need to link subscription ID to sponsor if not already linked
    // But typically we link via payment ID or subscription ID

    const subId = subscription.id;

    // Find sponsor by subscription ID or payment ID
    // If this is the first payment, we might not have subId in sponsor table yet if we only saved paymentId
    // But in our flow, we create sponsor record AFTER payment success on frontend, 
    // or we can create it here if it doesn't exist? 
    // The user flow says: "Backend stores images + metadata -> Sponsor is marked active"
    // So the webhook is mainly for RECURRING payments or status updates.
    // For the initial payment, the frontend calls `submitAssets` which sets it to active.

    // However, if the subscription is charged (renewal), we should ensure it's active.

    await prisma.sponsor.updateMany({
        where: {
            razorpay_sub_id: subId,
        },
        data: {
            plan_status: "active",
        },
    });
}

async function handleSubscriptionStatusChange(eventType: string, payload: any) {
    const subscription = payload.subscription ? payload.subscription.entity : null;
    const payment = payload.payment ? payload.payment.entity : null;

    let subId = subscription ? subscription.id : null;

    // If we don't have subscription entity directly (e.g. payment.failed), try to get from payment
    if (!subId && payment && payment.description) {
        // sometimes description contains sub id or we check notes
    }

    if (!subId) return;

    let newStatus = "active";
    if (eventType === "subscription.pending") newStatus = "pending_payment";
    if (eventType === "subscription.halted") newStatus = "unpaid"; // or halted
    if (eventType === "subscription.cancelled") newStatus = "cancelled";
    if (eventType === "payment.failed") newStatus = "failed";

    await prisma.sponsor.updateMany({
        where: {
            razorpay_sub_id: subId,
        },
        data: {
            plan_status: newStatus,
        },
    });
}

// No changes required for webhook handlers in this change set.
