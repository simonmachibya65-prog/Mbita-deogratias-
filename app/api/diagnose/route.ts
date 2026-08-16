import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    checks: {},
  };

  try {
    // Check environment variables
    diagnostics.checks.hasPostgresUrl = !!process.env.POSTGRES_URL;
    diagnostics.checks.hasDatabaseUrl = !!process.env.DATABASE_URL;
    diagnostics.checks.hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
    diagnostics.checks.hasSessionSecret = !!process.env.SESSION_SECRET;
    
    diagnostics.databaseUrlPreview = process.env.POSTGRES_URL 
      ? process.env.POSTGRES_URL.substring(0, 30) + '...' 
      : process.env.DATABASE_URL?.substring(0, 30) + '...';

    // Check Prisma Client
    try {
      const clientVersion = require('@prisma/client').version;
      diagnostics.checks.prismaClientVersion = clientVersion;
    } catch (e: any) {
      diagnostics.checks.prismaClientError = e.message;
    }

    // Check Prisma engine
    try {
      const enginePath = require.resolve('@prisma/client/runtime/library.js');
      diagnostics.checks.enginePath = enginePath;
    } catch (e: any) {
      diagnostics.checks.enginePathError = e.message;
    }

    // Test database connection
    try {
      const result = await prisma.$queryRaw`SELECT 
        current_database() as database,
        current_user as user,
        version() as version,
        NOW() as timestamp
      `;
      
      diagnostics.checks.databaseConnection = '✅ SUCCESS';
      diagnostics.databaseInfo = result;

      // Test a simple table query
      try {
        const profileCount = await prisma.profile.count();
        diagnostics.checks.profileTable = `✅ Found ${profileCount} profile(s)`;
      } catch (e: any) {
        diagnostics.checks.profileTable = '❌ ' + e.message;
      }

    } catch (error: any) {
      diagnostics.checks.databaseConnection = '❌ FAILED';
      diagnostics.checks.connectionError = error.message;
      diagnostics.checks.errorCode = error.code;
      
      // Specific error handling
      if (error.message.includes('Query Engine')) {
        diagnostics.solution = {
          problem: 'Prisma Query Engine not found',
          possibleCauses: [
            '1. Binary target not set correctly in schema.prisma',
            '2. Engine files not included in Vercel deployment',
            '3. Incompatible Prisma version with Vercel runtime',
          ],
          solutions: [
            'Add to schema.prisma: binaryTargets = ["native", "rhel-openssl-3.0.x"]',
            'Add to schema.prisma: engineType = "binary"',
            'Set PRISMA_CLI_BINARY_TARGETS environment variable',
            'Use Prisma Accelerate connection pooler',
          ],
          nextSteps: [
            '1. Check Vercel build logs for Prisma generation',
            '2. Verify node_modules/.prisma/client exists after build',
            '3. Consider using Prisma Accelerate for serverless',
          ],
        };
      } else if (error.code === 'P1001') {
        diagnostics.solution = {
          problem: 'Cannot reach database server',
          possibleCauses: [
            '1. DATABASE_URL or POSTGRES_URL not set in Vercel',
            '2. Database server is down or unreachable',
            '3. Network/firewall blocking connection',
          ],
          solutions: [
            'Verify POSTGRES_URL in Vercel environment variables',
            'Check database is active in Neon dashboard',
            'Test connection string manually',
          ],
        };
      }
    }

    // File system check (safe for Vercel)
    try {
      const fs = require('fs');
      const prismaClientPath = require.resolve('@prisma/client');
      const prismaDir = prismaClientPath.substring(0, prismaClientPath.lastIndexOf('node_modules') + 'node_modules/@prisma/client'.length);
      
      diagnostics.checks.prismaClientPath = prismaDir;
      
      try {
        const files = fs.readdirSync(prismaDir);
        diagnostics.checks.prismaClientFiles = files.slice(0, 20);
      } catch (e) {
        diagnostics.checks.prismaClientFiles = 'Unable to read directory';
      }
    } catch (e: any) {
      diagnostics.checks.filesystemError = e.message;
    }

    const isHealthy = diagnostics.checks.databaseConnection === '✅ SUCCESS';

    return NextResponse.json({
      healthy: isHealthy,
      summary: isHealthy 
        ? '✅ System healthy - database connected successfully'
        : '❌ System unhealthy - see diagnostics for details',
      diagnostics,
    }, { status: isHealthy ? 200 : 500 });

  } catch (error: any) {
    return NextResponse.json({
      healthy: false,
      summary: '❌ Critical error during diagnostics',
      error: {
        message: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      diagnostics,
    }, { status: 500 });
  }
}
