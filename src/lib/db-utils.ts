import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';
import type { ApplicationMetrics } from './types';

// Pool Connection Manager for serverless environment
// This helps manage connection lifecycles in serverless environments
export class ConnectionManager {
  private static instance: ConnectionManager;
  private activeConnections: number = 0;
  private maxIdleTime: number = 10000; // 10 seconds max idle time

  private constructor() {
    // Initialize cleanup timer
    if (typeof window === 'undefined') { // Only run on server
      setInterval(() => this.cleanupIdleConnections(), 5000); // Check every 5 seconds
    }
  }

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  // Get a connection from the pool
  public async getConnection() {
    this.activeConnections++;
    return prisma;
  }

  // Release a connection back to the pool
  public async releaseConnection() {
    if (this.activeConnections > 0) {
      this.activeConnections--;
    }
  }

  // Clean up idle connections
  private async cleanupIdleConnections() {
    if (this.activeConnections === 0 && process.env.NODE_ENV === 'production') {
      try {
        // No active connections, disconnect prisma
        await (prisma as any).$disconnect();
      } catch (error) {
        console.error('Error disconnecting from database:', error);
      }
    }
  }
}

// Use this in API routes for safe database access
export async function withDatabase<T>(callback: (db: PrismaClient) => Promise<T>): Promise<T> {
  const connectionManager = ConnectionManager.getInstance();
  const db = await connectionManager.getConnection();
  
  try {
    // Execute the callback with the database connection
    return await callback(db);
  } finally {
    // Always release the connection when done
    await connectionManager.releaseConnection();
  }
}

// Generate database metrics
export async function getDatabaseMetrics(): Promise<ApplicationMetrics> {
  try {
    // Sample metrics
    const userCount = await prisma.user.count();
    const moduleCount = await prisma.module.count();
    const progressCount = await prisma.progress.count();
    
    return {
      userCount,
      moduleCount,
      progressCount,
      lastChecked: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Error generating database metrics:', error);
    return {
      userCount: -1,
      moduleCount: -1,
      progressCount: -1,
      lastChecked: new Date().toISOString(),
    };
  }
} 