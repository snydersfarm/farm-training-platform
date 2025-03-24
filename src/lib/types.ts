/**
 * Shared types for database connections and metrics
 */

import { DefaultSession } from "next-auth";

// Connection metrics interface
export interface DatabaseConnectionMetrics {
  connectionsCreated: number;
  connectionsReleased: number;
  maxConcurrentConnections: number;
  retryAttempts: number;
  successfulRetries: number;
  failedRetries: number;
  averageQueryTime: number;
  totalQueries: number;
  errors: {
    connectionErrors: number;
    queryErrors: number;
    timeoutErrors: number;
    otherErrors: number;
  };
  lastReset: Date;
}

// Application metrics interface
export interface ApplicationMetrics {
  userCount: number;
  moduleCount: number;
  progressCount: number;
  lastChecked: string;
}

// Combined metrics interface
export interface HealthMetrics {
  application: ApplicationMetrics;
  connection: DatabaseConnectionMetrics;
  uptime: number;
  environment: string;
}

// Extend Next Auth session types to include our custom user properties
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
      department?: string | null;
      position?: string | null;
      emailVerified?: Date | null;
    } & DefaultSession["user"]
  }
} 