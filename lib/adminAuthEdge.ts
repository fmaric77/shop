import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Lightweight admin verification for Edge Runtime (no database access)
export async function verifyAdminToken(request: NextRequest): Promise<{
  success: boolean;
  user?: { _id: string; email: string; role: string; isAdmin: boolean };
  error?: string;
}> {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, error: 'No authentication token' };
    }

    // Verify token and check admin status from JWT payload
    const decoded = jwt.verify(token, JWT_SECRET as string) as { 
      userId: string; 
      email: string; 
      role: string; 
      isAdmin: boolean 
    };
    
    // Check if user is admin based on JWT payload
    if (!decoded.isAdmin) {
      return { success: false, error: 'Admin access required' };
    }

    return { 
      success: true, 
      user: { 
        _id: decoded.userId, 
        email: decoded.email, 
        role: decoded.role, 
        isAdmin: decoded.isAdmin 
      } 
    };
  } catch (error: unknown) {
    console.error('Admin verification error:', error);
    return { success: false, error: 'Invalid or expired token' };
  }
}
