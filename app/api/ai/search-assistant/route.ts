import { NextRequest, NextResponse } from 'next/server';
import { getGrokInstance } from '@/lib/grok';

// POST /api/ai/search-assistant - Improve search queries and provide recommendations
export async function POST(request: NextRequest) {
  try {
    const { query, products } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }
    
    const grok = await getGrokInstance();
    if (!grok) {
      return NextResponse.json({ error: 'Grok AI is not configured' }, { status: 400 });
    }
    
    // Generate improved search suggestions
    const searchResult = await grok.improveSearchQuery(query);
    
    let recommendations = null;
    if (products && products.length > 0) {
      // Generate product recommendations
      const recResult = await grok.generateProductRecommendations(query, products);
      if (recResult.success) {
        recommendations = recResult.data;
      }
    }
    
    const response: {
      searchSuggestions?: string;
      recommendations?: string;
    } = {};
    
    if (searchResult.success) {
      response.searchSuggestions = searchResult.data;
    }
    
    if (recommendations) {
      response.recommendations = recommendations;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error with search assistant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
