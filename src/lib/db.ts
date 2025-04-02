import { PrismaClient } from '@prisma/client';

// Log the database URL configuration (without sensitive information)
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

// Create Prisma client with connection pooling
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Handle connection errors
prisma.$connect().catch((error) => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});

// Handle disconnection
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 