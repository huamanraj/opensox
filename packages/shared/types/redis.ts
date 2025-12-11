import Redis from "ioredis";

declare global {
    // eslint-disable-next-line no-var
    var redis: Redis | undefined;
}

let redis: Redis | undefined;

/**
 * Get or create a Redis client instance
 * Uses singleton pattern in development to prevent multiple connections
 */
export function getRedisClient(): Redis | null {
    // If Redis URL is not configured, return null (graceful degradation)
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
        console.warn("REDIS_URL not configured. Redis caching is disabled.");
        return null;
    }

    try {
        // In development, use global to prevent multiple instances
        if (process.env.NODE_ENV === "development") {
            if (!global.redis) {
                global.redis = new Redis(redisUrl, {
                    maxRetriesPerRequest: 3,
                    retryStrategy(times) {
                        const delay = Math.min(times * 50, 2000);
                        return delay;
                    },
                    lazyConnect: true,
                });

                global.redis.on("error", (err) => {
                    console.error("Redis connection error:", err);
                });

                global.redis.on("connect", () => {
                    console.log("Redis connected successfully");
                });
            }
            redis = global.redis;
        } else {
            // In production, create a new instance if not exists
            if (!redis) {
                redis = new Redis(redisUrl, {
                    maxRetriesPerRequest: 3,
                    retryStrategy(times) {
                        const delay = Math.min(times * 50, 2000);
                        return delay;
                    },
                });

                redis.on("error", (err) => {
                    console.error("Redis connection error:", err);
                });
            }
        }

        return redis;
    } catch (error) {
        console.error("Failed to create Redis client:", error);
        return null;
    }
}

/**
 * Cache helper functions
 */
export const redisCache = {
    /**
     * Get a value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        const client = getRedisClient();
        if (!client) return null;

        try {
            const value = await client.get(key);
            if (!value) return null;
            return JSON.parse(value) as T;
        } catch (error) {
            console.error(`Redis GET error for key ${key}:`, error);
            return null;
        }
    },

    /**
     * Set a value in cache with optional TTL (in seconds)
     */
    async set(key: string, value: any, ttl?: number): Promise<boolean> {
        const client = getRedisClient();
        if (!client) return false;

        try {
            const serialized = JSON.stringify(value);
            if (ttl) {
                await client.setex(key, ttl, serialized);
            } else {
                await client.set(key, serialized);
            }
            return true;
        } catch (error) {
            console.error(`Redis SET error for key ${key}:`, error);
            return false;
        }
    },

    /**
     * Delete a value from cache
     * Use this to invalidate a specific cache key after mutations (create, update, delete)
     * Example: await redisCache.del('testimonials:all') after creating/updating a testimonial
     */
    async del(key: string): Promise<boolean> {
        const client = getRedisClient();
        if (!client) return false;

        try {
            await client.del(key);
            console.log(`Cache invalidated for key: ${key}`);
            return true;
        } catch (error) {
            console.error(`Redis DEL error for key ${key}:`, error);
            return false;
        }
    },

    /**
     * Delete multiple keys matching a pattern
     */
    async delPattern(pattern: string): Promise<boolean> {
        const client = getRedisClient();
        if (!client) return false;

        try {
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(...keys);
            }
            return true;
        } catch (error) {
            console.error(`Redis DEL pattern error for ${pattern}:`, error);
            return false;
        }
    },
};
