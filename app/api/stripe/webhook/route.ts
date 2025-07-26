import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  // Ensure Stripe secret key is defined
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY environment variable is required' }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-06-30.basil' });
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!endpointSecret) {
      // For development, we'll skip signature verification
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  try {
    await connectDB();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Get line items from the session
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ['data.price.product'],
      });

      // Create order record
      const orderData: Record<string, unknown> = {
        stripeSessionId: session.id,
        customerEmail: session.customer_details?.email,
        customerName: session.customer_details?.name,
        total: session.amount_total ? session.amount_total / 100 : 0,
        status: 'paid',
        shippingAddress:
          (typeof ((session as unknown as { shipping_details?: unknown }).shipping_details) === 'object' &&
            (session as unknown as { shipping_details?: { address?: unknown } }).shipping_details &&
            'address' in (session as unknown as { shipping_details?: { address?: unknown } }).shipping_details!
          )
            ? ((session as unknown as { shipping_details: { address?: unknown } }).shipping_details.address)
            : undefined,
        items: lineItems.data.map((item) => ({
          title: (item.price?.product as Stripe.Product)?.name || 'Unknown Product',
          price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
          quantity: item.quantity || 1,
        })),
        isGuestOrder: true, // Default to guest order
      };

      // Check if this order is from an authenticated user
      if (session.metadata?.userId) {
        orderData.userId = session.metadata.userId;
        orderData.isGuestOrder = false;
      }

      await Order.create(orderData);
      
      console.log('Order created for session:', session.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
