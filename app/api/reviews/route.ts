import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Order from '@/models/Order';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { updateProductRating } from '@/lib/reviewUtils';

// GET /api/reviews?productId=xxx - Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/reviews - Submit a new review
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { productId, rating, comment } = await request.json();
    
    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Product ID, rating, and comment are required' }, { status: 400 });
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    
    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ userId: decoded.userId, productId });
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 });
    }
    
    // Check if user has purchased this product
    const order = await Order.findOne({
      userId: decoded.userId,
      status: 'paid',
      'items.productId': productId,
    });
    
    if (!order) {
      return NextResponse.json({ error: 'You can only review products you have purchased' }, { status: 403 });
    }
    
    // Create the review
    const review = new Review({
      userId: decoded.userId,
      productId,
      orderId: order._id,
      rating,
      comment,
      userName: user.name,
    });
    
    await review.save();
    
    // Update product rating
    await updateProductRating(productId);
    
    return NextResponse.json({ message: 'Review submitted successfully', review }, { status: 201 });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
