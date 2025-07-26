import { NextRequest } from 'next/server';

// In-memory store for rate limiting (consider using Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests } = options;

  return function checkRateLimit(request: NextRequest): {
    success: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
  } {
    // Generate key for rate limiting using IP address
    const key = getClientIP(request);
    
    const now = Date.now();

    // Clean up expired entries periodically
    cleanupExpiredEntries(now - windowMs);

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime <= now) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
      
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;

    if (entry.count > maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  };
}

// Extract client IP address
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback for unknown IP
  return 'unknown';
}

// Clean up expired entries to prevent memory leaks
function cleanupExpiredEntries(cutoffTime: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime <= cutoffTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Rate limit configurations for authentication endpoints
export const authLoginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
});

export const authRegisterRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 registrations per hour per IP
});
