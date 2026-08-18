// Fix settings data format - convert socialLinks from object to array
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSettingsFormat() {
  console.log('🔧 Fixing Settings Data Format\n');

  try {
    const settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      console.log('⚠️  No settings found');
      return;
    }

    console.log('Current socialLinks format:', typeof settings.socialLinks);
    console.log('Current data:', settings.socialLinks);

    // Check if socialLinks is an object (old format)
    const socialLinks = typeof settings.socialLinks === 'string' 
      ? JSON.parse(settings.socialLinks) 
      : settings.socialLinks;

    let newSocialLinks = [];

    // Convert object to array format
    if (!Array.isArray(socialLinks)) {
      console.log('\n📝 Converting from object to array format...');
      
      // Convert old object format to new array format
      Object.entries(socialLinks).forEach(([key, value]) => {
        if (value && value !== '') {
          newSocialLinks.push({
            label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize
            url: value
          });
        }
      });

      console.log('New socialLinks array:', newSocialLinks);

      // Update the database
      await prisma.siteSettings.update({
        where: { id: 1 },
        data: {
          socialLinks: newSocialLinks
        }
      });

      console.log('\n✅ Settings format updated successfully!');
    } else {
      console.log('\n✅ Settings are already in correct array format!');
    }

    // Also fix hiddenSections if needed
    const hiddenSections = typeof settings.hiddenSections === 'string'
      ? JSON.parse(settings.hiddenSections)
      : settings.hiddenSections;

    if (!Array.isArray(hiddenSections)) {
      console.log('\n📝 Fixing hiddenSections format...');
      await prisma.siteSettings.update({
        where: { id: 1 },
        data: {
          hiddenSections: []
        }
      });
      console.log('✅ hiddenSections fixed!');
    }

    console.log('\n✅ All formats corrected!');
    console.log('You can now use the Settings page without errors.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSettingsFormat();
