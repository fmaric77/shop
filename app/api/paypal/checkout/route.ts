import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import StoreSettings from '@/models/StoreSettings';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function POST(request: NextRequest) {
  try {
    // Load PayPal settings from StoreSettings
    await connectDB();
    const settings = await StoreSettings.findById('store-settings');
    const paypalConfig = settings?.paypal;
    
    if (!paypalConfig?.clientId || !paypalConfig?.secret) {
      return NextResponse.json({ error: 'PayPal not configured in store settings' }, { status: 500 });
    }
    
    const { items } = await request.json();
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Check if user is authenticated
    interface DecodedToken { userId: string; }
    const token = request.cookies.get('auth-token')?.value;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
        await User.findById(decoded.userId); // Authentication check, but user object not used
      } catch {
        console.log('Invalid token, proceeding as guest checkout');
      }
    }

    // Validate and calculate total
    let totalAmount = 0;
    const itemDetails = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      itemDetails.push({
        name: product.title,
        unit_amount: {
          currency_code: 'USD',
          value: product.price.toFixed(2)
        },
        quantity: item.quantity.toString()
      });
    }

    // Create PayPal order
    const baseUrl = paypalConfig.mode === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    // Get PayPal access token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${Buffer.from(`${paypalConfig.clientId}:${paypalConfig.secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!authResponse.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Create order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `order-${Date.now()}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: totalAmount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: totalAmount.toFixed(2)
              }
            }
          },
          items: itemDetails
        }],
        application_context: {
          return_url: `${process.env.APP_URL || 'http://localhost:3000'}/success`,
          cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/cart`,
          brand_name: 'Your Store',
          user_action: 'PAY_NOW'
        }
      })
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.text();
      console.error('PayPal order creation failed:', errorData);
      throw new Error('Failed to create PayPal order');
    }

    const orderData = await orderResponse.json();
    
    // Find the approval URL
    interface PayPalLink { rel: string; href: string; }
    const approvalUrl = (orderData.links as PayPalLink[])
      ?.find((link: PayPalLink) => link.rel === 'approve')
      ?.href;
    
    if (!approvalUrl) {
      throw new Error('No approval URL found in PayPal response');
    }

    return NextResponse.json({ 
      orderId: orderData.id,
      approvalUrl: approvalUrl
    });

  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: 'Error creating PayPal order' },
      { status: 500 }
    );
  }
}
