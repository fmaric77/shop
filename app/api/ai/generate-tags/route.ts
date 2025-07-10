import { NextRequest, NextResponse } from 'next/server';
import { getGrokInstance } from '@/lib/grok';

// POST /api/ai/generate-tags - Generate product tags
export async function POST(request: NextRequest) {
  try {
    const { productTitle, description, category } = await request.json();
    
    if (!productTitle) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }
    
    const grok = await getGrokInstance();
    if (!grok) {
      return NextResponse.json({ error: 'Grok AI is not configured' }, { status: 400 });
    }
    
    const result = await grok.generateProductTags(productTitle, description || '', category || '');
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    // Parse the tags from the response
    const tags = result.data.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
    
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error generating product tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
