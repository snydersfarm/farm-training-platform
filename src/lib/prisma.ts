import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: 
// https://pris.ly/d/help/next-js-best-practices

// Validate DATABASE_URL before initializing Prisma
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Check if the URL is valid
function isValidDatabaseUrl(url: string): boolean {
  try {
    // Simple regex validation for PostgreSQL URL format
    const regex = /^postgresql:\/\/[^:]+:[^@]+@[^:]+:[0-9]+\/[^?]+(\?.*)?$/
    // Alternative format for connection pooling (Neon)
    const poolingRegex = /^postgresql:\/\/[^:]+:[^@]+@[^\/]+\/[^?]+(\?.*)?$/
    
    return regex.test(url) || poolingRegex.test(url)
  } catch (e) {
    return false
  }
}

// Validate URL format
if (!isValidDatabaseUrl(process.env.DATABASE_URL)) {
  console.warn('DATABASE_URL format may be invalid. Please check your connection string.')
}

// Extract connection options
const connectionOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // If we're in production, increase the connection timeout
  ...(process.env.NODE_ENV === 'production' && {
    connectionTimeout: 20000, // 20 seconds
  })
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Maximum number of retry attempts for database operations
const MAX_RETRIES = 3;
// Delay between retries (exponential backoff)
const RETRY_DELAY_MS = 1000;

// Initialize PrismaClient
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(connectionOptions)

// Prevent multiple instances during hot reloading in development
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
          error.message.includes('ECONNREFUSED') ||
          // Neon-specific errors
          error.message.includes('connection timeout') ||
          error.message.includes('Client has encountered a connection error')
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