import { NextRequest, NextResponse } from 'next/server';
import { recordAdminAccessAttemptAsync } from '@/lib/ipBan';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Record the unauthorized admin access attempt
    const result = await recordAdminAccessAttemptAsync(request);
    
    const response = {
      attemptsRemaining: result.attemptsRemaining,
      shouldBan: result.shouldBan,
      bannedUntil: result.bannedUntil,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error recording admin access attempt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
