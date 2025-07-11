import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StoreSettings from '@/models/StoreSettings';
import { getGrokInstance } from '@/lib/grok';
import { getAzureOpenAIInstance } from '@/lib/azureOpenAI';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { initialPrompt } = await request.json();
    const settings = await StoreSettings.findById('store-settings');
    const provider = settings?.ai?.provider || 'grok';
    let resultText: string | null = null;

    let prompt = `Generate a new product in JSON format with these fields:\n` +
      `"title": string, "category": string, "price": number, ` +
      `"description": string, "detailedDescription": string, ` +
      `"tags": string[], "image": string (URL or empty). ` +
      `Only return the JSON object.`;
    if (initialPrompt) {
      prompt += `\nUse this AI prompt as context: \"${initialPrompt}\".`;
    }

    if (provider === 'azureOpenAI' && settings.ai.azureOpenAI?.enabled) {
      const azureAI = await getAzureOpenAIInstance();
      if (azureAI) {
        resultText = await azureAI.generateText(prompt);
      }
    } else {
      const grok = await getGrokInstance();
      if (grok) {
        const result = await grok.callRaw(prompt);
        if (result.success) {
          resultText = result.data;
        }
      }
    }

    if (!resultText) {
      return NextResponse.json({ error: 'AI failed to generate product' }, { status: 500 });
    }

    // Parse JSON from LLM output
    let productData;
    try {
      // Remove Markdown code fences if present
      let jsonString = resultText.trim();
      if (jsonString.startsWith('```')) {
        // Remove leading ```json or ```
        jsonString = jsonString.replace(/^```[\s\S]*?\n/, '');
        // Remove trailing ```
        jsonString = jsonString.replace(/```$/, '').trim();
      }
      productData = JSON.parse(jsonString);
    } catch (err) {
      console.error('Failed to parse AI JSON:', err, resultText);
      return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 500 });
    }

    return NextResponse.json({ product: productData });
  } catch (error) {
    console.error('Error generating product with AI:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
