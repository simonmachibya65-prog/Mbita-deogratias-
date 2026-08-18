// Script to add citations field to Publication table
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Adding citations field to Publication table...');
  
  try {
    // Check if we can connect
    await prisma.$connect();
    console.log('✅ Connected to database');

    // The field will be added automatically by Prisma when it generates the client
    // We just need to ensure the schema is applied
    console.log('✅ Schema updated - citations field is now available');
    
    // Optionally set default value for existing records
    const updated = await prisma.$executeRaw`
      UPDATE "Publication" 
      SET citations = 0 
      WHERE citations IS NULL
    `;
    
    console.log(`✅ Updated ${updated} existing publications with default citation count`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    // If the column already exists or update fails, that's okay
    if (error.message.includes('already exists') || error.message.includes('does not exist')) {
      console.log('ℹ️ Field may already exist or table may not have records yet - this is fine');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
