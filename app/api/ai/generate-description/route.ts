import { NextRequest, NextResponse } from 'next/server';
import { getGrokInstance } from '@/lib/grok';
import { getAzureOpenAIInstance } from '@/lib/azureOpenAI';
import connectDB from '@/lib/mongodb';
import StoreSettings from '@/models/StoreSettings';

export async function POST(request: NextRequest) {
  try {
    const { productTitle, category, features } = await request.json();
    
    if (!productTitle) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }
    
    await connectDB();
    // Determine AI provider
    const settings = await StoreSettings.findById('store-settings');
    const provider = settings?.ai?.provider || 'grok';
    let description: string | null = null;
    if (provider === 'azureOpenAI' && settings.ai.azureOpenAI?.enabled) {
      const azureAI = await getAzureOpenAIInstance();
      if (azureAI) {
        const prompt = `Generate a compelling product description for the following product:\nTitle: ${productTitle}\nCategory: ${category || ''}\nFeatures: ${features?.join(', ') || ''}`;
        description = await azureAI.generateText(prompt);
      }
    } else {
      const grok = await getGrokInstance();
      if (grok) {
        const result = await grok.generateProductDescription(productTitle, category || '', features || []);
        if (result.success) {
          description = result.data;
        }
      }
    }
    if (!description) {
      return NextResponse.json({ error: 'AI is not configured or failed to generate description' }, { status: 500 });
    }
     
    return NextResponse.json({ description });
  } catch (error) {
    console.error('Error generating product description:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
