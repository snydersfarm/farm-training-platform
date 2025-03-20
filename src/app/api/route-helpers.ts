import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { withPrisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

/**
 * Wrapper for API routes with database access and validation
 * 
 * @param handler - The handler function to execute
 * @param options - Configuration options
 * @returns A promise that resolves to a NextResponse
 */
export async function withRouteHandler<T = any>(
  request: NextRequest,
  handler: (params: {
    db: PrismaClient;
    req: NextRequest;
    data?: T;
  }) => Promise<NextResponse>,
  options?: {
    schema?: ZodSchema<T>;
    requireAuth?: boolean;
  }
): Promise<NextResponse> {
  const startTime = Date.now();
  let parsedData: T | undefined;
  
  try {
    // Parse request body if schema is provided
    if (options?.schema) {
      try {
        const body = await request.json();
        parsedData = options.schema.parse(body);
      } catch (error) {
        if (error instanceof ZodError) {
          return NextResponse.json({
            success: false,
            message: 'Validation error',
            errors: error.errors
          }, { status: 400 });
        }
        
        return NextResponse.json({
          success: false,
          message: 'Invalid request body'
        }, { status: 400 });
      }
    }
    
    // Execute handler with database access
    return await withPrisma(async (db) => {
      const response = await handler({
        db,
        req: request,
        data: parsedData
      });
      
      // Add performance header
      response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
      
      return response;
    });
  } catch (error) {
    console.error('API route error:', error);
    
    // Return appropriate error response
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}

/**
 * Create a success response with proper formatting
 */
export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    message: message || 'Success',
    data
  }, { status: 200 });
}

/**
 * Create an error response with proper formatting
 */
export function errorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json({
    success: false,
    message
  }, { status });
}

/**
 * Check if the request is from an authenticated user
 */
export function isAuthenticated(request: NextRequest): boolean {
  // This is a simplified check - in a real app you would verify tokens
  const authHeader = request.headers.get('authorization');
  return !!authHeader && authHeader.startsWith('Bearer ');
}

/**
 * Extract user info from the request
 */
export function getUserFromRequest(request: NextRequest): { id: string; role: string } | null {
  // Simplified example - in a real app this would decode JWT or session
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    // Here you would decode and verify JWT token
    // This is just a placeholder
    return {
      id: 'user-id',
      role: 'user'
    };
  } catch (error) {
    return null;
  }
} 