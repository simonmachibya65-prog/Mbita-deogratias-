// Script to add citations field to Publication table
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Adding citations field to Publication table...');
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Try to add the column using raw SQL
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Publication" 
        ADD COLUMN IF NOT EXISTS "citations" INTEGER DEFAULT 0
      `);
      console.log('✅ Citations column added successfully');
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        console.log('ℹ️ Citations column already exists');
      } else {
        console.error('⚠️ Could not add column:', error.message);
      }
    }
    
    // Update existing records
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "Publication" 
        SET citations = 0 
        WHERE citations IS NULL
      `);
      console.log('✅ Updated existing publications with default citation count');
    } catch (error) {
      console.log('ℹ️ Update skipped:', error.message);
    }
    
    console.log('\n✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
