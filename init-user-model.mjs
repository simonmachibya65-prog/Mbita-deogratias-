// Initialize User model and create default admin user
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function initUserModel() {
  console.log('🔧 Initializing User Model\n');

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: 'Mbita' },
    });

    if (existingUser) {
      console.log('✅ User model already exists with admin user');
      console.log('Username:', existingUser.username);
      console.log('Email:', existingUser.email);
      console.log('Full Name:', existingUser.fullName);
      console.log('\n✅ No action needed!');
      return;
    }

    // Create default admin user
    console.log('📝 Creating default admin user...');
    const hashedPassword = await bcrypt.hash('Mbita@12345', 10);

    const user = await prisma.user.create({
      data: {
        username: 'Mbita',
        password: hashedPassword,
        email: 'masalagosimon442@gmail.com',
        fullName: 'Mbita Deogratias',
        role: 'admin',
      },
    });

    console.log('\n✅ User model initialized successfully!');
    console.log('Created user:');
    console.log('  Username:', user.username);
    console.log('  Email:', user.email);
    console.log('  Full Name:', user.fullName);
    console.log('  Role:', user.role);
    console.log('\n🔐 Login Credentials:');
    console.log('  Username: Mbita');
    console.log('  Password: Mbita@12345');
    console.log('\n✅ You can now use the Account and Security pages!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'P2002') {
      console.log('\n✅ User already exists - this is okay!');
    } else if (error.message.includes('does not exist')) {
      console.log('\n⚠️  User table does not exist in database yet.');
      console.log('\n🔧 Run these commands:');
      console.log('  1. npx prisma generate');
      console.log('  2. npx prisma db push');
      console.log('  3. node init-user-model.mjs');
    } else {
      console.error('\nFull error:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

initUserModel();
