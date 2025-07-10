import { NextRequest, NextResponse } from 'next/server';
import { getGrokInstance } from '@/lib/grok';

// POST /api/ai/generate-description - Generate product description
export async function POST(request: NextRequest) {
  try {
    const { productTitle, category, features } = await request.json();
    
    if (!productTitle) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }
    
    const grok = await getGrokInstance();
    if (!grok) {
      return NextResponse.json({ error: 'Grok AI is not configured' }, { status: 400 });
    }
    
    const result = await grok.generateProductDescription(productTitle, category || '', features || []);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json({ description: result.data });
  } catch (error) {
    console.error('Error generating product description:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
