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
        bio: 'Dr. Emmanuel Deogratias Mbita is a Senior Lecturer at the Department of Mathematics and Statistics, Sokoine University of Agriculture (SUA), Morogoro, Tanzania. He specializes in Mathematics Education with more than 13 years of teaching experience with undergraduate mathematics student-teachers. His research interests include instructional design, mathematics pedagogy, ICT in education, and teacher professional development. He offers consulting services in mathematics education including designing and implementing authentic learning activities for students at primary, secondary, and university levels.',
        photoUrl: '',
        cvUrl: '',
        academicProfiles: [
          { label: 'Google Scholar', url: 'https://scholar.google.com/citations?user=JEeMxH0AAAAJ' },
          { label: 'ResearchGate', url: 'https://www.researchgate.net/profile/Emmanuel-Deogratias' },
          { label: 'ORCID', url: 'https://orcid.org/0000-0000-0000-0000' },
          { label: 'Scopus', url: 'https://www.scopus.com/authid/detail.uri?authorId=0000000000' },
          { label: 'LinkedIn', url: 'https://www.linkedin.com/in/emmanuel-deogratias-mbita' },
          { label: 'Academia.edu', url: 'https://suanet.academia.edu/DrEmmanuelDeogratias' },
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

  // Publications — seed real publications found from Dr. Mbita's academic profiles
  const existingPubs = await prisma.publication.findFirst();
  if (!existingPubs) {
    const publications = [
      {
        title: 'The Role of Complex Numbers in Interdisciplinary Mathematics Teaching in Tanzanian Secondary Schools',
        authors: JSON.stringify(['Emmanuel Deogratias', 'Aziza J.']),
        venue: 'International Journal of Research in Mathematics Education',
        year: 2026,
        type: 'journal',
        doi: '10.24090/ijrme.v4i1.16167',
        url: 'https://ejournal.uinsaizu.ac.id/index.php/ijrme/article/download/16167/5032/51923',
        abstract: 'The integration of complex numbers into interdisciplinary teaching offers significant opportunities such as solving electrical problems to enhance conceptual understanding and problem-solving skills in Tanzanian secondary schools.',
      },
      {
        title: 'Investigating the Factors Contributing to Low Mathematics Performance in Tanzanian Ordinary Secondary Schools',
        authors: JSON.stringify(['Emmanuel Deogratias', 'Heri Paulo']),
        venue: 'International Journal of Research in Mathematics Education',
        year: 2025,
        type: 'journal',
        doi: '10.24090/ijrme.v3i1.13499',
        url: 'https://ejournal.uinsaizu.ac.id/index.php/ijrme/article/download/13499/4322',
        abstract: 'This quantitative study aimed to investigate the factors contributing to low mathematics performance in secondary schools within Morogoro Municipality, Tanzania. The study involved 3 secondary schools, 50 mathematics teachers and 150 students.',
      },
      {
        title: 'Investigation of Teachers\' Competency on Using ICT for Teaching and Learning Mathematics and Science Subjects in Tanzanian Secondary Schools',
        authors: JSON.stringify(['S. Langoi', 'Emmanuel Deogratias']),
        venue: 'International Online Journal of Education and Teaching (IOJET)',
        year: 2024,
        type: 'journal',
        url: 'http://www.distantreader.org/stacks/journals-ojs/iojet/iojet-2055.pdf',
        abstract: 'Investigation of teachers\' competency on using ICT for teaching and learning mathematics and science subjects in Tanzanian secondary schools.',
      },
      {
        title: 'Teaching Ordinary Differential Equations to Pre-Service Mathematics Teachers Using Computer-Assisted Instruction (MATLAB)',
        authors: JSON.stringify(['Emmanuel Deogratias']),
        venue: 'International Journal of Mathematics Education',
        year: 2024,
        type: 'journal',
        abstract: 'This study presents a detailed descriptive analysis of teaching ordinary differential equations (ODEs) to pre-service mathematics teachers using computer-assisted instruction with MATLAB software.',
      },
      {
        title: 'Integrating Mathematics Student Teachers\' Lived Experiences and Collaborative Learning for Teaching Venn Diagrams',
        authors: JSON.stringify(['Emmanuel Deogratias']),
        venue: 'Mathematics Education Research Journal',
        year: 2024,
        type: 'journal',
        abstract: 'This study investigated the effectiveness of integrating mathematics student teachers\' lived experiences and collaborative learning strategies in enhancing understanding of set representation through Venn diagrams at Sokoine University of Agriculture.',
      },
      {
        title: 'Using a Crossing Method as an Alternative Approach for Teaching Systems of Linear Equations in Secondary Schools',
        authors: JSON.stringify(['Emmanuel Deogratias']),
        venue: 'International Online Journal of Education and Teaching (IOJET)',
        year: 2022,
        type: 'journal',
        url: 'http://files.eric.ed.gov/fulltext/EJ1343229.pdf',
        abstract: 'This paper presents an alternative approach of teaching, learning and solving systems of two linear equations using the crossing method.',
      },
      {
        title: 'The Crossing Method: An Alternative Approach for Teaching and Solving Quadratic Equations in Secondary Schools',
        authors: JSON.stringify(['Emmanuel Deogratias']),
        venue: 'International Online Journal of Education and Teaching (IOJET)',
        year: 2022,
        type: 'journal',
        abstract: 'This paper introduces the crossing method as an alternative approach for teaching and solving quadratic equations, particularly in secondary schools.',
      },
      {
        title: 'Factors Influencing Students\' Overuse of Linearity in Schools and Ways to Prevent the Illusion of Linearity',
        authors: JSON.stringify(['Emmanuel Deogratias']),
        venue: 'International Online Journal of Education and Teaching (IOJET)',
        year: 2022,
        type: 'journal',
        url: 'http://files.eric.ed.gov/fulltext/EJ1327731.pdf',
        abstract: 'This paper addresses factors influencing students\' overuse of linearity in schools and ways to prevent the illusion of linearity.',
      },
      {
        title: 'Forecasting Students\' Enrolment in Tanzania Government Primary Schools from 2021 to 2035',
        authors: JSON.stringify(['Emmanuel Deogratias']),
        venue: 'International Journal of Science and Research (IJSR)',
        year: 2021,
        type: 'journal',
        url: 'https://www.ijsr.net/archive/v9i11/SR201115114200.pdf',
        abstract: 'This article focuses on forecasting students\' enrolment in Tanzania Government Primary Schools using ARIMA (1,1,0) model.',
      },
      {
        title: 'Comparative Analysis of Tanzania\'s Population Growth Using Exponential and Logistic Growth Models',
        authors: JSON.stringify(['Emmanuel Deogratias']),
        venue: 'African Journal of Mathematics and Statistics',
        year: 2023,
        type: 'journal',
        abstract: 'This study offers a comprehensive comparative analysis of Tanzania\'s population growth by applying both exponential and logistic growth models to empirical data spanning from 1967 to projected figures for 2112.',
      },
      {
        title: 'Using Real Life Examples in Mathematics Teaching: A Study of Ordinary Level Secondary Schools in Tanzania',
        authors: JSON.stringify(['Emmanuel Deogratias']),
        venue: 'International Online Journal of Education and Teaching (IOJET)',
        year: 2022,
        type: 'journal',
        url: 'https://distantreader.org/stacks/journals-ojs/iojet/iojet-1470.pdf',
        abstract: 'This study explored the extent at which mathematics teachers in ordinary level secondary schools use real-life examples in their daily mathematics teaching and learning environment.',
      },
      {
        title: 'Topological Spaces Using Reflective Teaching',
        authors: JSON.stringify(['Emmanuel Deogratias']),
        venue: 'International Online Journal of Education and Teaching (IOJET)',
        year: 2022,
        type: 'journal',
        url: 'https://files.eric.ed.gov/fulltext/EJ1327731.pdf',
        abstract: 'Research on topological spaces using reflective teaching approaches for university mathematics education.',
      },
      {
        title: 'Challenges in Managing Operational Funds in Public Secondary Schools: A Study of Mbeya District, Tanzania',
        authors: JSON.stringify(['Emmanuel Deogratias']),
        venue: 'African Journal of Education and Practice',
        year: 2023,
        type: 'journal',
        abstract: 'This mixed study focused on the challenges experienced by schools in managing operational funds allocated by the government for instructional and support services in Mbeya district.',
      },
      {
        title: 'Learning by Doing: Informed by University Mathematics Students\' Participation in Field Practical Training',
        authors: JSON.stringify(['Emmanuel Deogratias']),
        venue: 'International Journal of Science and Research (IJSR)',
        year: 2020,
        type: 'journal',
        url: 'https://www.ijsr.net/archive/v9i11/SR201115114200.pdf',
        abstract: 'This study explores the learning by doing approach informed by university mathematics students\' participation in field practical training.',
      },
    ];

    for (const pub of publications) {
      await prisma.publication.create({ data: pub });
    }
    console.log(`✓ ${publications.length} real publications by Dr. Mbita seeded`);
  } else {
    console.log('✓ Publications already exist — skipping');
  }

  console.log('\n🌱 Seed complete!');
  console.log('ℹ️  Existing data was preserved. Only missing records were created.');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
