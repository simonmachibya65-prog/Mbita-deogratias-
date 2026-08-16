import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use native pg driver instead of Prisma
    const { Client } = require('pg');
    
    const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({
        error: 'No database URL found',
        env: {
          hasPostgresUrl: !!process.env.POSTGRES_URL,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
        }
      }, { status: 500 });
    }

    const client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    
    const result = await client.query(`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version
    `);
    
    await client.end();

    return NextResponse.json({
      success: true,
      message: 'Database connected successfully without Prisma!',
      database: result.rows[0],
      suggestion: 'Database works. The issue is Prisma engine on Vercel. Consider using Prisma Accelerate or native pg driver.',
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
    }, { status: 500 });
  }
}
