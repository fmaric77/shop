import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Theme from '@/models/Theme';

export async function GET() {
  try {
    await connectDB();
    const themes = await Theme.find({}).sort({ createdAt: -1 });
    return NextResponse.json(themes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    
    console.log('Received theme data:', JSON.stringify(data, null, 2));
    
    // If this theme is being set as active, deactivate all others
    if (data.isActive) {
      await Theme.updateMany({}, { isActive: false });
    }
    
    const theme = await Theme.create(data);
    return NextResponse.json(theme, { status: 201 });
  } catch (error) {
    console.error('Theme creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create theme', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    const { id, ...updateData } = data;
    
    // If this theme is being set as active, deactivate all others
    if (updateData.isActive) {
      await Theme.updateMany({}, { isActive: false });
    }
    
    const theme = await Theme.findByIdAndUpdate(id, updateData, { new: true });
    if (!theme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }
    
    return NextResponse.json(theme);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 });
  }
}
