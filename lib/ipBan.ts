import { NextRequest } from 'next/server';

// In-memory store for IP bans and failed attempts
const bannedIPs = new Map<string, { bannedUntil: number; attempts: number }>();
const adminAttempts = new Map<string, { count: number; firstAttempt: number }>();

interface IPBanOptions {
  maxAttempts: number; // Maximum attempts before ban
  attemptWindowMs: number; // Time window for tracking attempts
  banDurationMs: number; // How long to ban the IP
}

const defaultBanOptions: IPBanOptions = {
  maxAttempts: 1, // 1 unauthorized admin access attempt = immediate ban
  attemptWindowMs: 10 * 60 * 1000, // 10 minutes window (not really relevant with 1 attempt)
  banDurationMs: 365 * 24 * 60 * 60 * 1000, // 1 year ban (effectively permanent)
};

export function checkIPBan(request: NextRequest): {
  isBanned: boolean;
  bannedUntil?: number;
  attemptsRemaining?: number;
} {
  const ip = getClientIP(request);
  const now = Date.now();
  
  // Check if IP is currently banned
  const banInfo = bannedIPs.get(ip);
  if (banInfo && banInfo.bannedUntil > now) {
    return {
      isBanned: true,
      bannedUntil: banInfo.bannedUntil,
    };
  }
  
  // If ban has expired, remove it
  if (banInfo && banInfo.bannedUntil <= now) {
    bannedIPs.delete(ip);
    adminAttempts.delete(ip);
  }
  
  return { isBanned: false };
}

export function recordAdminAccessAttempt(
  request: NextRequest, 
  options: Partial<IPBanOptions> = {}
): {
  shouldBan: boolean;
  attemptsRemaining: number;
  bannedUntil?: number;
} {
  const { maxAttempts, attemptWindowMs, banDurationMs } = { ...defaultBanOptions, ...options };
  const ip = getClientIP(request);
  const now = Date.now();
  
  // Clean up old attempts
  cleanupExpiredAttempts(now - attemptWindowMs);
  
  // Get or create attempt record
  let attempts = adminAttempts.get(ip);
  
  if (!attempts || attempts.firstAttempt + attemptWindowMs < now) {
    // First attempt or window expired, reset
    attempts = {
      count: 1,
      firstAttempt: now,
    };
  } else {
    // Increment attempts within window
    attempts.count++;
  }
  
  adminAttempts.set(ip, attempts);
  
  // Check if should ban
  if (attempts.count >= maxAttempts) {
    const bannedUntil = now + banDurationMs;
    bannedIPs.set(ip, {
      bannedUntil,
      attempts: attempts.count,
    });
    
    // Clean up attempts record since IP is now banned
    adminAttempts.delete(ip);
    
    console.warn(`IP ${ip} banned until ${new Date(bannedUntil)} for ${attempts.count} unauthorized admin access attempts`);
    
    return {
      shouldBan: true,
      attemptsRemaining: 0,
      bannedUntil,
    };
  }
  
  return {
    shouldBan: false,
    attemptsRemaining: maxAttempts - attempts.count,
  };
}

export function getBannedIPs(): Array<{ ip: string; bannedUntil: number; attempts: number }> {
  const now = Date.now();
  const activeBans: Array<{ ip: string; bannedUntil: number; attempts: number }> = [];
  
  for (const [ip, banInfo] of bannedIPs.entries()) {
    if (banInfo.bannedUntil > now) {
      activeBans.push({
        ip,
        bannedUntil: banInfo.bannedUntil,
        attempts: banInfo.attempts,
      });
    }
  }
  
  return activeBans;
}

export function manuallyUnbanIP(ip: string): boolean {
  const wasBanned = bannedIPs.has(ip);
  bannedIPs.delete(ip);
  adminAttempts.delete(ip);
  return wasBanned;
}

// Extract client IP address (same as rate limit)
function getClientIP(request: NextRequest): string {
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
  
  return 'unknown';
}

// Clean up expired attempt records
function cleanupExpiredAttempts(cutoffTime: number) {
  for (const [ip, attempts] of adminAttempts.entries()) {
    if (attempts.firstAttempt < cutoffTime) {
      adminAttempts.delete(ip);
    }
  }
  
  // Also clean up expired bans
  const now = Date.now();
  for (const [ip, banInfo] of bannedIPs.entries()) {
    if (banInfo.bannedUntil <= now) {
      bannedIPs.delete(ip);
    }
  }
}
