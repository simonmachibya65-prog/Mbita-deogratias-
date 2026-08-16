import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get database info
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()` as any;
    
    return NextResponse.json({
      status: 'ok',
      database: {
        connected: true,
        name: result[0]?.current_database,
        user: result[0]?.current_user,
        version: result[0]?.version?.split(' ')[0],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      database: {
        connected: false,
        error: error.message,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
