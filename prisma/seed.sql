USE professor_website;

-- Admin user (password: admin123456, bcrypt hash cost 12)
INSERT IGNORE INTO AdminUser (id, username, passwordHash, failedAttempts, updatedAt)
VALUES (1, 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGniYE6Nd.NumkCODVZMtB8.2Oe', 0, NOW());

-- Profile
INSERT IGNORE INTO Profile (id, fullName, title, department, institution, email, officeLocation, officeHours, bio, photoUrl, cvUrl, academicProfiles, updatedAt)
VALUES (1,
  'Dr. Jane Smith',
  'Professor of Computer Science',
  'Department of Computer Science',
  'University of Technology',
  'jane.smith@university.edu',
  'Building A, Room 301',
  'Monday & Wednesday, 2:00 PM – 4:00 PM',
  'Dr. Jane Smith is a Professor of Computer Science at the University of Technology, where she has been a faculty member since 2010. Her research focuses on machine learning, natural language processing, and human-computer interaction.\n\nShe received her Ph.D. in Computer Science from MIT in 2008 and completed a postdoctoral fellowship at Stanford University. She has published over 80 peer-reviewed papers and has been recognised with numerous awards for her contributions to the field.\n\nDr. Smith is passionate about mentoring the next generation of researchers and has supervised more than 20 doctoral students throughout her career.',
  '',
  '',
  '[{"label":"Google Scholar","url":"https://scholar.google.com"},{"label":"ORCID","url":"https://orcid.org"},{"label":"ResearchGate","url":"https://www.researchgate.net"}]',
  NOW()
);

-- SiteSettings
INSERT IGNORE INTO SiteSettings (id, siteTitle, tagline, footerText, contactEmail, maintenanceMode, socialLinks, hiddenSections, updatedAt)
VALUES (1,
  'Prof. Jane Smith',
  'Professor of Computer Science | University of Technology',
  '© 2024 Dr. Jane Smith. All rights reserved.',
  'jane.smith@university.edu',
  0,
  '[]',
  '[]',
  NOW()
);

-- Publications
INSERT IGNORE INTO Publication (id, title, authors, venue, year, type, doi, url, published, createdAt, updatedAt) VALUES
('pub001', 'Advances in Neural Language Models for Scientific Text Understanding', '["Jane Smith","Alice Johnson","Bob Chen"]', 'Journal of Artificial Intelligence Research', 2023, 'journal', '10.1234/jair.2023.001', NULL, 1, NOW(), NOW()),
('pub002', 'Interactive Visualisation of High-Dimensional Data in Machine Learning', '["Jane Smith","Carlos Rivera"]', 'ACM CHI Conference on Human Factors in Computing Systems', 2022, 'conference', '10.1145/chi.2022.002', NULL, 1, NOW(), NOW()),
('pub003', 'Deep Learning for Medical Image Analysis: A Survey', '["Jane Smith","David Nguyen","Sarah Kim"]', 'IEEE Transactions on Medical Imaging', 2021, 'journal', NULL, NULL, 1, NOW(), NOW()),
('pub004', 'Transformer Models for Low-Resource African Languages', '["Jane Smith","Amina Hassan"]', 'EMNLP 2020', 2020, 'conference', NULL, NULL, 1, NOW(), NOW());

-- Research Projects
INSERT IGNORE INTO ResearchProject (id, slug, title, description, status, startYear, endYear, fundingSources, collaborators, tags, published, createdAt, updatedAt) VALUES
('res001', 'nlp-scientific-discovery', 'Natural Language Processing for Scientific Discovery', 'This project investigates the use of large language models to accelerate scientific discovery by automatically extracting insights from research literature at scale. We develop novel methods for information extraction, knowledge graph construction, and hypothesis generation from scientific text.', 'active', 2021, NULL, '["National Science Foundation","University Research Fund"]', '["MIT CSAIL","Stanford NLP Group"]', '["NLP","Machine Learning","Science"]', 1, NOW(), NOW()),
('res002', 'hci-accessibility-tools', 'Accessible Human-Computer Interaction Tools', 'Developing novel interaction paradigms and assistive technologies to make computing more accessible for users with diverse abilities. This project produced several open-source tools now used by thousands of users worldwide.', 'completed', 2018, 2022, '["NIH Accessibility Research Grant"]', '["Microsoft Research","Google Accessibility"]', '["HCI","Accessibility","Assistive Technology"]', 1, NOW(), NOW()),
('res003', 'swahili-nlp', 'NLP for Swahili and East African Languages', 'Building computational resources and models for Swahili and other East African languages, addressing the significant gap in NLP tools for African languages.', 'active', 2022, NULL, '["African Development Foundation"]', '["University of Nairobi","UDSM"]', '["NLP","African Languages","Low-Resource"]', 1, NOW(), NOW());

-- Courses
INSERT IGNORE INTO Course (id, name, code, term, status, description, schedule, published, createdAt, updatedAt) VALUES
('crs001', 'Introduction to Machine Learning', 'CS 4810', 'Fall 2024', 'active', 'A comprehensive introduction to machine learning algorithms, covering supervised and unsupervised learning, neural networks, and practical applications using Python and scikit-learn.', '[{"day":"Monday","time":"10:00 AM","room":"Room 201"},{"day":"Wednesday","time":"10:00 AM","room":"Room 201"}]', 1, NOW(), NOW()),
('crs002', 'Advanced Natural Language Processing', 'CS 6320', 'Spring 2024', 'active', 'Graduate-level course covering modern NLP techniques including transformers, pre-training, and fine-tuning for downstream tasks. Students implement state-of-the-art models.', '[{"day":"Tuesday","time":"2:00 PM","room":"Room 305"},{"day":"Thursday","time":"2:00 PM","room":"Room 305"}]', 1, NOW(), NOW()),
('crs003', 'Data Structures and Algorithms', 'CS 2110', 'Spring 2023', 'archived', 'Fundamental data structures and algorithm design techniques. Topics include arrays, linked lists, trees, graphs, sorting, and dynamic programming.', NULL, 1, NOW(), NOW());

-- Students
INSERT IGNORE INTO Student (id, name, degreeLevel, researchTopic, status, thesisTitle, graduationYear, currentPosition, published, createdAt, updatedAt) VALUES
('stu001', 'Michael Torres', 'PhD', 'Large language models for biomedical text mining', 'current', NULL, NULL, NULL, 1, NOW(), NOW()),
('stu002', 'Sarah Kim', 'PhD', 'Multimodal learning for scientific figure understanding', 'current', NULL, NULL, NULL, 1, NOW(), NOW()),
('stu003', 'Amina Hassan', 'Masters', 'Sentiment analysis for Swahili social media', 'current', NULL, NULL, NULL, 1, NOW(), NOW()),
('stu004', 'David Nguyen', 'PhD', 'Explainable AI for clinical decision support', 'alumni', 'Towards Interpretable Deep Learning in Healthcare', 2022, 'Research Scientist at Google Health', 1, NOW(), NOW()),
('stu005', 'Priya Patel', 'PhD', 'Federated learning for privacy-preserving NLP', 'alumni', 'Privacy-Preserving Natural Language Processing via Federated Learning', 2021, 'Assistant Professor at IIT Bombay', 1, NOW(), NOW());

-- Awards
INSERT IGNORE INTO Award (id, name, organization, year, category, amount, fundingPeriod, description, published, createdAt, updatedAt) VALUES
('awd001', 'Best Paper Award', 'ACM CHI 2022', 2022, 'award', NULL, NULL, 'Awarded for outstanding contribution to human-computer interaction research.', 1, NOW(), NOW()),
('awd002', 'NSF CAREER Award', 'National Science Foundation', 2015, 'grant', '$500,000', '2015–2020', 'Five-year grant supporting early-career faculty research in natural language processing.', 1, NOW(), NOW()),
('awd003', 'Distinguished Teaching Award', 'University of Technology', 2020, 'honor', NULL, NULL, 'Recognized for excellence in undergraduate teaching and student mentorship.', 1, NOW(), NOW()),
('awd004', 'African Languages NLP Fellowship', 'African Academy of Sciences', 2022, 'fellowship', '$80,000', '2022–2024', 'Fellowship supporting research on computational tools for African languages.', 1, NOW(), NOW());

-- Blog Posts
INSERT IGNORE INTO BlogPost (id, title, slug, publishedAt, excerpt, content, tags, draft, createdAt, updatedAt) VALUES
('blg001', 'Reflections on Teaching Machine Learning in 2024', 'reflections-on-teaching-ml-2024', '2024-03-15 00:00:00', 'As AI tools become ubiquitous, teaching machine learning requires a fresh approach that balances theory with hands-on experimentation.', '# Reflections on Teaching Machine Learning in 2024\n\nAs AI tools become ubiquitous in everyday life, teaching machine learning at the university level requires a fresh approach. This semester I experimented with several new pedagogical strategies.\n\n## Hands-on First\n\nRather than starting with theory, I began the course with a practical project: students built a simple image classifier in the first week. This gave them immediate intuition before diving into the mathematics.\n\n## Ethical Considerations\n\nEvery algorithm we covered was paired with a discussion of its societal implications. Students responded enthusiastically to this framing.\n\nI look forward to refining these approaches in future semesters.', '["teaching","machine learning","pedagogy"]', 0, NOW(), NOW()),
('blg002', 'Our Paper on Scientific NLP Accepted at JAIR', 'scientific-nlp-paper-accepted-jair', '2023-11-20 00:00:00', 'Excited to share that our work on neural language models for scientific text understanding has been accepted for publication.', '# Our Paper on Scientific NLP Accepted at JAIR\n\nI am thrilled to announce that our paper "Advances in Neural Language Models for Scientific Text Understanding" has been accepted for publication in the Journal of Artificial Intelligence Research.\n\nThis work represents three years of collaborative effort with my students and colleagues at MIT and Stanford. We demonstrate that domain-adapted language models can significantly outperform general-purpose models on scientific information extraction tasks.\n\nThe paper is available open-access at the JAIR website.', '["research","NLP","publication"]', 0, NOW(), NOW()),
('blg003', 'Building NLP Tools for Swahili: Challenges and Opportunities', 'nlp-tools-swahili', '2023-06-10 00:00:00', 'Working on NLP for Swahili has been one of the most rewarding challenges of my career. Here are some lessons learned.', '# Building NLP Tools for Swahili\n\nSwahili is spoken by over 200 million people across East Africa, yet it remains severely under-resourced in NLP. Our team has been working to change that.\n\n## The Challenge\n\nMost NLP tools are built for English and a handful of European languages. Swahili has unique morphological properties that make direct transfer difficult.\n\n## Our Approach\n\nWe have been building annotated datasets, training language models, and releasing everything open-source to benefit the broader community.', '["Swahili","NLP","African languages","research"]', 0, NOW(), NOW());

-- Events
INSERT IGNORE INTO Event (id, name, date, location, description, published, createdAt, updatedAt) VALUES
('evt001', 'Invited Talk: NLP for Science at Stanford AI Lab', '2025-08-14 14:00:00', 'Stanford University, Gates CS Building', 'Invited talk on applying large language models to accelerate scientific discovery. Open to all Stanford affiliates.', 1, NOW(), NOW()),
('evt002', 'Workshop: NLP for African Languages at ACL 2025', '2025-07-28 09:00:00', 'Vienna, Austria', 'Co-organizing a workshop on computational linguistics for African languages at the Annual Meeting of the ACL.', 1, NOW(), NOW()),
('evt003', 'ACM CHI 2024 — Paper Presentation', '2024-05-12 10:00:00', 'Honolulu, Hawaii, USA', 'Presenting our paper on interactive visualisation techniques for high-dimensional machine learning data.', 1, NOW(), NOW()),
('evt004', 'Guest Lecture: AI Ethics at Nairobi University', '2024-03-05 11:00:00', 'University of Nairobi, Kenya', 'Guest lecture on ethical considerations in AI development, with focus on African contexts.', 1, NOW(), NOW());

-- Collaborators
INSERT IGNORE INTO Collaborator (id, name, institution, area, profileUrl, type, published, createdAt, updatedAt) VALUES
('col001', 'Prof. Alan Turing', 'MIT CSAIL', 'Natural Language Processing', NULL, 'individual', 1, NOW(), NOW()),
('col002', 'Stanford NLP Group', 'Stanford University', 'Language Model Research', 'https://nlp.stanford.edu', 'institution', 1, NOW(), NOW()),
('col003', 'Dr. Wanjiru Kamau', 'University of Nairobi', 'Swahili NLP and African Languages', NULL, 'individual', 1, NOW(), NOW()),
('col004', 'African Language Technology Initiative', 'Pan-African Research Consortium', 'Low-resource language tools', 'https://alt-initiative.org', 'institution', 1, NOW(), NOW());

-- Resources
INSERT IGNORE INTO Resource (id, title, description, url, category, published, createdAt, updatedAt) VALUES
('rsc001', 'CS 4810 Course Materials', 'Lecture slides, assignments, and datasets for Intro to ML.', 'https://university.edu/cs4810', 'Teaching', 1, NOW(), NOW()),
('rsc002', 'ScientificNLP Dataset', 'Annotated corpus of 50,000 scientific abstracts for NLP benchmarking.', 'https://github.com/janesmith/scientificnlp', 'Research', 1, NOW(), NOW()),
('rsc003', 'Swahili NLP Toolkit', 'Open-source tools for Swahili text processing and analysis.', 'https://github.com/janesmith/swahili-nlp', 'Research', 1, NOW(), NOW());

-- Gallery
INSERT IGNORE INTO GalleryItem (id, imageUrl, alt, caption, category, published, createdAt, updatedAt) VALUES
('gal001', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600', 'Research group photo in the lab', 'Our research group, autumn 2023', 'Lab', 1, NOW(), NOW()),
('gal002', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600', 'Conference presentation at ACM CHI', 'Presenting at ACM CHI 2022', 'Conferences', 1, NOW(), NOW()),
('gal003', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600', 'Workshop session on NLP', 'NLP Workshop 2023', 'Workshops', 1, NOW(), NOW()),
('gal004', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600', 'Lab equipment and computers', 'Our computing lab', 'Lab', 1, NOW(), NOW());

-- Testimonials
INSERT IGNORE INTO Testimonial (id, name, role, content, published, createdAt, updatedAt) VALUES
('tst001', 'Michael Torres', 'PhD Student', 'Prof. Smith is an exceptional mentor. Her guidance has been invaluable in shaping my research direction and academic career. She always makes time for her students.', 1, NOW(), NOW()),
('tst002', 'Sarah Kim', 'PhD Candidate', 'The research environment here is outstanding. Prof. Smith encourages creative thinking and provides excellent support throughout the PhD journey.', 1, NOW(), NOW()),
('tst003', 'David Nguyen', 'Alumni, Research Scientist at Google Health', 'My time under Prof. Smith supervision was transformative. The rigorous training and collaborative environment prepared me well for my career in industry.', 1, NOW(), NOW()),
('tst004', 'Amina Hassan', 'Masters Student', 'Prof. Smith is deeply committed to making NLP accessible for African languages. Working with her on Swahili NLP has been an incredible experience.', 1, NOW(), NOW());

-- Announcements
INSERT IGNORE INTO Announcement (id, title, content, link, published, createdAt, updatedAt) VALUES
('ann001', 'New Paper Accepted at NeurIPS 2024', 'Our latest work on multimodal learning has been accepted at NeurIPS 2024. Congratulations to all co-authors!', NULL, 1, NOW(), NOW()),
('ann002', 'PhD Position Available — Fall 2025', 'We are looking for motivated PhD students to join our lab. Strong background in ML or NLP preferred. Applications open now.', '/contact', 1, NOW(), NOW()),
('ann003', 'Swahili NLP Toolkit v2.0 Released', 'We have released version 2.0 of our open-source Swahili NLP toolkit with improved models and new features.', 'https://github.com/janesmith/swahili-nlp', 1, NOW(), NOW());

SELECT 'Seed complete!' AS status;
