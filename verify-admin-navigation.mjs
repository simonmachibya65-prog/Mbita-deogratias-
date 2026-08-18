#!/usr/bin/env node
/**
 * Admin Navigation Verification Script
 * Checks all admin navigation links to ensure pages exist
 */

import fs from 'fs';
import path from 'path';

const adminDir = 'app/admin';

// All admin navigation items from AdminLayout.tsx
const adminNavigation = {
  "Overview": [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/ai-analytics", label: "AI Analytics" },
    { href: "/admin/notifications", label: "Notifications" },
  ],
  "Content": [
    { href: "/admin/home", label: "Home Page" },
    { href: "/admin/about", label: "About Page" },
    { href: "/admin/profile", label: "Profile" },
    { href: "/admin/sync", label: "Auto-Sync" },
    { href: "/admin/research", label: "Research" },
    { href: "/admin/datasets", label: "Datasets" },
    { href: "/admin/presentations", label: "Presentations" },
    { href: "/admin/proposals", label: "Proposals" },
    { href: "/admin/repository", label: "Repository" },
    { href: "/admin/publications", label: "Publications" },
    { href: "/admin/teaching", label: "Teaching" },
    { href: "/admin/grades", label: "Grades" },
    { href: "/admin/attendance", label: "Attendance" },
    { href: "/admin/plagiarism", label: "Plagiarism Check" },
    { href: "/admin/students", label: "Students" },
    { href: "/admin/cv", label: "CV & Awards" },
  ],
  "Media & Engagement": [
    { href: "/admin/blog", label: "Blog" },
    { href: "/admin/events", label: "Events" },
    { href: "/admin/gallery", label: "Gallery" },
    { href: "/admin/testimonials", label: "Testimonials" },
    { href: "/admin/announcements", label: "Services" },
  ],
  "Network": [
    { href: "/admin/collaborations", label: "Collaborations" },
    { href: "/admin/collaboration-requests", label: "Collab Requests" },
    { href: "/admin/team", label: "Research Team" },
  ],
  "Admin": [
    { href: "/admin/messages", label: "Messages" },
    { href: "/admin/settings", label: "Settings" },
    { href: "/admin/backup", label: "Backup" },
    { href: "/admin/security", label: "Security" },
    { href: "/admin/account", label: "Account" },
  ]
};

function checkPageExists(href) {
  // Remove /admin prefix and check if page.tsx exists
  const relativePath = href.replace('/admin', '') || '';
  const pagePath = relativePath 
    ? path.join(adminDir, relativePath, 'page.tsx')
    : path.join(adminDir, 'page.tsx');
  return fs.existsSync(pagePath);
}

console.log('🔍 Checking all admin navigation pages...\n');

let totalPages = 0;
let existingPages = 0;
let missingPages = [];

for (const [category, items] of Object.entries(adminNavigation)) {
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
console.log(`\n📊 Admin Panel Summary:`);
console.log(`  Total admin pages: ${totalPages}`);
console.log(`  Existing: ${existingPages} ✅`);
console.log(`  Missing: ${missingPages.length} ❌`);

if (missingPages.length > 0) {
  console.log(`\n❌ Missing Admin Pages:`);
  missingPages.forEach(page => {
    console.log(`  • ${page.category} → ${page.label} (${page.href})`);
  });
  
  console.log(`\n💡 To fix: Create these page files in app/admin/`);
} else {
  console.log(`\n✅ All admin navigation pages exist!`);
}

console.log('\n' + '='.repeat(60));
