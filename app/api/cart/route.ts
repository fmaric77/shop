import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const cart = await Cart.findOne({ sessionId }).populate('items.productId');
    
    return NextResponse.json(cart || { items: [], total: 0 });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Error fetching cart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { sessionId, productId, quantity } = await request.json();
    
    if (!sessionId || !productId || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Retry logic for version conflicts
    let retries = 3;
    while (retries > 0) {
      try {
        let cart = await Cart.findOne({ sessionId });
        
        if (!cart) {
          cart = new Cart({ sessionId, items: [] });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
          (item: { productId: string; quantity: number; price: number }) => 
            item.productId.toString() === productId
        );

        if (existingItemIndex > -1) {
          cart.items[existingItemIndex].quantity += quantity;
        } else {
          cart.items.push({
            productId,
            quantity,
            price: product.price,
          });
        }

        // Calculate total
        cart.total = cart.items.reduce((sum: number, item: { price: number; quantity: number }) => {
          return sum + (item.price * item.quantity);
        }, 0);

        await cart.save();
        
        return NextResponse.json(cart);
      } catch (saveError: unknown) {
        if (saveError instanceof Error && saveError.name === 'VersionError' && retries > 1) {
          retries--;
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }
        throw saveError;
      }
    }
    
    return NextResponse.json({ error: 'Failed to update cart after retries' }, { status: 500 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Error adding to cart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { sessionId, productId } = await request.json();
    
    if (!sessionId || !productId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Retry logic for version conflicts
    let retries = 3;
    while (retries > 0) {
      try {
        const cart = await Cart.findOne({ sessionId });
        
        if (!cart) {
          return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        cart.items = cart.items.filter((item: { productId: string; quantity: number; price: number }) => 
          item.productId.toString() !== productId);
        
        // Recalculate total
        cart.total = cart.items.reduce((sum: number, item: { price: number; quantity: number }) => {
          return sum + (item.price * item.quantity);
        }, 0);

        await cart.save();
        
        return NextResponse.json(cart);
      } catch (saveError: unknown) {
        if (saveError instanceof Error && saveError.name === 'VersionError' && retries > 1) {
          retries--;
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }
        throw saveError;
      }
    }
    
    return NextResponse.json({ error: 'Failed to update cart after retries' }, { status: 500 });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json({ error: 'Error removing from cart' }, { status: 500 });
  }
}
