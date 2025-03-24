import { PrismaClient } from '@prisma/client';
import type { DatabaseConnectionMetrics } from '../src/lib/types';

// Performance monitoring interface - use the imported type
export type { DatabaseConnectionMetrics };

// Global metrics tracker
const metrics: DatabaseConnectionMetrics = {
  connectionsCreated: 0,
  connectionsReleased: 0,
  maxConcurrentConnections: 0,
  retryAttempts: 0,
  successfulRetries: 0,
  failedRetries: 0,
  averageQueryTime: 0,
  totalQueries: 0,
  errors: {
    connectionErrors: 0,
    queryErrors: 0,
    timeoutErrors: 0,
    otherErrors: 0,
  },
  lastReset: new Date(),
};

// Reset metrics periodically (every hour)
if (typeof setInterval !== 'undefined' && typeof window === 'undefined') {
  setInterval(() => {
    Object.assign(metrics, {
      connectionsCreated: 0,
      connectionsReleased: 0,
      maxConcurrentConnections: 0,
      retryAttempts: 0,
      successfulRetries: 0,
      failedRetries: 0,
      averageQueryTime: 0,
      totalQueries: 0,
      errors: {
        connectionErrors: 0,
        queryErrors: 0,
        timeoutErrors: 0,
        otherErrors: 0,
      },
      lastReset: new Date(),
    });
  }, 3600000); // Reset every hour
}

// Get current database metrics
export function getDatabaseMetrics(): DatabaseConnectionMetrics {
  return { ...metrics };
}

/**
 * Validate database connection parameters
 * This function checks if the DATABASE_URL contains necessary connection pooling parameters
 */
function validateConnectionParameters(): void {
  if (typeof process === 'undefined' || typeof window !== 'undefined') {
    return; // Skip on client-side
  }

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL is not defined in the environment variables');
    return;
  }

  // Check for connection pooling params
  const requiredParams = ['pool_timeout', 'connection_limit', 'statement_timeout'];
  const missingParams: string[] = [];

  for (const param of requiredParams) {
    if (!databaseUrl.includes(param)) {
      missingParams.push(param);
    }
  }

  // Check for pooler endpoint if using Neon
  const isNeon = databaseUrl.includes('neon.tech');
  const hasPooler = databaseUrl.includes('-pooler.');
  
  if (isNeon && !hasPooler) {
    console.warn('WARNING: Using Neon database without connection pooling. URL should contain "-pooler"');
  }
  
  if (missingParams.length > 0) {
    console.warn(`WARNING: DATABASE_URL is missing recommended connection parameters: ${missingParams.join(', ')}`);
    console.warn('Consider adding these parameters for better connection management in serverless environments');
  }
}

// Run validation when this module is loaded
validateConnectionParameters();

