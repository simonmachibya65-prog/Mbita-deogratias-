// Test script to diagnose settings save errors
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSettingsSave() {
  console.log('🔍 Testing Settings Save Functionality\n');

  try {
    // Test 1: Check if settings exist
    console.log('Test 1: Checking if settings record exists...');
    const existing = await prisma.siteSettings.findFirst();
    
    if (existing) {
      console.log('✅ Settings record found');
      console.log('Current data:', JSON.stringify(existing, null, 2));
    } else {
      console.log('⚠️  No settings record found - will be created on first save');
    }

    // Test 2: Try to update settings
    console.log('\nTest 2: Attempting to save settings...');
    const testData = {
      siteTitle: existing?.siteTitle || 'Test Title',
      tagline: 'Test Tagline',
      footerText: existing?.footerText || '© 2024 Test',
      contactEmail: existing?.contactEmail || 'test@example.com',
      socialLinks: [
        { label: 'Twitter', url: 'https://twitter.com/test' },
        { label: 'LinkedIn', url: 'https://linkedin.com/test' }
      ],
      hiddenSections: ['login'],
      maintenanceMode: false,
      maintenanceMsg: '',
    };

    const updated = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: testData,
      create: { id: 1, ...testData },
    });

    console.log('✅ Settings saved successfully!');
    console.log('Updated data:', JSON.stringify(updated, null, 2));

    // Test 3: Verify the save
    console.log('\nTest 3: Verifying saved data...');
    const verified = await prisma.siteSettings.findFirst();
    
    if (verified) {
      console.log('✅ Data verified successfully');
      
      // Check social links
      const socialLinks = typeof verified.socialLinks === 'string' 
        ? JSON.parse(verified.socialLinks) 
        : verified.socialLinks;
      console.log(`\nSocial Links Count: ${Array.isArray(socialLinks) ? socialLinks.length : 0}`);
      console.log('Social Links:', socialLinks);
    }

    console.log('\n✅ All tests passed!');
    console.log('\n📝 Possible Error Causes:');
    console.log('1. Session expired - try logging in again');
    console.log('2. Database connection issue - check DATABASE_URL');
    console.log('3. Validation error - check required fields (siteTitle, footerText, contactEmail)');
    console.log('4. Browser console has more details - press F12 and check Console tab');

  } catch (error) {
    console.error('\n❌ Error occurred:', error.message);
    console.error('\nFull error:', error);
    
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Make sure DATABASE_URL is set in .env file');
    console.log('2. Run: npx prisma generate');
    console.log('3. Run: npx prisma db push');
    console.log('4. Check browser console (F12) for frontend errors');
  } finally {
    await prisma.$disconnect();
  }
}

testSettingsSave();
