#!/usr/bin/env node

/**
 * Interactive Setup Wizard
 * Helps configure the project for first-time setup
 */

import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function main() {
  console.clear();
  log('\n🎓 Professor Website - Setup Wizard\n', 'cyan');
  log('This wizard will help you configure your environment variables.\n', 'blue');

  // Read existing .env
  let envContent = readFileSync('.env', 'utf-8');

  // Database URL
  log('═══════════════════════════════════════════════════', 'cyan');
  log('📊 Database Configuration', 'cyan');
  log('═══════════════════════════════════════════════════\n', 'cyan');
  
  log('Choose your database provider:', 'blue');
  log('  1. Vercel Postgres (recommended for Vercel deployment)');
  log('  2. Supabase (free tier available)');
  log('  3. Railway (free tier available)');
  log('  4. Local PostgreSQL');
  log('  5. Other / I\'ll configure manually\n');
  
  const dbChoice = await question('Enter choice (1-5): ');
  
  if (dbChoice === '5') {
    log('\n✓ You can manually update DATABASE_URL in .env file later\n', 'yellow');
  } else {
    log('\nℹ️  Database setup instructions:', 'blue');
    switch(dbChoice) {
      case '1':
        log('  1. Install Vercel CLI: npm i -g vercel');
        log('  2. Run: vercel link');
        log('  3. Create database at: https://vercel.com/storage');
        log('  4. Run: vercel env pull .env.local');
        break;
      case '2':
        log('  1. Visit: https://supabase.com');
        log('  2. Create new project');
        log('  3. Go to: Settings > Database > Connection String');
        log('  4. Copy "Connection pooling" string');
        break;
      case '3':
        log('  1. Visit: https://railway.app');
        log('  2. Create new project');
        log('  3. Add PostgreSQL service');
        log('  4. Copy connection string');
        break;
      case '4':
        log('  1. Install PostgreSQL locally');
        log('  2. Create database: createdb professor_website');
        log('  3. Use: postgresql://localhost:5432/professor_website');
        break;
    }
    log('\nPress Enter to continue after setting up database...');
    await question('');
    
    const dbUrl = await question('\nPaste your DATABASE_URL: ');
    if (dbUrl && dbUrl.trim()) {
      envContent = envContent.replace(
        /DATABASE_URL="[^"]*"/,
        `DATABASE_URL="${dbUrl.trim()}"`
      );
      log('✓ Database URL saved\n', 'green');
    }
  }

  // Email Configuration
  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('📧 Email Configuration (for contact form)', 'cyan');
  log('═══════════════════════════════════════════════════\n', 'cyan');
  
  const configureEmail = await question('Configure email now? (y/n): ');
  
  if (configureEmail.toLowerCase() === 'y') {
    log('\nUsing Gmail? Generate App Password at:', 'yellow');
    log('https://myaccount.google.com/apppasswords\n', 'yellow');
    
    const smtpUser = await question('Your email address: ');
    const smtpPass = await question('Your SMTP password/app password: ');
    
    if (smtpUser && smtpPass) {
      envContent = envContent.replace(
        /SMTP_USER="[^"]*"/,
        `SMTP_USER="${smtpUser.trim()}"`
      );
      envContent = envContent.replace(
        /SMTP_PASS="[^"]*"/,
        `SMTP_PASS="${smtpPass.trim()}"`
      );
      log('✓ Email configuration saved\n', 'green');
    }
  }

  // Professor Email
  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('👤 Your Information', 'cyan');
  log('═══════════════════════════════════════════════════\n', 'cyan');
  
  const profEmail = await question('Your contact email address: ');
  if (profEmail && profEmail.trim()) {
    envContent = envContent.replace(
      /PROFESSOR_EMAIL="[^"]*"/,
      `PROFESSOR_EMAIL="${profEmail.trim()}"`
    );
    log('✓ Contact email saved\n', 'green');
  }

  // Base URL
  const baseUrl = await question('\nWebsite URL (or press Enter for localhost:3000): ');
  if (baseUrl && baseUrl.trim()) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_BASE_URL="[^"]*"/,
      `NEXT_PUBLIC_BASE_URL="${baseUrl.trim()}"`
    );
    log('✓ Base URL saved\n', 'green');
  }

  // Save .env
  writeFileSync('.env', envContent);
  
  log('\n═══════════════════════════════════════════════════', 'green');
  log('✓ Configuration saved to .env', 'green');
  log('═══════════════════════════════════════════════════\n', 'green');

  // Next steps
  log('📝 Next Steps:\n', 'cyan');
  log('  1. Initialize database:');
  log('     npx prisma db push\n');
  log('  2. Verify setup:');
  log('     node verify-setup.mjs\n');
  log('  3. Start development:');
  log('     npm run dev\n');
  log('  4. Visit http://localhost:3000/admin to create admin account\n');
  
  log('📚 For more help, see QUICKSTART.md\n', 'blue');

  rl.close();
}

main().catch((error) => {
  console.error('\n❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});
