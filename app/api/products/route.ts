import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
      
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, description, price, category, tags, image } = body;

    if (!title || !price || !category) {
      return NextResponse.json({ 
        error: 'Title, price, and category are required' 
      }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const product = new Product({
      title,
      description,
      price: parseFloat(price),
      category,
      tags: tags || [],
      image,
      slug,
    });

    await product.save();
    await product.populate('category', 'name slug');
    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as { code: number }).code === 11000) {
      return NextResponse.json({ error: 'Product already exists' }, { status: 400 });
    }
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
