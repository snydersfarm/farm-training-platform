import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: 
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Maximum number of retry attempts for database operations
const MAX_RETRIES = 3;
// Delay between retries (exponential backoff)
const RETRY_DELAY_MS = 1000;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper for delay between retries (with exponential backoff)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced middleware with retry logic for database operations
prisma.$use(async (params, next) => {
  let retries = 0;
  
  // Retry loop for handling connection issues
  while (true) {
    try {
      return await next(params);
    } catch (error) {
      // Specific error types that might be recoverable with a retry
      const isConnectionError = 
        error instanceof Error && (
          error.message.includes('Connection pool') ||
          error.message.includes('Can\'t reach database server') ||
          error.message.includes('timeout') ||
          error.message.includes('connection') ||
          error.message.includes('ECONNREFUSED')
        );

      // If it's a connection error and we haven't exceeded retries
      if (isConnectionError && retries < MAX_RETRIES) {
        retries++;
        console.warn(`Database connection error, retrying (${retries}/${MAX_RETRIES}):`, error);
        
        // Wait with exponential backoff before retrying
        await wait(RETRY_DELAY_MS * Math.pow(2, retries - 1));
        continue;
      }
      
      // For non-recoverable errors or if max retries exceeded
      if (retries === MAX_RETRIES && isConnectionError) {
        console.error(`Failed to connect to database after ${MAX_RETRIES} attempts`);
      } else {
        console.error('Database error:', error);
      }
      
      // Re-throw the error after logging
      throw error;
    }
  }
});

// Add health check method to prisma client
prisma.$extends({
  model: {
    $allModels: {
      async isHealthy() {
        try {
          // Simple query to check database connection
          await prisma.$queryRaw`SELECT 1`;
          return true;
        } catch (error) {
          console.error('Database health check failed:', error);
          return false;
        }
      }
    }
  }
});