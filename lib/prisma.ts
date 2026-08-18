import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Use POSTGRES_PRISMA_URL for Vercel/Neon pooling, fallback to others
// During build time (when env vars might not be set), use a dummy URL
const databaseUrl = 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL ||
  'postgresql://temp:temp@localhost:5432/temp'; // Fallback for build time

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ 
    log: ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
