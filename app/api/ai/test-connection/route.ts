import { NextRequest, NextResponse } from 'next/server';
import { getGrokInstance, GrokAI } from '@/lib/grok';

// POST /api/ai/test-connection - Test Grok AI connection
export async function POST(request: NextRequest) {
  try {
    // Allow passing API key and model in request body for testing
    let body: any = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (parseError) {
      // If no body or invalid JSON, use empty object
      console.log('No valid JSON body provided, using stored settings');
    }
    
    let grok = null;
    if (body?.apiKey) {
      const model = body.model || 'grok-beta';
      grok = new GrokAI({ apiKey: body.apiKey, model, enabled: true });
    } else {
      grok = await getGrokInstance();
    }
    if (!grok) {
      return NextResponse.json({ error: 'Grok AI is not configured' }, { status: 400 });
    }
    
    const result = await grok.testConnection();
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'Connection successful' });
  } catch (error) {
    console.error('Error testing Grok connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
