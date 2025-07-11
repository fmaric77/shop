import { NextRequest, NextResponse } from 'next/server';
import { getGrokInstance } from '@/lib/grok';
import { getAzureOpenAIInstance } from '@/lib/azureOpenAI';
import connectDB from '@/lib/mongodb';
import StoreSettings from '@/models/StoreSettings';

// POST /api/ai/generate-tags - Generate product tags
export async function POST(request: NextRequest) {
  try {
    const { productTitle, description, category } = await request.json();
    
    if (!productTitle) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }
    
    // Determine AI provider
    await connectDB();
    const settings = await StoreSettings.findById('store-settings');
    const provider = settings?.ai?.provider || 'grok';
    let tags: string[] = [];
    if (provider === 'azureOpenAI' && settings.ai.azureOpenAI?.enabled) {
      const azureAI = await getAzureOpenAIInstance();
      if (azureAI) {
        // Azure generateTags expects full product data
        const generated = await azureAI.generateTags({
          title: productTitle,
          description: description || '',
          category: category || '',
          price: 0,
        });
        tags = generated;
      }
    } else {
      const grok = await getGrokInstance();
      if (grok) {
        const result = await grok.generateProductTags(productTitle, description || '', category || '');
        if (result.success) {
          tags = result.data.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
        }
      }
    }
    if (tags.length === 0) {
      return NextResponse.json({ error: 'AI is not configured or failed to generate tags' }, { status: 500 });
    }
    
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error generating product tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
