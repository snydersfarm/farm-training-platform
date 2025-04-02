import { PrismaClient } from '@prisma/client';

// Log the database URL (without sensitive information)
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  const safeUrl = dbUrl.replace(/(?<=:\/\/)[^@]+@/, '****:****@');
  console.log('Database URL configuration:', {
    hasPoolTimeout: dbUrl.includes('pool_timeout'),
    hasConnectionLimit: dbUrl.includes('connection_limit'),
    hasStatementTimeout: dbUrl.includes('statement_timeout'),
    url: safeUrl
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 