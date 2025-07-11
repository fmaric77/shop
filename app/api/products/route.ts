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
    const { title, description, detailedDescription, price, category, tags, images } = body;

    if (!title || !price || !category) {
      return NextResponse.json({ 
        error: 'Title, price, and category are required' 
      }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Format images array of URLs into objects
    const formattedImages = Array.isArray(images)
      ? images.map((url: string, idx: number) => ({ url, alt: '', order: idx }))
      : [];
    const product = new Product({
      title,
      description,
      detailedDescription,
      price: parseFloat(price),
      category,
      tags: tags || [],
      images: formattedImages,
      // For legacy support, set first image as `image` field
      image: formattedImages[0]?.url || '',
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
