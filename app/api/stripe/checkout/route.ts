import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import StoreSettings from '@/models/StoreSettings';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function POST(request: NextRequest) {
  try {
    // Load Stripe secret key from StoreSettings
    await connectDB();
    const settings = await StoreSettings.findById('store-settings');
    const secretKey = settings?.stripe?.secretKey;
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe secret key not configured in store settings' }, { status: 500 });
    }
    const stripe = new Stripe(secretKey, { apiVersion: '2025-06-30.basil' });
    
    const { items } = await request.json();
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Check if user is authenticated
    let user = null;
    const token = request.cookies.get('auth-token')?.value;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        user = await User.findById(decoded.userId);
      } catch {
        // Invalid token, proceed as guest
        console.log('Invalid token, proceeding as guest checkout');
      }
    }

    // Validate and fetch product details
    const lineItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
      }
      
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.title,
            description: product.description,
            images: product.image ? [product.image] : [],
          },
          unit_amount: Math.round(product.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      });
    }

    // Prepare session configuration
    const sessionConfig: Record<string, unknown> = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/cart`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES'],
      },
    };

    // If user is authenticated, pre-fill their information
    if (user) {
      sessionConfig.customer_email = user.email;
      sessionConfig.metadata = {
        userId: user._id.toString(),
      };
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
