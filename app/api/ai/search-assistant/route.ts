import { NextRequest, NextResponse } from 'next/server';
import { getGrokInstance } from '@/lib/grok';
import { getAzureOpenAIInstance } from '@/lib/azureOpenAI';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import StoreSettings from '@/models/StoreSettings';

interface ProductType {
  _id: string;
  title: string;
  slug: string;
  price: number;
  description?: string;
  tags?: string[];
  category?: { name: string };
  toObject?: () => Record<string, unknown>;
}

interface SearchAssistantRequest {
  query: string;
  products?: ProductType[];
}

// POST /api/ai/search-assistant - AI-powered chatbot for product assistance
export async function POST(request: NextRequest) {
  try {
    const { query, products }: SearchAssistantRequest = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    await connectDB();
    
    // Get store settings to determine AI provider
    const settings = await StoreSettings.findOne({});
    if (!settings || !settings.ai) {
      return NextResponse.json({ 
        response: "I'm sorry, but the AI assistant is not available right now. However, I can help you search our products manually. What are you looking for?",
        recommendedProducts: []
      });
    }
    
    const aiProvider = settings.ai.provider || 'grok';
    // Get store currency settings
    const { symbol, code } = settings.currency || { symbol: '$', code: 'USD' };
    let aiResponse = null;
    
    // Get fresh product data if not provided
    let availableProducts = products;
    if (!availableProducts || availableProducts.length === 0) {
      // Fetch all products for fallback/recommendations (no artificial limit)
      availableProducts = await Product.find({}).populate('category');
    }
    
    const chatbotPrompt = `You are a concise shopping assistant. Use ${symbol} for prices (currency code: ${code}). Do not include currency conversions. Omit the entire recommendations section if there are no relevant products.
    
User query: "${query}"

Available products:
${availableProducts.map((p: ProductType) => `- ${p.title} (${p.category?.name || 'No category'}) - ${symbol}${p.price.toFixed(2)} - ${p.description || 'No description'}`).join('\n')}

Provide brief answers and relevant recommendations only.`;

    try {
      if (aiProvider === 'azureOpenAI' && settings.ai.azureOpenAI?.enabled) {
        const azureAI = await getAzureOpenAIInstance();
        if (azureAI) {
          aiResponse = await azureAI.generateText(chatbotPrompt, { maxTokens: 500 });
        }
      } else if (aiProvider === 'grok' && settings.ai.grok?.enabled) {
        const grok = await getGrokInstance();
        if (grok) {
          const messages = [
            {
              role: 'system' as const,
              content: 'You are a friendly and helpful shopping assistant chatbot. Provide conversational, helpful responses to customer inquiries about products.',
            },
            {
              role: 'user' as const,
              content: chatbotPrompt,
            },
          ];

          const result = await grok.makeCustomRequest(messages, { maxTokens: 500 });
          if (result.success) {
            aiResponse = result.data;
          }
        }
      }
    } catch (error) {
      console.error('Error with AI provider:', error);
    }

    if (!aiResponse) {
      // Manual search fallback: keyword-based filter
      const queryLower = query.toLowerCase();
      const keywords = queryLower.split(/\s+/).filter(Boolean);
      const fallbackProducts = availableProducts
        .filter((product: ProductType) => {
          return keywords.some((kw: string) =>
            product.title.toLowerCase().includes(kw) ||
            product.slug.toLowerCase().includes(kw) ||
            product.description?.toLowerCase().includes(kw) ||
            product.tags?.some((tag: string) => tag.toLowerCase().includes(kw)) ||
            product.category?.name.toLowerCase().includes(kw)
          );
        })
        .filter((product: ProductType) => product.title)
        .slice(0, 5);
      // Include link field for each product
      const fallbackWithLinks = fallbackProducts.map((product: ProductType) => ({
        ...product.toObject?.(),
        url: `/product/${product.slug}`
      }));
      return NextResponse.json({
        response: "AI is currently unavailable. Here are some products matching your query:",
        recommendedProducts: fallbackWithLinks
      });
    }

    // Keyword-based recommendation matching
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/).filter(Boolean);
    const recommendedProducts = availableProducts
      .filter((product: ProductType) => {
        return keywords.some((kw: string) =>
          product.title.toLowerCase().includes(kw) ||
          product.slug.toLowerCase().includes(kw) ||
          product.description?.toLowerCase().includes(kw) ||
          product.tags?.some((tag: string) => tag.toLowerCase().includes(kw)) ||
          product.category?.name.toLowerCase().includes(kw)
        );
      })
      .filter((product: ProductType) => product.title)
      .slice(0, 5); // Limit to 5 recommendations
    // Attach URL for each recommended product
    const recommendedWithLinks = recommendedProducts.map((product: ProductType) => ({
      ...product.toObject?.(),
      url: `/product/${product.slug}`
    }));

    return NextResponse.json({
      response: aiResponse,
      recommendedProducts: recommendedWithLinks
    });
  } catch (error) {
    console.error('Error with AI search assistant:', error as unknown);
    return NextResponse.json({
      response: "I'm sorry, I'm experiencing some technical difficulties. Please try again in a moment.",
      recommendedProducts: []
    }, { status: 500 });
  }
}
