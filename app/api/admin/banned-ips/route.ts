import { NextRequest, NextResponse } from 'next/server';
import { getBannedIPsAsync, manuallyUnbanIPAsync } from '@/lib/ipBan';
import { verifyAdmin } from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json(
        { error: adminCheck.error || 'Access denied' },
        { status: adminCheck.error === 'No authentication token' ? 401 : 403 }
      );
    }
    const bannedIPs = await getBannedIPsAsync();
    return NextResponse.json({ bannedIPs });
  } catch (error) {
    console.error('Error fetching banned IPs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json(
        { error: adminCheck.error || 'Access denied' },
        { status: adminCheck.error === 'No authentication token' ? 401 : 403 }
      );
    }
    const { ip } = await request.json();
    if (!ip) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      );
    }
    const wasUnbanned = await manuallyUnbanIPAsync(ip);
    return NextResponse.json({ 
      success: true, 
      message: wasUnbanned ? `IP ${ip} has been unbanned` : `IP ${ip} was not banned`
    });
  } catch (error) {
    console.error('Error unbanning IP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
