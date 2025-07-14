import { NextRequest, NextResponse } from 'next/server';
import { getGrokInstance, GrokAI } from '@/lib/grok';

// POST /api/ai/test-connection - Test AI connection
export async function POST(request: NextRequest) {
  try {
    // Allow passing AI provider configuration in request body for testing
    let body: { provider?: string; [key: string]: any } = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      // If no body or invalid JSON, use empty object
      console.log('No valid JSON body provided, using stored settings');
    }
    
    const provider = body?.provider || 'grok';
    
    if (provider === 'azureOpenAI') {
      // Test Azure OpenAI connection
      if (!body?.apiKey || !body?.endpoint) {
        return NextResponse.json({ error: 'Azure OpenAI API key and endpoint are required' }, { status: 400 });
      }
      
      try {
        // Simple test using fetch to Azure OpenAI endpoint
        const testResponse = await fetch(`${body.endpoint}/openai/deployments/${body.model || 'gpt-4o'}/chat/completions?api-version=${body.apiVersion || '2024-12-01-preview'}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': body.apiKey,
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hello, this is a test.' }],
            max_tokens: 5,
          }),
        });
        
        if (testResponse.ok) {
          return NextResponse.json({ success: true, message: 'Azure OpenAI connection successful' });
        } else {
          const errorData = await testResponse.text();
          return NextResponse.json({ error: `Azure OpenAI connection failed: ${errorData}` }, { status: 500 });
        }
      } catch (error) {
        return NextResponse.json({ error: `Azure OpenAI connection failed: ${error}` }, { status: 500 });
      }
    } else {
      // Test Grok AI connection
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
      
      return NextResponse.json({ success: true, message: 'Grok AI connection successful' });
    }
  } catch (error) {
    console.error('Error testing AI connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
