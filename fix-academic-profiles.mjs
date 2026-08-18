#!/usr/bin/env node
/**
 * Fix Academic Profiles - Ensure academicProfiles field exists in database
 * Run: node fix-academic-profiles.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Checking Profile academic profiles field...\n');

  try {
    // Get existing profile
    let profile = await prisma.profile.findFirst();

    if (!profile) {
      console.log('❌ No profile found. Please run the setup first.');
      console.log('   Visit: https://mbita-deogratias.vercel.app/api/init-db');
      return;
    }

    console.log('✅ Profile found:', profile.fullName);
    console.log('📧 Email:', profile.email);

    // Check if academicProfiles exists and is valid
    const currentProfiles = profile.academicProfiles;
    console.log('\n📝 Current academicProfiles:', JSON.stringify(currentProfiles, null, 2));

    // Ensure it's an array
    if (!Array.isArray(currentProfiles)) {
      console.log('\n⚠️  academicProfiles is not an array. Fixing...');
      
      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          academicProfiles: []
        }
      });

      console.log('✅ Fixed! academicProfiles is now an empty array.');
    } else {
      console.log('✅ academicProfiles is already a valid array.');
      
      if (currentProfiles.length === 0) {
        console.log('\n💡 You can add academic profiles through:');
        console.log('   Admin Panel → Profile → Academic Links tab');
        console.log('   URL: https://mbita-deogratias.vercel.app/admin/profile');
      } else {
        console.log(`\n📊 You have ${currentProfiles.length} academic profile(s):`);
        currentProfiles.forEach((ap, i) => {
          console.log(`   ${i + 1}. ${ap.label}: ${ap.url}`);
        });
      }
    }

    console.log('\n✅ Profile academic profiles are ready!');
    console.log('\n📝 Next steps:');
    console.log('   1. Login to admin panel: https://mbita-deogratias.vercel.app/login');
    console.log('   2. Go to Profile → Academic Links tab');
    console.log('   3. Add your academic profile links (Google Scholar, ORCID, etc.)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
