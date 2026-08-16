import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {},
    fixes: [],
  };

  try {
    // Check 1: Environment variables
    diagnostics.checks.databaseUrl = !!process.env.POSTGRES_URL || !!process.env.DATABASE_URL;
    diagnostics.checks.sessionSecret = !!process.env.NEXTAUTH_SECRET || !!process.env.SESSION_SECRET;

    // Check 2: Prisma Client availability
    try {
      const { PrismaClient } = require('@prisma/client');
      diagnostics.checks.prismaClientImported = true;
      
      const prisma = new PrismaClient();
      diagnostics.checks.prismaClientInstantiated = true;

      // Check 3: Test database connection
      try {
        await prisma.$queryRaw`SELECT 1 as test`;
        diagnostics.checks.databaseConnection = true;
        diagnostics.fixes.push('✅ Database connection working!');
      } catch (error: any) {
        diagnostics.checks.databaseConnection = false;
        diagnostics.checks.databaseError = error.message;
        
        // Try to fix by regenerating
        if (error.message.includes('Query Engine')) {
          diagnostics.fixes.push('❌ Query Engine not found - attempting regeneration...');
          
          try {
            const { stdout, stderr } = await execAsync('npx prisma generate');
            diagnostics.fixes.push('✅ Prisma regenerated successfully');
            diagnostics.fixes.push(stdout);
            
            // Try connection again
            const newPrisma = new PrismaClient();
            await newPrisma.$queryRaw`SELECT 1 as test`;
            diagnostics.fixes.push('✅ Database connection restored!');
            diagnostics.checks.databaseConnection = true;
          } catch (fixError: any) {
            diagnostics.fixes.push('❌ Regeneration failed: ' + fixError.message);
          }
        }
      }

      await prisma.$disconnect();

    } catch (error: any) {
      diagnostics.checks.prismaClientError = error.message;
    }

    // Check 4: File system paths
    const fs = require('fs');
    const path = require('path');
    
    const pathsToCheck = [
      '/var/task/node_modules/.prisma/client',
      '/var/task/.next/server',
      './node_modules/.prisma/client',
      './node_modules/@prisma/client',
    ];

    diagnostics.checks.paths = {};
    for (const pathToCheck of pathsToCheck) {
      try {
        const exists = fs.existsSync(pathToCheck);
        diagnostics.checks.paths[pathToCheck] = exists;
        if (exists) {
          const files = fs.readdirSync(pathToCheck).slice(0, 10); // First 10 files
          diagnostics.checks.paths[pathToCheck + '_files'] = files;
        }
      } catch (e) {
        diagnostics.checks.paths[pathToCheck] = false;
      }
    }

    return NextResponse.json({
      success: diagnostics.checks.databaseConnection,
      message: diagnostics.checks.databaseConnection 
        ? '✅ All checks passed! Database is working.'
        : '❌ Database connection failed. See diagnostics below.',
      diagnostics,
    }, { status: diagnostics.checks.databaseConnection ? 200 : 500 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: '❌ Critical error during diagnostics',
      error: error.message,
      stack: error.stack,
      diagnostics,
    }, { status: 500 });
  }
}
