import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminAuthEdge';
import { checkIPBan, recordAdminAccessAttempt } from '@/lib/ipBanEdge';

export async function middleware(request: NextRequest) {
  // Check for IP bans first (for any admin access)
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/api/admin/')) {
    
    const banCheck = checkIPBan(request);
    if (banCheck.isBanned) {
      return NextResponse.json(
        { 
          error: `IP permanently banned for unauthorized admin access attempt. Contact administrator for manual unban.`,
          bannedUntil: banCheck.bannedUntil,
          type: 'ip_banned'
        },
        { status: 403 }
      );
    }
  }
  
  // Handle admin page access
  if (request.nextUrl.pathname === '/admin') {
    // This will be handled by the page component, but we'll track attempts there
    return NextResponse.next();
  }
  
  // Protect admin API routes
  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    // Skip the access-attempt endpoint to avoid infinite loops
    if (request.nextUrl.pathname === '/api/admin/access-attempt') {
      return NextResponse.next();
    }
    
    const adminCheck = await verifyAdminToken(request);
    
    if (!adminCheck.success) {
      // Record unauthorized API access attempt
      const banResult = recordAdminAccessAttempt(request);
      
      let errorMessage = adminCheck.error || 'Access denied';
      if (banResult.shouldBan) {
        errorMessage = `Access denied. IP permanently banned for unauthorized admin access attempt.`;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          attemptsRemaining: banResult.attemptsRemaining,
          shouldBan: banResult.shouldBan,
          bannedUntil: banResult.bannedUntil
        },
        { status: adminCheck.error === 'No authentication token' ? 401 : 403 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/api/admin/:path*'
  ],
};
