import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';

// GET /api/reviews/can-review?productId=xxx - Check if user can review a product
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ canReview: false, reason: 'Not authenticated' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch {
      return NextResponse.json({ canReview: false, reason: 'Invalid token' });
    }
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ userId: decoded.userId, productId });
    if (existingReview) {
      return NextResponse.json({ canReview: false, reason: 'Already reviewed' });
    }
    
    // Check if user has purchased this product
    const order = await Order.findOne({
      userId: decoded.userId,
      status: 'paid',
      'items.productId': productId,
    });
    
    if (!order) {
      return NextResponse.json({ canReview: false, reason: 'Must purchase product first' });
    }
    
    return NextResponse.json({ canReview: true, reason: 'Eligible to review' });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
