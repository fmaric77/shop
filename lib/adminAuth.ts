import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Full admin verification with database access (for API routes)
export async function verifyAdmin(request: NextRequest): Promise<{
  success: boolean;
  user?: unknown;
  error?: string;
}> {
  try {
    await connectDB();
    
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, error: 'No authentication token' };
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string };
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if user is admin
    if (!user.isAdmin && user.role !== 'admin') {
      return { success: false, error: 'Access denied. Admin privileges required.' };
    }

    return { success: true, user };
  } catch (error: unknown) {
    console.error('Admin verification error:', error);
    return { success: false, error: 'Invalid authentication token' };
  }
}

export function createAdminOnlyResponse(error: string) {
  return NextResponse.json(
    { error },
    { status: 403 }
  );
}

export function createUnauthorizedResponse(error: string) {
  return NextResponse.json(
    { error },
    { status: 401 }
  );
}
