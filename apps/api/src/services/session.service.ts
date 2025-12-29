import type { PrismaClient } from "@prisma/client";
import type { ExtendedPrismaClient } from "../prisma.js";
import { SUBSCRIPTION_STATUS } from "../constants/subscription.js";

export const sessionService = {
  /**
   * Get all sessions for authenticated paid users
   * Sessions are ordered by sessionDate descending (newest first)
   */
  async getSessions(
    prisma: ExtendedPrismaClient | PrismaClient,
    userId: string
  ) {
    // verify user has active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        endDate: {
          gte: new Date(),
        },
      },
    });

    if (!subscription) {
      throw new Error("Active subscription required to access sessions");
    }

    // fetch only fields needed by the web ui; keep topics ordered
    const sessions = await prisma.weeklySession.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        youtubeUrl: true,
        sessionDate: true,
        topics: {
          select: {
            id: true,
            timestamp: true,
            topic: true,
            order: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        sessionDate: "desc",
      },
    });

    return sessions;
  },
};

