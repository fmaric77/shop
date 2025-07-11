import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StoreSettings from '@/models/StoreSettings';

// GET /api/store-settings - Get current store settings
export async function GET() {
  try {
    await connectDB();
    
    let settings = await StoreSettings.findById('store-settings');
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new StoreSettings({
        _id: 'store-settings',
        currency: {
          code: 'USD',
          symbol: '$',
          name: 'US Dollar',
          position: 'before',
          decimalPlaces: 2,
          thousandsSeparator: ',',
          decimalSeparator: '.',
        },
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
      });
      await settings.save();
    }
    // Initialize missing AI settings with defaults
    let needsUpdate = false;
    if (!settings.ai) {
      settings.ai = {} as any;
      needsUpdate = true;
    }
    if (!settings.ai.grok) {
      settings.ai.grok = {
        apiKey: '',
        model: 'grok-beta',
        enabled: false,
        features: {
          productRecommendations: true,
          productDescriptions: true,
          customerSupport: true,
          searchAssistant: true,
        },
      };
      needsUpdate = true;
    }
    if (!settings.ai.azureOpenAI) {
      settings.ai.azureOpenAI = {
        apiKey: '',
        endpoint: '',
        apiVersion: '2024-12-01-preview',
        model: 'gpt-4o',
        enabled: false,
        features: {
          productRecommendations: true,
          productDescriptions: true,
          customerSupport: true,
          searchAssistant: true,
          imageAnalysis: true,
        },
      };
      needsUpdate = true;
    }
    // Initialize missing Stripe settings
    if (!settings.stripe) {
      settings.stripe = { publishableKey: '', secretKey: '' } as any;
      needsUpdate = true;
    }
    if (needsUpdate) {
      await settings.save();
    }
    
    // Return plain JSON object
    return NextResponse.json(settings.toObject());
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/store-settings - Update store settings
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const updates = await request.json();
    let settings = await StoreSettings.findById('store-settings');
    if (!settings) {
      settings = new StoreSettings({ _id: 'store-settings' } as any);
    }
    // Merge top-level updates (e.g., currency, stripe, ai)
    Object.keys(updates).forEach(key => {
      (settings as any)[key] = (updates as any)[key];
    });
    await settings.save();
    return NextResponse.json(settings.toObject());
  } catch (error) {
    console.error('Error updating store settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
