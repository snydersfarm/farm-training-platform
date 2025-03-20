import { PrismaClient } from '@prisma/client';

/**
 * PrismaClientSingleton class for managing database connections
 * Optimized for serverless environments where connection pooling is important
 */
class PrismaClientSingleton {
  // Singleton instance
  private static instance: PrismaClient;
  // Track connections
  private static connectionCount = 0;
  
  // Connection cleanup interval (in ms)
  private static CLEANUP_INTERVAL = 60000; // 1 minute
  // Maximum idle time (in ms)
  private static MAX_IDLE_TIME = 10000; // 10 seconds
  
  // Timestamp of last access
  private static lastAccessed: number = Date.now();
  // Cleanup interval ID
  private static cleanupIntervalId: NodeJS.Timeout | null = null;
  
  /**
   * Get the singleton instance of PrismaClient
   */
  public static getInstance(): PrismaClient {
    if (!PrismaClientSingleton.instance) {
      // Create new instance
      PrismaClientSingleton.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'error', 'warn'] 
          : ['error'],
        
        // Connection settings
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });
      
      // Start cleanup timer (only in serverless environments)
      if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
        PrismaClientSingleton.startCleanupTimer();
      }
    }
    
    // Update last accessed time
    PrismaClientSingleton.lastAccessed = Date.now();
    return PrismaClientSingleton.instance;
  }
  
  /**
   * Start the cleanup timer to disconnect idle connections
   */
  private static startCleanupTimer(): void {
    // Avoid multiple timers
    if (PrismaClientSingleton.cleanupIntervalId) {
      clearInterval(PrismaClientSingleton.cleanupIntervalId);
    }
    
    // Set cleanup interval
    PrismaClientSingleton.cleanupIntervalId = setInterval(() => {
      const currentTime = Date.now();
      const idleTime = currentTime - PrismaClientSingleton.lastAccessed;
      
      // If connection has been idle for too long and we have an instance
      if (
        idleTime > PrismaClientSingleton.MAX_IDLE_TIME && 
        PrismaClientSingleton.instance &&
        PrismaClientSingleton.connectionCount === 0
      ) {
        // Disconnect and clear instance
        PrismaClientSingleton.disconnect()
          .catch(err => console.error('Error disconnecting Prisma:', err));
      }
    }, PrismaClientSingleton.CLEANUP_INTERVAL);
  }
  
  /**
   * Safely disconnect from the database and clean up
   */
  public static async disconnect(): Promise<void> {
    if (PrismaClientSingleton.instance) {
      try {
        await PrismaClientSingleton.instance.$disconnect();
        PrismaClientSingleton.instance = null;
        console.log('Prisma disconnected due to inactivity');
      } catch (error) {
        console.error('Error disconnecting Prisma:', error);
      }
    }
    
    // Clear cleanup timer
    if (PrismaClientSingleton.cleanupIntervalId) {
      clearInterval(PrismaClientSingleton.cleanupIntervalId);
      PrismaClientSingleton.cleanupIntervalId = null;
    }
  }
  
  /**
   * Track connection acquisition
   */
  public static acquireConnection(): void {
    PrismaClientSingleton.connectionCount++;
    PrismaClientSingleton.lastAccessed = Date.now();
  }
  
  /**
   * Track connection release
   */
  public static releaseConnection(): void {
    if (PrismaClientSingleton.connectionCount > 0) {
      PrismaClientSingleton.connectionCount--;
    }
    PrismaClientSingleton.lastAccessed = Date.now();
  }
}

// Function to safely execute database operations
export async function withPrisma<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  // Get prisma instance
  const prisma = PrismaClientSingleton.getInstance();
  
  // Track connection
  PrismaClientSingleton.acquireConnection();
  
  try {
    // Execute the operation
    return await operation(prisma);
  } finally {
    // Release connection
    PrismaClientSingleton.releaseConnection();
  }
}

// Export the singleton instance getter
export const getPrismaClient = (): PrismaClient => {
  return PrismaClientSingleton.getInstance();
};

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await PrismaClientSingleton.disconnect();
  });
} 