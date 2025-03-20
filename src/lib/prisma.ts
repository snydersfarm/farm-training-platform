import { PrismaClient } from '@prisma/client'
import { getPrismaClient, withPrisma } from '../../prisma/connection';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: 
// https://pris.ly/d/help/next-js-best-practices

// Validate DATABASE_URL and DIRECT_URL before initializing Prisma
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

if (!process.env.DIRECT_URL) {
  console.warn('DIRECT_URL environment variable is not set - this may cause issues with migrations')
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

// Helper for delay between retries (with exponential backoff)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Maximum number of retry attempts for database operations
const MAX_RETRIES = 3;
// Delay between retries (exponential backoff)
const RETRY_DELAY_MS = 1000;

// Get the prisma client from our optimized connection wrapper
export const prisma = getPrismaClient();

// Export the withPrisma function for safe database operations
export { withPrisma };

// Health check method
export async function checkDatabaseHealth(): Promise<boolean> {
  return withPrisma(async (client) => {
    try {
      // Simple query to check database connection
      const result = await client.$queryRaw`SELECT 1 as "connection_test"`;
      return Array.isArray(result) && result.length > 0;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  });
}