import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Database initialization endpoint
 * Automatically creates all tables and initial data
 * Visit: /api/init-db after first deployment
 */
export async function GET() {
  try {
    // Check if database is already initialized
    const profileCount = await prisma.profile.count().catch(() => 0);
    
    if (profileCount > 0) {
      return NextResponse.json({ 
        message: 'Database already initialized',
        status: 'success' 
      });
    }

    // Initialize Profile with default data
    await prisma.profile.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        fullName: 'Update Your Name',
        title: 'Professor',
        department: 'Your Department',
        institution: 'Your Institution',
        email: 'your-email@university.edu',
        officeLocation: 'Office Building, Room 000',
        officeHours: 'Monday-Friday 2:00 PM - 4:00 PM',
        bio: 'Update your bio in the admin panel.',
        photoUrl: '',
        cvUrl: '',
        academicProfiles: []
      }
    });

    // Initialize Site Settings
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        siteTitle: 'Professor Personal Website',
        tagline: 'Research, Teaching, and Academic Excellence',
        footerText: '© 2026 All Rights Reserved',
        contactEmail: 'contact@university.edu',
        maintenanceMode: false,
        socialLinks: {
          twitter: '',
          linkedin: '',
          facebook: '',
          instagram: ''
        },
        hiddenSections: [],
        navigationSettings: {
          showHome: true,
          showAbout: true,
          showResearch: true,
          showPublications: true,
          showTeaching: true,
          showBlog: true,
          showContact: true
        }
      }
    });

    return NextResponse.json({ 
      message: 'Database initialized successfully! You can now access /admin to create your admin account.',
      status: 'success',
      next_steps: [
        '1. Visit /admin to create your admin account',
        '2. Go to Profile Settings to update your information',
        '3. Configure Site Settings',
        '4. Start adding your content'
      ]
    });

  } catch (error: any) {
    console.error('Database initialization error:', error);
    
    // If tables don't exist, provide instructions
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json({ 
        error: 'Database tables not created yet',
        message: 'Please run: npx prisma db push',
        instructions: [
          '1. In Vercel dashboard, go to your project',
          '2. Click on "Storage" tab',
          '3. Create a Postgres database',
          '4. It will auto-connect to your project',
          '5. Then visit this endpoint again: /api/init-db'
        ]
      }, { status: 500 });
    }

    return NextResponse.json({ 
      error: 'Failed to initialize database',
      details: error.message,
      hint: 'Make sure DATABASE_URL is set and database tables are created (run: npx prisma db push)'
    }, { status: 500 });
  }
}

export async function POST() {
  // Same as GET - allows both methods
  return GET();
}
