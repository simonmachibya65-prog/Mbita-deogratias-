/**
 * One-time script to seed photo URL fields in the DB.
 * The physical files already exist in public/images/ — this just writes the paths.
 * Run: node scripts/seed-photos.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.profile.update({
    where: { id: 1 },
    data: {
      photoUrl:        '/images/profile.jpg',
      navbarPhotoUrl:  '/images/profile-navbar.jpg',
      heroPhotoUrl:    '/images/profile-hero.jpg',
      aboutPhotoUrl:   '/images/profile-about.jpg',
      contactPhotoUrl: '/images/profile-contact.jpg',
      footerPhotoUrl:  '/images/profile-footer.jpg',
      adminPhotoUrl:   '/images/profile-admin.jpg',
    },
  });
  console.log('✅ Photo URLs seeded:', {
    photoUrl:        updated.photoUrl,
    navbarPhotoUrl:  updated.navbarPhotoUrl,
    heroPhotoUrl:    updated.heroPhotoUrl,
    aboutPhotoUrl:   updated.aboutPhotoUrl,
    contactPhotoUrl: updated.contactPhotoUrl,
    footerPhotoUrl:  updated.footerPhotoUrl,
    adminPhotoUrl:   updated.adminPhotoUrl,
  });
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