// Extract connection limit from DATABASE_URL or use default
function getConnectionLimit(): number {
  const DEFAULT_CONNECTION_LIMIT = 10;
  
  if (typeof process === 'undefined' || typeof window !== 'undefined') {
    return DEFAULT_CONNECTION_LIMIT; // Use default on client-side
  }
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return DEFAULT_CONNECTION_LIMIT;
  }
  
  try {
    // Try to extract connection_limit from the URL
    const match = databaseUrl.match(/connection_limit=(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  } catch (e) {
    // In case of any parsing errors, use default
    console.warn('Error parsing connection_limit from DATABASE_URL', e);
  }
  
  return DEFAULT_CONNECTION_LIMIT;
}

// Get connection limit from environment
const CONNECTION_LIMIT = getConnectionLimit();

/**
 * PrismaClientSingleton class for managing database connections
 * Optimized for serverless environments where connection pooling is important
 */
class PrismaClientSingleton {
  // Singleton instance
  private static instance: PrismaClient | null = null;
  // Track connections
  private static connectionCount = 0;
  
  // Connection cleanup interval (in ms)
  private static CLEANUP_INTERVAL = 30000; // 30 seconds (reduced from 60s)
  // Maximum idle time (in ms)
  private static MAX_IDLE_TIME = 10000; // 10 seconds
  
  // Maximum connections allowed (from DATABASE_URL or default)
  private static MAX_CONNECTIONS = CONNECTION_LIMIT;
  
  // Timestamp of last access
  private static lastAccessed: number = Date.now();
  // Cleanup interval ID
  private static cleanupIntervalId: NodeJS.Timeout | null = null;
  // Is cleanup in progress
  private static isCleaningUp: boolean = false;
  
  /**
   * Get the singleton instance of PrismaClient
   */
  public static getInstance(): PrismaClient {
    const startTime = Date.now();
    
    if (!PrismaClientSingleton.instance) {
      // Track attempt to create a new connection
      metrics.connectionsCreated++;
      
      try {
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
        
        // Monitor query performance using middleware
        if (process.env.NODE_ENV === 'development') {
          PrismaClientSingleton.instance.$use(async (params, next) => {
            const startTime = Date.now();
            
            try {
              const result = await next(params);
              
              // Calculate query time
              const endTime = Date.now();
              const queryTime = endTime - startTime;
              
              // Update metrics
              metrics.totalQueries++;
              metrics.averageQueryTime = 
                (metrics.averageQueryTime * (metrics.totalQueries - 1) + queryTime) / 
                metrics.totalQueries;
              
              return result;
            } catch (error: any) {
              // Track query errors
              if (error.message?.includes('timeout')) {
                metrics.errors.timeoutErrors++;
              } else if (error.message?.includes('connect')) {
                metrics.errors.connectionErrors++;
              } else {
                metrics.errors.queryErrors++;
              }
              throw error;
            }
          });
        }
        
        // Start cleanup timer (only in serverless environments)
        if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
          PrismaClientSingleton.startCleanupTimer();
        }
      } catch (error: any) {
        // Track connection errors
        metrics.errors.connectionErrors++;
        throw error;
      }
    }
    
    // Track connection acquisition time if in development
    if (process.env.NODE_ENV === 'development') {
      const endTime = Date.now();
      const connectionTime = endTime - startTime;
      console.log(`PrismaClient acquisition took ${connectionTime}ms`);
    }
    
    // Update last accessed time
    PrismaClientSingleton.lastAccessed = Date.now();
    return PrismaClientSingleton.instance;
  }
  
  /**
   * Check if we can acquire a new connection
   */
  public static canAcquireConnection(): boolean {
    return PrismaClientSingleton.connectionCount < PrismaClientSingleton.MAX_CONNECTIONS;
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
      PrismaClientSingleton.checkAndCleanupIdleConnections();
    }, PrismaClientSingleton.CLEANUP_INTERVAL);
    
    // Add extra safety by registering cleanup on process events
    if (typeof process !== 'undefined') {
      // Cleanup on idle (in serverless functions this may be important)
      process.on('beforeExit', () => {
        PrismaClientSingleton.checkAndCleanupIdleConnections(true);
      });
      
      // Also try to clean up on termination signals
      ['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach(signal => {
        process.once(signal, async () => {
          try {
            await PrismaClientSingleton.disconnect();
          } finally {
            process.exit(0);
          }
        });
      });
    }
  }
  
  /**
   * Check and clean up idle connections
   */
  private static async checkAndCleanupIdleConnections(force: boolean = false): Promise<void> {
    // Prevent concurrent cleanup operations
    if (PrismaClientSingleton.isCleaningUp) {
      return;
    }
    
    try {
      PrismaClientSingleton.isCleaningUp = true;
      
      const currentTime = Date.now();
      const idleTime = currentTime - PrismaClientSingleton.lastAccessed;
      
      // Log idle connection status in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Database connection idle for ${idleTime}ms, active connections: ${PrismaClientSingleton.connectionCount}`);
      }
      
      // If connection has been idle for too long and we have an instance
      // or if force flag is set and we have no active connections
      if (
        (idleTime > PrismaClientSingleton.MAX_IDLE_TIME || force) && 
        PrismaClientSingleton.instance &&
        PrismaClientSingleton.connectionCount === 0
      ) {
        // Disconnect and clear instance
        await PrismaClientSingleton.disconnect();
      }
    } catch (error: any) {
      console.error('Error during connection cleanup:', error);
    } finally {
      PrismaClientSingleton.isCleaningUp = false;
    }
  }
  
  /**
   * Safely disconnect from the database and clean up
   */
  public static async disconnect(): Promise<void> {
    if (PrismaClientSingleton.instance) {
      try {
        await PrismaClientSingleton.instance.$disconnect();
        PrismaClientSingleton.instance = null;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Prisma disconnected due to inactivity');
        }
      } catch (error: any) {
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
    if (!PrismaClientSingleton.canAcquireConnection()) {
      console.warn(`Warning: Attempting to exceed maximum database connections (${PrismaClientSingleton.MAX_CONNECTIONS})`);
    }
    
    PrismaClientSingleton.connectionCount++;
    
    // Update max concurrent connections metric
    metrics.maxConcurrentConnections = Math.max(
      metrics.maxConcurrentConnections,
      PrismaClientSingleton.connectionCount
    );
    
    PrismaClientSingleton.lastAccessed = Date.now();
  }
  
  /**
   * Track connection release
   */
  public static releaseConnection(): void {
    if (PrismaClientSingleton.connectionCount > 0) {
      PrismaClientSingleton.connectionCount--;
      metrics.connectionsReleased++;
    }
    PrismaClientSingleton.lastAccessed = Date.now();
  }
}

