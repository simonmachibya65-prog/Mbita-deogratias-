#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all requirements are met for deployment
 */

import { readFileSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
};

let errors = 0;
let warnings = 0;

function checkFile(path, name) {
  if (existsSync(path)) {
    log.success(`${name} exists`);
    return true;
  } else {
    log.error(`${name} not found at ${path}`);
    errors++;
    return false;
  }
}

function checkEnvVariable(envContent, varName, required = true) {
  const regex = new RegExp(`^${varName}=(.+)$`, 'm');
  const match = envContent.match(regex);
  
  if (match && match[1] && match[1].trim() !== '' && !match[1].includes('your-') && !match[1].includes('password@host')) {
    log.success(`${varName} is configured`);
    return true;
  } else if (required) {
    log.error(`${varName} is missing or not configured`);
    errors++;
    return false;
  } else {
    log.warning(`${varName} is not configured (optional)`);
    warnings++;
    return false;
  }
}

async function checkCommand(command, name) {
  try {
    await execAsync(command);
    log.success(`${name} is available`);
    return true;
  } catch (error) {
    log.error(`${name} is not available`);
    errors++;
    return false;
  }
}

async function checkNodeModules() {
  if (existsSync('./node_modules')) {
    log.success('node_modules exists');
    return true;
  } else {
    log.error('node_modules not found - run npm install');
    errors++;
    return false;
  }
}

async function checkPrismaGenerated() {
  if (existsSync('./node_modules/.prisma/client')) {
    log.success('Prisma client is generated');
    return true;
  } else {
    log.warning('Prisma client not generated - run npx prisma generate');
    warnings++;
    return false;
  }
}

async function main() {
  console.log('\n🔍 Professor Website - Deployment Readiness Check\n');

  // Check required files
  log.header('📁 Checking Required Files');
  checkFile('package.json', 'package.json');
  checkFile('next.config.mjs', 'Next.js config');
  checkFile('tsconfig.json', 'TypeScript config');
  checkFile('prisma/schema.prisma', 'Prisma schema');
  
  const hasEnv = checkFile('.env', 'Environment file');

  // Check dependencies
  log.header('📦 Checking Dependencies');
  await checkNodeModules();
  await checkPrismaGenerated();

  // Check environment variables
  if (hasEnv) {
    log.header('🔐 Checking Environment Variables');
    const envContent = readFileSync('.env', 'utf-8');

    log.info('Required variables:');
    checkEnvVariable(envContent, 'DATABASE_URL', true);
    checkEnvVariable(envContent, 'SESSION_SECRET', true);
    checkEnvVariable(envContent, 'PROFESSOR_EMAIL', true);
    checkEnvVariable(envContent, 'NEXT_PUBLIC_BASE_URL', true);

    log.info('\nEmail configuration:');
    checkEnvVariable(envContent, 'SMTP_HOST', true);
    checkEnvVariable(envContent, 'SMTP_PORT', true);
    checkEnvVariable(envContent, 'SMTP_USER', true);
    checkEnvVariable(envContent, 'SMTP_PASS', true);

    log.info('\nOptional features:');
    checkEnvVariable(envContent, 'OPENAI_API_KEY', false);
    checkEnvVariable(envContent, 'STRIPE_SECRET_KEY', false);
    checkEnvVariable(envContent, 'ORCID_ID', false);
    checkEnvVariable(envContent, 'NEXT_PUBLIC_TAWKTO_ID', false);
  }

  // Check system requirements
  log.header('🖥️  Checking System Requirements');
  await checkCommand('node --version', 'Node.js');
  await checkCommand('npm --version', 'npm');
  await checkCommand('git --version', 'Git');

  // Check build readiness
  log.header('🏗️  Build Check');
  if (existsSync('.next')) {
    log.info('Previous build found (.next directory exists)');
    log.info('Run "npm run build" to test build process');
  } else {
    log.info('No previous build found');
    log.info('Run "npm run build" to verify build works');
  }

  // Summary
  log.header('📊 Summary');
  console.log('');
  
  if (errors === 0 && warnings === 0) {
    log.success('🎉 All checks passed! Your project is ready for deployment.');
    console.log('\n📝 Next steps:');
    console.log('   1. Set up your database (if not done)');
    console.log('   2. Run: npx prisma db push');
    console.log('   3. Run: npm run dev (to test locally)');
    console.log('   4. Run: npm run build (to verify production build)');
    console.log('   5. Deploy to Vercel or your preferred platform');
    console.log('\n📚 See QUICKSTART.md for detailed instructions\n');
  } else {
    if (errors > 0) {
      log.error(`Found ${errors} error(s) that need to be fixed`);
    }
    if (warnings > 0) {
      log.warning(`Found ${warnings} warning(s) (optional configurations)`);
    }
    console.log('\n📝 Action items:');
    if (errors > 0) {
      console.log('   1. Fix the errors listed above');
      console.log('   2. Re-run this script: node verify-setup.mjs');
    }
    console.log('\n📚 See DEPLOYMENT.md or QUICKSTART.md for help\n');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n❌ Verification failed:', error.message);
  process.exit(1);
});
