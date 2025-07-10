import { NextRequest, NextResponse } from 'next/server';
import { getGrokInstance } from '@/lib/grok';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// POST /api/ai/search-assistant - AI-powered chatbot for product assistance
export async function POST(request: NextRequest) {
  try {
    const { query, products } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    const grok = await getGrokInstance();
    if (!grok) {
      return NextResponse.json({ 
        response: "I'm sorry, but the AI assistant is not available right now. However, I can help you search our products manually. What are you looking for?",
        recommendedProducts: []
      });
    }

    await connectDB();
    
    // Get fresh product data if not provided
    let availableProducts = products;
    if (!availableProducts || availableProducts.length === 0) {
      availableProducts = await Product.find({}).populate('category').limit(50);
    }
    
    // Use AI to generate a conversational response with product recommendations
    const chatbotPrompt = `You are a helpful shopping assistant chatbot for an e-commerce store. 
    
User query: "${query}"

Available products:
${availableProducts.map(p => `- ${p.title} (${p.category?.name || 'No category'}) - $${p.price} - ${p.description || 'No description'}`).join('\n')}

Please provide a helpful, conversational response that:
1. Acknowledges the user's question
2. Provides relevant product recommendations if applicable
3. Offers additional assistance
4. Keeps the tone friendly and helpful

If the user is asking about specific products, highlight the most relevant ones.
If the user needs general shopping advice, provide helpful guidance.
If the user's query is unclear, ask clarifying questions.

Respond in a natural, conversational way as if you're a helpful store assistant.`;

    const messages = [
      {
        role: 'system',
        content: 'You are a friendly and helpful shopping assistant chatbot. Provide conversational, helpful responses to customer inquiries about products.',
      },
      {
        role: 'user',
        content: chatbotPrompt,
      },
    ];

    const result = await grok.makeCustomRequest(messages, { maxTokens: 500 });
    
    if (!result.success) {
      return NextResponse.json({
        response: "I'm having trouble processing your request right now. Could you try rephrasing your question?",
        recommendedProducts: []
      });
    }

    // Find products mentioned in the response or most relevant to the query
    const queryLower = query.toLowerCase();
    const recommendedProducts = availableProducts
      .filter((product: any) => {
        const titleMatch = product.title.toLowerCase().includes(queryLower);
        const descMatch = product.description?.toLowerCase().includes(queryLower);
        const categoryMatch = product.category?.name?.toLowerCase().includes(queryLower);
        const tagMatch = product.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower));
        
        return titleMatch || descMatch || categoryMatch || tagMatch;
      })
      .slice(0, 5); // Limit to 5 recommendations

    return NextResponse.json({
      response: result.data,
      recommendedProducts: recommendedProducts
    });
  } catch (error) {
    console.error('Error with AI search assistant:', error);
    return NextResponse.json({
      response: "I'm sorry, I'm experiencing some technical difficulties. Please try again in a moment.",
      recommendedProducts: []
    }, { status: 500 });
  }
}
