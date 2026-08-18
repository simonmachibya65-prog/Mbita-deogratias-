import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Admin Setup Endpoint
 * Creates the first admin account if none exists
 */
export async function POST(req: NextRequest) {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findFirst();
    
    if (existingAdmin) {
      return NextResponse.json({ 
        error: 'Admin account already exists. Please use /admin to login.' 
      }, { status: 400 });
    }

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ 
        error: 'Username and password are required' 
      }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters' 
      }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.adminUser.create({
      data: {
        id: 1,
        username,
        passwordHash,
        totpEnabled: false,
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Admin account created successfully!',
      username: admin.username,
      next: 'You can now login at /admin'
    });

  } catch (error: any) {
    console.error('Admin setup error:', error);
    return NextResponse.json({ 
      error: 'Failed to create admin account',
      details: error.message 
    }, { status: 500 });
  }
}

// GET method to check if admin exists
export async function GET() {
  try {
    const adminCount = await prisma.adminUser.count();
    
    return NextResponse.json({ 
      adminExists: adminCount > 0,
      count: adminCount,
      message: adminCount > 0 
        ? 'Admin account exists. Use /admin to login.' 
        : 'No admin account. Create one by POSTing to this endpoint with username and password.'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to check admin status',
      details: error.message 
    }, { status: 500 });
  }
}
