import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';

export async function GET() {
  try {
    await connectDB();
    const items = await Content.find({});
    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { key, value, type = 'text', category = 'general', description = '' } = await request.json();
    
    const item = await Content.findOneAndUpdate(
      { key }, 
      { value, type, category, description }, 
      { upsert: true, new: true }
    );
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to create/update content:', error);
    return NextResponse.json({ error: 'Failed to create/update content' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { key, value, type, category, description } = await request.json();
    
    const updateData: any = { value };
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    
    const item = await Content.findOneAndUpdate(
      { key }, 
      updateData, 
      { upsert: true, new: true }
    );
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to update content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { key } = await request.json();
    
    await Content.findOneAndDelete({ key });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete content:', error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}
