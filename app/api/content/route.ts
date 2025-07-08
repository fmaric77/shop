import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';

export async function GET() {
  await connectDB();
  const items = await Content.find({});
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const { key, value } = await request.json();
  const item = await Content.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
  return NextResponse.json(item);
}
