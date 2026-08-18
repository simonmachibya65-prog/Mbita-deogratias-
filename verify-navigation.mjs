#!/usr/bin/env node
/**
 * Navigation Verification Script
 * Checks all navigation links to ensure pages exist
 */

import fs from 'fs';
import path from 'path';

const publicDir = 'app/(public)';

// All navigation items from Navbar.tsx
const navigation = {
  "Academic": [
    { href: "/research", label: "Research & Projects" },
    { href: "/research/repository", label: "Research Repository" },
    { href: "/research/proposals", label: "Research Proposals" },
    { href: "/research/datasets", label: "Datasets" },
    { href: "/research/presentations", label: "Presentations" },
    { href: "/publications", label: "Publications" },
    { href: "/cv", label: "CV & Achievements" },
    { href: "/collaborations", label: "Collaborations" },
    { href: "/research-network", label: "Research Network" },
    { href: "/peer-review", label: "Peer Review" },
  ],
  "Teaching": [
    { href: "/teaching", label: "Teaching & Courses" },
    { href: "/students", label: "Students & Supervision" },
    { href: "/student-portal", label: "Student Portal" },
    { href: "/certificates", label: "Certificates" },
    { href: "/gamification", label: "Achievements & Badges" },
    { href: "/scheduling", label: "Office Hours" },
  ],
  "Resources": [
    { href: "/video-library", label: "Video Library" },
    { href: "/virtual-lab", label: "Virtual Lab" },
    { href: "/ai-assistant", label: "AI Assistant" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/integrations", label: "Integrations" },
    { href: "/features", label: "Platform Features" },
  ],
  "Community": [
    { href: "/alumni", label: "Alumni Network" },
    { href: "/collaborations/team", label: "Team Collaboration" },
    { href: "/live-polling", label: "Live Polls" },
    { href: "/newsletter", label: "Newsletter" },
  ],
  "Media": [
    { href: "/blog", label: "Blog / News & Events" },
    { href: "/events", label: "Events" },
    { href: "/gallery", label: "Gallery" },
  ],
  "Analytics": [
    { href: "/impact-dashboard", label: "Impact Dashboard" },
    { href: "/analytics", label: "Analytics" },
    { href: "/funding-tracker", label: "Funding Tracker" },
  ],
  "More": [
    { href: "/accessibility", label: "Accessibility" },
    { href: "/mobile-app", label: "Mobile App" },
  ]
};

function checkPageExists(href) {
  const pagePath = path.join(publicDir, href, 'page.tsx');
  return fs.existsSync(pagePath);
}

console.log('🔍 Checking all navigation pages...\n');

let totalPages = 0;
let existingPages = 0;
let missingPages = [];

for (const [category, items] of Object.entries(navigation)) {
  console.log(`\n📁 ${category}:`);
  
  for (const item of items) {
    totalPages++;
    const exists = checkPageExists(item.href);
    
    if (exists) {
      existingPages++;
      console.log(`  ✅ ${item.label}`);
    } else {
      console.log(`  ❌ ${item.label} (Missing: ${item.href})`);
      missingPages.push({ category, ...item });
    }
  }
}

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Summary:`);
console.log(`  Total pages: ${totalPages}`);
console.log(`  Existing: ${existingPages} ✅`);
console.log(`  Missing: ${missingPages.length} ❌`);

if (missingPages.length > 0) {
  console.log(`\n❌ Missing Pages:`);
  missingPages.forEach(page => {
    console.log(`  • ${page.category} → ${page.label} (${page.href})`);
  });
  
  console.log(`\n💡 To fix: Create these page files in app/(public)/`);
} else {
  console.log(`\n✅ All navigation pages exist!`);
}

console.log('\n' + '='.repeat(60));
