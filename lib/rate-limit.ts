// Simple in-memory rate limiting (production should use Redis/Upstash)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Rate limiter factory
function createRateLimiter(limit: number, windowMs: number) {
  return {
    limit: async (identifier: string) => {
      const key = identifier;
      const now = Date.now();

      const record = rateLimitStore.get(key);
      
      // Clean expired records periodically
      if (record && now > record.resetAt) {
        rateLimitStore.delete(key);
      }

      const currentRecord = rateLimitStore.get(key);

      if (!currentRecord) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return { 
          success: true, 
          limit: limit, 
          remaining: limit - 1, 
          reset: now + windowMs 
        };
      }

      if (currentRecord.count >= limit) {
        return { 
          success: false, 
          limit: limit, 
          remaining: 0, 
          reset: currentRecord.resetAt 
        };
      }

      currentRecord.count++;
      return { 
        success: true, 
        limit: limit, 
        remaining: limit - currentRecord.count, 
        reset: currentRecord.resetAt 
      };
    },
  };
}

// Rate limiters for different endpoints
export const loginRateLimit = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const registerRateLimit = createRateLimiter(3, 60 * 60 * 1000); // 3 registrations per hour
export const forgotPasswordRateLimit = createRateLimiter(3, 60 * 60 * 1000); // 3 requests per hour
export const otpVerifyRateLimit = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const otpResendRateLimit = createRateLimiter(2, 10 * 60 * 1000); // 2 resends per 10 minutes
export const contactRateLimit = createRateLimiter(5, 60 * 60 * 1000); // 5 messages per hour
export const chatRateLimit = createRateLimiter(30, 60 * 1000); // 30 messages per minute
export const apiRateLimit = createRateLimiter(100, 60 * 1000); // 100 requests per minute

// Helper to get identifier from request
export function getRateLimitIdentifier(req: Request): string {
  // Try to get IP from headers (Vercel, Cloudflare, etc.)
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";

  return ip;
}
