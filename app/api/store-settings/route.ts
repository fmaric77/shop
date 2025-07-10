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
    
    return NextResponse.json(settings);
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
    
    const settings = await StoreSettings.findByIdAndUpdate(
      'store-settings',
      updates,
      { new: true, upsert: true }
    );
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating store settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
