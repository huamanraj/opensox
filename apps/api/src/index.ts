import dotenv from "dotenv";
import express from "express";
import type { Request, Response } from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./routers/_app.js";
import { createContext } from "./context.js";
import prismaModule from "./prisma.js";
import cors from "cors";
import type { CorsOptions as CorsOptionsType } from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import ipBlocker from "./middleware/ipBlock.js";
import crypto from "crypto";
import { paymentService } from "./services/payment.service.js";
import { verifyToken } from "./utils/auth.js";
import { SUBSCRIPTION_STATUS } from "./constants/subscription.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5000"];

// Security headers
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  })
);

// Apply IP blocking middleware first
app.use(ipBlocker.middleware);

// Different rate limits for different endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`[RATE LIMIT] IP ${req.ip} hit API rate limit`);
    res.status(429).json({ error: "Too many requests from this IP" });
  }
});

// Request size limits (except for webhook - needs raw body)
app.use("/webhook/razorpay", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb", extended: true }));

// CORS configuration
const corsOptions: CorsOptionsType = {
  origin: (origin, callback) => {
    if (!origin || CORS_ORIGINS.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Blocked IPs endpoint (admin endpoint)
app.get("/admin/blocked-ips", (req: Request, res: Response) => {
  const blockedIPs = ipBlocker.getBlockedIPs();
  res.json({
    blockedIPs: blockedIPs.map((ip) => ({
      ...ip,
      blockedUntil: new Date(ip.blockedUntil).toISOString(),
    })),
  });
});

// Test endpoint
app.get("/test", apiLimiter, (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Test endpoint is working" });
});

// Slack Community Invite Endpoint (Protected)
app.get("/join-community", apiLimiter, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized - Authorization header with Bearer token required",
      });
    }

    const token = authHeader.substring(7);

    // Verify token and get user
    let user;
    try {
      user = await verifyToken(token);
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }

    // Check if user has an active subscription
    const subscription = await prismaModule.prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        endDate: {
          gte: new Date(),
        },
      },
    });

    if (!subscription) {
      return res.status(403).json({
        error: "Forbidden - Active subscription required to join community",
      });
    }

    // Get Slack invite URL from environment
    const slackInviteUrl = process.env.SLACK_INVITE_URL;
    if (!slackInviteUrl) {
      console.error("SLACK_INVITE_URL not configured");
      return res.status(500).json({ error: "Community invite not configured" });
    }

    return res.status(200).json({
      slackInviteUrl,
      message: "Subscription verified. You can join the community.",
    });
  } catch (error: any) {
    console.error("Community invite error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

import { handleRazorpayWebhook } from "./webhooks.js";

// Razorpay Webhook Handler
app.post("/webhook/razorpay", handleRazorpayWebhook);

// Connect to database
prismaModule.connectDB();

// Apply rate limiting to tRPC endpoints
app.use("/trpc", apiLimiter);

// tRPC middleware
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Global error handling
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`tRPC server running on http://localhost:${PORT}`);
});
