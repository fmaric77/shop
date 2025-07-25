
import { NextRequest } from 'next/server';
import connectDB from './mongodb';
import BannedIP from '@/models/BannedIP';


interface IPBanOptions {
  maxAttempts: number; // Maximum attempts before ban
  attemptWindowMs: number; // Time window for tracking attempts
  banDurationMs: number; // How long to ban the IP
}

// In-memory adminAttempts for rate limiting (not persisted, but not critical)
const adminAttempts = new Map<string, { count: number; firstAttempt: number }>();


const defaultBanOptions: IPBanOptions = {
  maxAttempts: 1, // 1 unauthorized admin access attempt = immediate ban
  attemptWindowMs: 10 * 60 * 1000, // 10 minutes window (not really relevant with 1 attempt)
  banDurationMs: 365 * 24 * 60 * 60 * 1000, // 1 year ban (effectively permanent)
};


export async function checkIPBanAsync(request: NextRequest): Promise<{
  isBanned: boolean;
  bannedUntil?: number;
  attemptsRemaining?: number;
}> {
  const ip = getClientIP(request);
  const now = Date.now();
  await connectDB();
  const banInfo = await BannedIP.findOne({ ip });
  if (banInfo && banInfo.bannedUntil > now) {
    return {
      isBanned: true,
      bannedUntil: banInfo.bannedUntil,
    };
  }
  // If ban has expired, remove it
  if (banInfo && banInfo.bannedUntil <= now) {
    await BannedIP.deleteOne({ ip });
    adminAttempts.delete(ip);
  }
  return { isBanned: false };
}


export async function recordAdminAccessAttemptAsync(
  request: NextRequest,
  options: Partial<IPBanOptions> = {}
): Promise<{
  shouldBan: boolean;
  attemptsRemaining: number;
  bannedUntil?: number;
}> {
  const { maxAttempts, attemptWindowMs, banDurationMs } = { ...defaultBanOptions, ...options };
  const ip = getClientIP(request);
  const now = Date.now();
  // Clean up old attempts
  cleanupExpiredAttempts(now - attemptWindowMs);
  // Get or create attempt record (in-memory)
  let attempts = adminAttempts.get(ip);
  if (!attempts || attempts.firstAttempt + attemptWindowMs < now) {
    attempts = { count: 1, firstAttempt: now };
  } else {
    attempts.count++;
  }
  adminAttempts.set(ip, attempts);
  // Check if should ban
  if (attempts.count >= maxAttempts) {
    const bannedUntil = now + banDurationMs;
    await connectDB();
    await BannedIP.findOneAndUpdate(
      { ip },
      { ip, bannedUntil, attempts: attempts.count },
      { upsert: true, new: true }
    );
    adminAttempts.delete(ip);
    console.warn(`IP ${ip} banned until ${new Date(bannedUntil)} for ${attempts.count} unauthorized admin access attempts`);
    return { shouldBan: true, attemptsRemaining: 0, bannedUntil };
  }
  return { shouldBan: false, attemptsRemaining: maxAttempts - attempts.count };
}


export async function getBannedIPsAsync(): Promise<Array<{ ip: string; bannedUntil: number; attempts: number }>> {
  await connectDB();
  const now = Date.now();
  const docs = await BannedIP.find({ bannedUntil: { $gt: now } });
  return docs.map(doc => ({ ip: doc.ip, bannedUntil: doc.bannedUntil, attempts: doc.attempts }));
}


export async function manuallyUnbanIPAsync(ip: string): Promise<boolean> {
  await connectDB();
  const res = await BannedIP.deleteOne({ ip });
  adminAttempts.delete(ip);
  return res.deletedCount > 0;
}

// Extract client IP address (same as rate limit)
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  if (cfConnectingIP) return cfConnectingIP;
  return 'unknown';
}

// Clean up expired attempt records (in-memory only)
function cleanupExpiredAttempts(cutoffTime: number) {
  for (const [ip, attempts] of adminAttempts.entries()) {
    if (attempts.firstAttempt < cutoffTime) {
      adminAttempts.delete(ip);
    }
  }
}

// Edge-compatible synchronous functions for middleware (in-memory only)
export function checkIPBan(request: NextRequest): {
  isBanned: boolean;
  bannedUntil?: number;
  attemptsRemaining?: number;
} {
  const ip = getClientIP(request);
  const now = Date.now();
  
  // Check in-memory attempts (simplified check)
  const attempts = adminAttempts.get(ip);
  if (attempts && attempts.count >= defaultBanOptions.maxAttempts) {
    const bannedUntil = attempts.firstAttempt + defaultBanOptions.banDurationMs;
    if (bannedUntil > now) {
      return {
        isBanned: true,
        bannedUntil,
      };
    } else {
      // Ban expired, clean up
      adminAttempts.delete(ip);
    }
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
  
  // Get or create attempt record (in-memory only)
  let attempts = adminAttempts.get(ip);
  if (!attempts || attempts.firstAttempt + attemptWindowMs < now) {
    attempts = { count: 1, firstAttempt: now };
  } else {
    attempts.count++;
  }
  adminAttempts.set(ip, attempts);
  
  // Check if should ban (in-memory only - MongoDB will be updated by API route)
  if (attempts.count >= maxAttempts) {
    const bannedUntil = now + banDurationMs;
    console.warn(`IP ${ip} marked for ban until ${new Date(bannedUntil)} for ${attempts.count} unauthorized admin access attempts`);
    return { shouldBan: true, attemptsRemaining: 0, bannedUntil };
  }
  
  return { shouldBan: false, attemptsRemaining: maxAttempts - attempts.count };
}
