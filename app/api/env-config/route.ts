import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { MongoClient } from 'mongodb';

const ENV_FILE_PATH = join(process.cwd(), '.env.local');

// GET /api/env-config - Get current environment configuration status
export async function GET() {
  try {
    const envExists = existsSync(ENV_FILE_PATH);
    let hasMongoConfig = false;
    let currentConfig = {};

    if (envExists) {
      const envContent = readFileSync(ENV_FILE_PATH, 'utf8');
      hasMongoConfig = envContent.includes('MONGODB_URI');
      
      // Parse current config (safely)
      if (hasMongoConfig) {
        const lines = envContent.split('\n');
        for (const line of lines) {
          if (line.startsWith('MONGODB_URI=')) {
            currentConfig = {
              hasConfig: true,
              // Don't return the actual URI for security
              configured: true
            };
            break;
          }
        }
      }
    }

    return NextResponse.json({
      envExists,
      hasMongoConfig,
      currentConfig,
    });
  } catch (error) {
    console.error('Error checking environment configuration:', error);
    return NextResponse.json({ error: 'Failed to check configuration' }, { status: 500 });
  }
}

// POST /api/env-config - Set environment configuration
export async function POST(request: NextRequest) {
  try {
    const { mongodbUri, testConnection } = await request.json();

    if (!mongodbUri) {
      return NextResponse.json({ error: 'MongoDB URI is required' }, { status: 400 });
    }

    // Test the connection if requested
    if (testConnection) {
      try {
        const client = new MongoClient(mongodbUri);
        await client.connect();
        await client.db().admin().ping();
        await client.close();
      } catch (error) {
        console.error('MongoDB connection test failed:', error);
        return NextResponse.json({ 
          error: 'Failed to connect to MongoDB. Please check your connection string.',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 });
      }
    }

    // Read existing .env.local file or create new content
    let envContent = '';
    if (existsSync(ENV_FILE_PATH)) {
      envContent = readFileSync(ENV_FILE_PATH, 'utf8');
    }

    // Remove existing MongoDB configuration
    const lines = envContent.split('\n');
    const filteredLines = lines.filter(line => 
      !line.startsWith('MONGODB_URI=') && 
      !line.startsWith('# MongoDB Configuration')
    );

    // Add new MongoDB configuration
    const newLines = [
      ...filteredLines,
      '',
      '# MongoDB Configuration',
      `MONGODB_URI=${mongodbUri}`,
      ''
    ];

    // Add other required environment variables if they don't exist
    const requiredVars = {
      'JWT_SECRET': 'your-super-secret-jwt-key-change-this-in-production',
      'NEXTAUTH_SECRET': 'your-nextauth-secret-key-change-this-in-production',
      'STRIPE_SECRET_KEY': 'your-stripe-secret-key',
      'STRIPE_PUBLISHABLE_KEY': 'your-stripe-publishable-key',
      'STRIPE_WEBHOOK_SECRET': 'your-stripe-webhook-secret',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': 'your-stripe-publishable-key',
    };

    for (const [key, defaultValue] of Object.entries(requiredVars)) {
      const exists = newLines.some(line => line.startsWith(`${key}=`));
      if (!exists) {
        newLines.push(`${key}=${defaultValue}`);
      }
    }

    // Write the updated content
    writeFileSync(ENV_FILE_PATH, newLines.join('\n'));

    return NextResponse.json({ 
      message: 'Environment configuration updated successfully',
      restartRequired: true 
    });
  } catch (error) {
    console.error('Error updating environment configuration:', error);
    return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
  }
}

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
