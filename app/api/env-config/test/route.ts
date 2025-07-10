import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// PUT /api/env-config/test - Test database connection
export async function PUT(request: NextRequest) {
  try {
    const { mongodbUri } = await request.json();

    if (!mongodbUri) {
      return NextResponse.json({ error: 'MongoDB URI is required' }, { status: 400 });
    }

    const client = new MongoClient(mongodbUri);
    await client.connect();
    
    // Test basic operations
    const db = client.db();
    await db.admin().ping();
    
    // Get database info
    const dbName = db.databaseName;
    const collections = await db.listCollections().toArray();
    
    await client.close();

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MongoDB',
      databaseName: dbName,
      collectionsCount: collections.length,
    });
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to connect to MongoDB',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}
