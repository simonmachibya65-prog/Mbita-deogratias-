import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Admin user ──────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123456', 12);

  await prisma.adminUser.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      username: 'admin',
      passwordHash,
    },
  });

  console.log('✓ AdminUser seeded');

  // ── Profile (singleton) ─────────────────────────────────────────────────────
  await prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      fullName: 'Dr. Jane Smith',
      title: 'Professor of Computer Science',
      department: 'Department of Computer Science',
      institution: 'University of Technology',
      email: 'jane.smith@university.edu',
      officeLocation: 'Building A, Room 301',
      officeHours: 'Monday & Wednesday, 2:00 PM – 4:00 PM',
      bio: `Dr. Jane Smith is a Professor of Computer Science at the University of Technology, where she has been a faculty member since 2010. Her research focuses on machine learning, natural language processing, and human-computer interaction.

She received her Ph.D. in Computer Science from MIT in 2008 and completed a postdoctoral fellowship at Stanford University. She has published over 80 peer-reviewed papers and has been recognised with numerous awards for her contributions to the field.

Dr. Smith is passionate about mentoring the next generation of researchers and has supervised more than 20 doctoral students throughout her career.`,
      photoUrl: '',
      academicProfiles: [
        { label: 'Google Scholar', url: 'https://scholar.google.com' },
        { label: 'ORCID', url: 'https://orcid.org' },
        { label: 'ResearchGate', url: 'https://www.researchgate.net' },
      ],
    },
  });

  console.log('✓ Profile seeded');

  // ── SiteSettings (singleton) ────────────────────────────────────────────────
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteTitle: 'Prof. Jane Smith',
      tagline: 'Professor of Computer Science | University of Technology',
      footerText: '© 2024 Dr. Jane Smith',
      contactEmail: 'jane.smith@university.edu',
      maintenanceMode: false,
      socialLinks: [],
      hiddenSections: [],
    },
  });

  console.log('✓ SiteSettings seeded');

  // ── Publications ────────────────────────────────────────────────────────────
  await prisma.publication.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Advances in Neural Language Models for Scientific Text Understanding',
        authors: ['Jane Smith', 'Alice Johnson', 'Bob Chen'],
        venue: 'Journal of Artificial Intelligence Research',
        year: 2023,
        type: 'journal',
        doi: '10.1234/jair.2023.001',
        abstract:
          'We present a novel approach to scientific text understanding using transformer-based language models fine-tuned on domain-specific corpora.',
        published: true,
      },
      {
        title: 'Interactive Visualisation of High-Dimensional Data in Machine Learning',
        authors: ['Jane Smith', 'Carlos Rivera'],
        venue: 'ACM CHI Conference on Human Factors in Computing Systems',
        year: 2022,
        type: 'conference',
        doi: '10.1145/chi.2022.002',
        abstract:
          'This paper introduces a new interactive visualisation technique for exploring high-dimensional embeddings produced by deep learning models.',
        published: true,
      },
    ],
  });

  console.log('✓ Publications seeded');

  // ── Research projects ───────────────────────────────────────────────────────
  await prisma.researchProject.createMany({
    skipDuplicates: true,
    data: [
      {
        slug: 'nlp-scientific-discovery',
        title: 'Natural Language Processing for Scientific Discovery',
        description:
          'This project investigates the use of large language models to accelerate scientific discovery by automatically extracting insights from research literature at scale.',
        status: 'active',
        startYear: 2021,
        fundingSources: ['National Science Foundation', 'University Research Fund'],
        collaborators: ['MIT CSAIL', 'Stanford NLP Group'],
        published: true,
      },
      {
        slug: 'hci-accessibility-tools',
        title: 'Accessible Human-Computer Interaction Tools',
        description:
          'Developing novel interaction paradigms and assistive technologies to make computing more accessible for users with diverse abilities.',
        status: 'completed',
        startYear: 2018,
        endYear: 2022,
        fundingSources: ['NIH Accessibility Research Grant'],
        published: true,
      },
    ],
  });

  console.log('✓ ResearchProjects seeded');

  // ── Courses ─────────────────────────────────────────────────────────────────
  await prisma.course.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Introduction to Machine Learning',
        code: 'CS 4810',
        term: 'Fall 2024',
        status: 'active',
        description:
          'A comprehensive introduction to machine learning algorithms, covering supervised and unsupervised learning, neural networks, and practical applications.',
        published: true,
      },
      {
        name: 'Advanced Natural Language Processing',
        code: 'CS 6320',
        term: 'Spring 2023',
        status: 'archived',
        description:
          'Graduate-level course covering modern NLP techniques including transformers, pre-training, and fine-tuning for downstream tasks.',
        published: true,
      },
    ],
  });

  console.log('✓ Courses seeded');

  // ── Students ────────────────────────────────────────────────────────────────
  await prisma.student.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Michael Torres',
        degreeLevel: 'PhD',
        researchTopic: 'Large language models for biomedical text mining',
        status: 'current',
        published: true,
      },
      {
        name: 'Sarah Kim',
        degreeLevel: 'PhD',
        researchTopic: 'Multimodal learning for scientific figure understanding',
        status: 'current',
        published: true,
      },
      {
        name: 'David Nguyen',
        degreeLevel: 'PhD',
        researchTopic: 'Explainable AI for clinical decision support',
        status: 'alumni',
        thesisTitle: 'Towards Interpretable Deep Learning in Healthcare',
        graduationYear: 2022,
        currentPosition: 'Research Scientist at Google Health',
        published: true,
      },
    ],
  });

  console.log('✓ Students seeded');

  // ── Awards ──────────────────────────────────────────────────────────────────
  await prisma.award.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Best Paper Award',
        organization: 'ACM CHI 2022',
        year: 2022,
        category: 'award',
        description: 'Awarded for outstanding contribution to human-computer interaction research.',
        published: true,
      },
      {
        name: 'NSF CAREER Award',
        organization: 'National Science Foundation',
        year: 2015,
        category: 'grant',
        amount: '$500,000',
        fundingPeriod: '2015–2020',
        description:
          'Five-year grant supporting early-career faculty research in natural language processing.',
        published: true,
      },
    ],
  });

  console.log('✓ Awards seeded');

  // ── Blog posts ──────────────────────────────────────────────────────────────
  await prisma.blogPost.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Reflections on Teaching Machine Learning in 2024',
        slug: 'reflections-on-teaching-ml-2024',
        publishedAt: new Date('2024-03-15'),
        excerpt:
          'As AI tools become ubiquitous, teaching machine learning requires a fresh approach that balances theory with hands-on experimentation.',
        content: `# Reflections on Teaching Machine Learning in 2024

As AI tools become ubiquitous in everyday life, teaching machine learning at the university level requires a fresh approach. This semester I experimented with several new pedagogical strategies.

## Hands-on First

Rather than starting with theory, I began the course with a practical project: students built a simple image classifier in the first week. This gave them immediate intuition before diving into the mathematics.

## Ethical Considerations

Every algorithm we covered was paired with a discussion of its societal implications. Students responded enthusiastically to this framing.

I look forward to refining these approaches in future semesters.`,
        tags: ['teaching', 'machine learning', 'pedagogy'],
        draft: false,
      },
      {
        title: 'Our Paper on Scientific NLP Accepted at JAIR',
        slug: 'scientific-nlp-paper-accepted-jair',
        publishedAt: new Date('2023-11-20'),
        excerpt:
          'Excited to share that our work on neural language models for scientific text understanding has been accepted for publication.',
        content: `# Our Paper on Scientific NLP Accepted at JAIR

I am thrilled to announce that our paper "Advances in Neural Language Models for Scientific Text Understanding" has been accepted for publication in the Journal of Artificial Intelligence Research.

This work represents three years of collaborative effort with my students and colleagues at MIT and Stanford. We demonstrate that domain-adapted language models can significantly outperform general-purpose models on scientific information extraction tasks.

The paper will be available open-access. I will post a link once it is published.`,
        tags: ['research', 'NLP', 'publication'],
        draft: false,
      },
    ],
  });

  console.log('✓ BlogPosts seeded');

  // ── Events ──────────────────────────────────────────────────────────────────
  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Invited Talk: NLP for Science at Stanford AI Lab',
        date: new Date('2025-02-14T14:00:00Z'),
        location: 'Stanford University, Gates Computer Science Building',
        description:
          'Invited talk on our recent work applying large language models to accelerate scientific discovery.',
        published: true,
      },
      {
        name: 'ACM CHI 2024 — Paper Presentation',
        date: new Date('2024-05-12T10:00:00Z'),
        location: 'Honolulu, Hawaii, USA',
        description:
          'Presenting our paper on interactive visualisation techniques for high-dimensional machine learning data.',
        published: true,
      },
    ],
  });

  console.log('✓ Events seeded');

  // ── Collaborators ───────────────────────────────────────────────────────────
  await prisma.collaborator.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Prof. Alan Turing',
        institution: 'MIT CSAIL',
        area: 'Natural Language Processing',
        type: 'individual',
        published: true,
      },
      {
        name: 'Stanford NLP Group',
        institution: 'Stanford University',
        area: 'Language Model Research',
        type: 'institution',
        profileUrl: 'https://nlp.stanford.edu',
        published: true,
      },
    ],
  });

  console.log('✓ Collaborators seeded');

  // ── Resources ───────────────────────────────────────────────────────────────
  await prisma.resource.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'CS 4810 Course Materials',
        description: 'Lecture slides, assignments, and datasets for Introduction to Machine Learning.',
        url: 'https://university.edu/cs4810',
        category: 'Teaching',
        published: true,
      },
      {
        title: 'ScientificNLP Dataset',
        description: 'Annotated corpus of 50,000 scientific abstracts for NLP benchmarking.',
        url: 'https://github.com/janesmith/scientificnlp-dataset',
        category: 'Research',
        published: true,
      },
    ],
  });

  console.log('✓ Resources seeded');

  // ── Gallery items ───────────────────────────────────────────────────────────
  await prisma.galleryItem.createMany({
    skipDuplicates: true,
    data: [
      {
        imageUrl: '/images/gallery/lab-group-2023.jpg',
        alt: 'Research group photo taken in the lab, autumn 2023',
        caption: 'Our research group, autumn 2023',
        category: 'Lab',
        published: true,
      },
      {
        imageUrl: '/images/gallery/chi-2022-presentation.jpg',
        alt: 'Dr. Jane Smith presenting at ACM CHI 2022 conference',
        caption: 'Presenting at ACM CHI 2022, New Orleans',
        category: 'Conferences',
        published: true,
      },
    ],
  });

  console.log('✓ GalleryItems seeded');

  console.log('\n🌱 Database seeded successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
