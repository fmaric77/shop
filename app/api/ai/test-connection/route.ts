import { NextResponse } from 'next/server';
import { getGrokInstance } from '@/lib/grok';

// POST /api/ai/test-connection - Test Grok AI connection
export async function POST() {
  try {
    const grok = await getGrokInstance();
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
