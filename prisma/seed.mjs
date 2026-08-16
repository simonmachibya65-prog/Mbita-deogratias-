// ESM seed script for Prisma
// IMPORTANT: This seed only CREATES records if they don't exist.
// It will NOT overwrite data you've added via the admin panel.
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envPath = join(__dirname, '..', '.env');
try {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch {}

const { PrismaClient } = await import('@prisma/client');
const bcrypt = await import('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Admin user — only create if doesn't exist, never overwrite password
  const existingAdmin = await prisma.adminUser.findFirst({ where: { id: 1 } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.default.hash('mbita@12345', 12);
    await prisma.adminUser.create({
      data: { id: 1, username: 'Mbita', passwordHash },
    });
    console.log('✓ AdminUser created (username: Mbita, password: mbita@12345)');
  } else {
    console.log('✓ AdminUser already exists — skipping (not overwriting)');
  }

  // Profile — only create if doesn't exist, never overwrite
  const existingProfile = await prisma.profile.findFirst({ where: { id: 1 } });
  if (!existingProfile) {
    await prisma.profile.create({
      data: {
        id: 1,
        fullName: 'Dr. Emmanuel Deogratias Mbita',
        title: 'Senior Lecturer of Mathematics',
        department: 'Department of Mathematics and Statistics',
        institution: 'Sokoine University of Agriculture (SUA)',
        email: 'emmanuel.mbita@sua.ac.tz',
        officeLocation: '',
        officeHours: '',
        bio: '',
        photoUrl: '',
        cvUrl: '',
        academicProfiles: [
          { label: 'Google Scholar', url: 'https://scholar.google.com/citations?user=JEeMxH0AAAAJ' },
          { label: 'ResearchGate', url: 'https://www.researchgate.net/profile/Emmanuel-Deogratias' },
          { label: 'ORCID', url: 'https://orcid.org/0000-0000-0000-0000' },
          { label: 'Scopus', url: 'https://www.scopus.com/authid/detail.uri?authorId=0000000000' },
          { label: 'LinkedIn', url: 'https://www.linkedin.com/in/emmanuel-deogratias-mbita' },
          { label: 'Academia.edu', url: 'https://sua.academia.edu/EmmanuelMbita' },
        ],
      },
    });
    console.log('✓ Profile created with defaults');
  } else {
    console.log('✓ Profile already exists — skipping (not overwriting your data)');
  }

  // SiteSettings — only create if doesn't exist, never overwrite
  const existingSettings = await prisma.siteSettings.findFirst({ where: { id: 1 } });
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        id: 1,
        siteTitle: 'Dr. Emmanuel Deogratias Mbita',
        tagline: 'Senior Lecturer of Mathematics | Sokoine University of Agriculture',
        footerText: '© 2025 Dr. Emmanuel Deogratias Mbita',
        contactEmail: 'emmanuel.mbita@sua.ac.tz',
        maintenanceMode: false,
        socialLinks: [],
        hiddenSections: [],
      },
    });
    console.log('✓ SiteSettings created with defaults');
  } else {
    console.log('✓ SiteSettings already exists — skipping (not overwriting your data)');
  }

  console.log('\n🌱 Seed complete!');
  console.log('ℹ️  Existing data was preserved. Only missing records were created.');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
