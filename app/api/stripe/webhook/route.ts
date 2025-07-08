import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
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
      const orderData = {
        stripeSessionId: session.id,
        customerEmail: session.customer_details?.email,
        customerName: session.customer_details?.name,
        total: session.amount_total ? session.amount_total / 100 : 0,
        status: 'paid',
        shippingAddress: session.shipping_details?.address,
        items: lineItems.data.map((item) => ({
          title: (item.price?.product as Stripe.Product)?.name || 'Unknown Product',
          price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
          quantity: item.quantity || 1,
        })),
      };

      await Order.create(orderData);
      
      console.log('Order created for session:', session.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
