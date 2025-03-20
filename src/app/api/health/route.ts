import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/prisma';
import { getDatabaseMetrics } from '@/lib/db-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Use the database health check function
    const isDbHealthy = await checkDatabaseHealth();
    
    if (isDbHealthy) {
      // Get additional database metrics
      const metrics = await getDatabaseMetrics();
      
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