// Maximum number of retry attempts for database operations
const MAX_RETRIES = 3;

// Helper function to wait with exponential backoff
const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Helper to determine if an error is retryable
const isRetryableError = (error: any): boolean => {
  // Common Prisma/DB connection errors that are considered transient
  const retryableErrors = [
    'P1001', // "Can't reach database server"
    'P1002', // "Database connection timed out"
    'P1008', // "Operations timed out"
    'P1017', // "Server has closed the connection"
    'P2024', // "Connection pool timeout"
    '40001',  // Postgres serialization failure
    '40P01',  // Postgres deadlock detected
    '57P01',  // Postgres admin shutdown
    '57P02',  // Postgres crash shutdown
    '57P03',  // Postgres cannot connect now
  ];

  // Check if it's a Prisma error with a code
  if (error?.code && retryableErrors.includes(error.code)) {
    return true;
  }

  // Check if it's a connection-related error
  if (
    error?.message?.includes('connection') ||
    error?.message?.includes('timeout') ||
    error?.message?.includes('timed out') ||
    error?.message?.includes('ECONNREFUSED') ||
    error?.message?.includes('ETIMEDOUT')
  ) {
    return true;
  }

  return false;
};

// Error handling and context
class DatabaseError extends Error {
  public readonly code: string;
  public readonly cause: any;
  public readonly context: Record<string, any>;
  public readonly isRetryable: boolean;

  constructor(message: string, options: {
    code?: string;
    cause?: any;
    context?: Record<string, any>;
    isRetryable?: boolean;
  } = {}) {
    super(message);
    this.name = 'DatabaseError';
    this.code = options.code || 'UNKNOWN_DB_ERROR';
    this.cause = options.cause;
    this.context = options.context || {};
    this.isRetryable = options.isRetryable ?? false;
  }
}

// Function to safely execute database operations with retries and better error handling
export async function withPrismaContext<T>(
  operation: (prisma: PrismaClient) => Promise<T>,
  context: Record<string, any> = {},
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let retries = 0;
  let lastError: any = null;
  const startTime = Date.now();

  // Check if we're already at connection limit
  if (!PrismaClientSingleton.canAcquireConnection()) {
    console.warn(`Connection limit reached (${CONNECTION_LIMIT}). Waiting for available connection...`);
    await wait(100);
  }

  while (retries <= maxRetries) {
    const prisma = PrismaClientSingleton.getInstance();
    PrismaClientSingleton.acquireConnection();
    
    try {
      const result = await operation(prisma);
      
      if (process.env.NODE_ENV === 'development') {
        const queryTime = Date.now() - startTime;
        console.log(`Database operation completed in ${queryTime}ms`, context);
      }
      
      return result;
    } catch (error: any) {
      // Save the error
      lastError = error;
      
      // Add context to the error
      const enhancedContext = {
        ...context,
        attempt: retries + 1,
        maxAttempts: maxRetries + 1,
        timeTaken: Date.now() - startTime,
      };
      
      // Enhance error with context
      const enhancedError = new DatabaseError(
        error.message || 'Database operation failed',
        {
          code: error.code,
          cause: error,
          context: enhancedContext,
          isRetryable: isRetryableError(error)
        }
      );
      
      // Only retry if this is a retryable error
      if (isRetryableError(error) && retries < maxRetries) {
        metrics.retryAttempts++;
        
        const backoffTime = Math.min(100 * Math.pow(2, retries), 3000);
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Database operation failed (attempt ${retries + 1}/${maxRetries + 1}). Retrying in ${backoffTime}ms...`, enhancedContext);
          console.warn(`Error: ${error.message || 'Unknown error'}`);
        }
        
        await wait(backoffTime);
        retries++;
      } else {
        if (retries > 0) {
          metrics.failedRetries++;
        }
        
        // Track specific error types
        if (error.message?.includes('timeout')) {
          metrics.errors.timeoutErrors++;
        } else if (error.message?.includes('connect')) {
          metrics.errors.connectionErrors++;
        } else {
          metrics.errors.otherErrors++;
        }
        
        // Throw enhanced error
        throw enhancedError;
      }
    } finally {
      PrismaClientSingleton.releaseConnection();
    }
  }
  
  metrics.successfulRetries++;
  
  // TypeScript needs this for type safety
  throw lastError;
}

// For backward compatibility, keep the original withPrisma but use the new implementation
export async function withPrisma<T>(
  operation: (prisma: PrismaClient) => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  return withPrismaContext(operation, {}, maxRetries);
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