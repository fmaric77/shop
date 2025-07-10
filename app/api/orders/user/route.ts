import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Check if user is authenticated
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get user's orders
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent orders
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 });
  }
}
