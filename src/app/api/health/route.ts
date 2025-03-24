import { NextResponse } from 'next/server';
import { checkDatabaseHealth, getDatabaseMetrics as getConnectionMetrics } from '@/lib/prisma';
import { getDatabaseMetrics as getAppMetrics } from '@/lib/db-utils';
import type { HealthMetrics } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Use the database health check function
    const isDbHealthy = await checkDatabaseHealth();
    
    if (isDbHealthy) {
      // Get application-level metrics
      const appMetrics = await getAppMetrics();
      
      // Get connection-level metrics
      const connectionMetrics = getConnectionMetrics();
      
      // Create health metrics object
      const metrics: HealthMetrics = {
        application: appMetrics,
        connection: connectionMetrics,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'unknown'
      };
      
      return NextResponse.json({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
        metrics
      }, { status: 200 });
    } else {
      return NextResponse.json({
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}