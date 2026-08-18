#!/usr/bin/env node
/**
 * Test Profile Update - Diagnose profile update issues
 * Run: node test-profile-update.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing Profile Update...\n');

  try {
    // Get current profile
    const profile = await prisma.profile.findFirst();
    
    if (!profile) {
      console.log('❌ No profile found. Run: node fix-academic-profiles.mjs');
      return;
    }

    console.log('📋 Current Profile:');
    console.log('  Name:', profile.fullName);
    console.log('  Email:', profile.email);
    console.log('  Department:', profile.department);
    console.log('  Institution:', profile.institution);

    // Test update with valid data
    console.log('\n🔄 Testing update with valid data...');
    
    const testData = {
      fullName: 'Test Name Update',
      title: profile.title,
      department: profile.department,
      institution: profile.institution,
      email: profile.email,
      officeLocation: profile.officeLocation,
      officeHours: profile.officeHours,
      bio: profile.bio,
      photoUrl: profile.photoUrl || '',
      academicProfiles: Array.isArray(profile.academicProfiles) ? profile.academicProfiles : []
    };

    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: testData
    });

    if (updated) {
      console.log('✅ Update successful!');
      console.log('  New name:', updated.fullName);
      
      // Revert back
      console.log('\n🔙 Reverting back to original name...');
      await prisma.profile.update({
        where: { id: profile.id },
        data: { fullName: profile.fullName }
      });
      console.log('✅ Reverted!');
    }

    // Test academicProfiles field
    console.log('\n🔗 Testing academicProfiles field...');
    const profileType = typeof profile.academicProfiles;
    const isArray = Array.isArray(profile.academicProfiles);
    
    console.log('  Type:', profileType);
    console.log('  Is Array:', isArray);
    console.log('  Value:', JSON.stringify(profile.academicProfiles, null, 2));

    if (!isArray) {
      console.log('\n⚠️  WARNING: academicProfiles is not an array!');
      console.log('   Run: node fix-academic-profiles.mjs');
    }

    console.log('\n✅ All tests passed!');
    console.log('\n📝 Diagnosis:');
    console.log('   - Database connection: ✅ Working');
    console.log('   - Profile exists: ✅ Yes');
    console.log('   - Update operation: ✅ Working');
    console.log('   - academicProfiles format: ' + (isArray ? '✅ Correct' : '❌ Needs fix'));

    if (isArray) {
      console.log('\n💡 The profile update should work. If you still get errors:');
      console.log('   1. Check browser console for error details');
      console.log('   2. Check Vercel function logs');
      console.log('   3. Ensure you\'re logged in as admin');
      console.log('   4. Try clearing browser cache');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔍 Details:', error);
    
    if (error.message.includes('connect')) {
      console.log('\n💡 Database connection failed. Check:');
      console.log('   - DATABASE_URL in .env file');
      console.log('   - Network connectivity');
      console.log('   - Neon database is running');
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
