import { PrismaClient } from '@prisma/client';

// Log the database URL configuration (without sensitive information)
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  // Create a safe URL for logging (remove credentials)
  const safeUrl = dbUrl.replace(/(?<=:\/\/)[^@]+@/, '****:****@');
  
  // Parse the URL to check parameters
  try {
    const url = new URL(dbUrl);
    const params = new URLSearchParams(url.search);
    
    console.log('Database URL Analysis:', {
      hasPoolTimeout: params.has('pool_timeout'),
      hasConnectionLimit: params.has('connection_limit'),
      hasStatementTimeout: params.has('statement_timeout'),
      poolTimeout: params.get('pool_timeout'),
      connectionLimit: params.get('connection_limit'),
      statementTimeout: params.get('statement_timeout'),
      url: safeUrl
    });
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
  }
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