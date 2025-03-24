import { NextRequest, NextResponse } from 'next/server';
import { withRouteHandler, successResponse, errorResponse } from '../route-helpers';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

// Zod schema for user creation/update with more fields
const UserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['USER', 'MANAGER', 'ADMIN']).optional(),
  department: z.string().optional(),
  position: z.string().optional()
});

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return errorResponse('Unauthorized', 401);
  }

  return withRouteHandler(request, async ({ db }) => {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        position: true,
        createdAt: true,
        emailVerified: true
      }
    });
    
    return successResponse(users, 'Users retrieved successfully');
  });
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const data = await request.json();
    
    // Validate with Zod schema
    const validatedData = UserSchema.parse(data);
    const { name, email, password, role = 'USER', department, position } = validatedData;

    // Check if user already exists in the database
    return await withPrisma(async (prisma) => {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return errorResponse('User with this email already exists', 400);
      }

      // 1. Create user in Firebase Authentication
      let firebaseUser;
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        firebaseUser = userCredential.user;
        console.log('Firebase user created:', firebaseUser.uid);
      } catch (firebaseError: any) {
        console.error('Firebase user creation error:', firebaseError);
        return errorResponse(
          firebaseError.message || 'Failed to create user in authentication system',
          500
        );
      }

      // 2. Hash the password for database storage
      const hashedPassword = await hash(password, 12);
      
      // 3. Create the user in the database with Firebase UID
      try {
        const newUser = await prisma.user.create({
          data: {
            id: firebaseUser.uid, // Use Firebase UID for consistency
            name,
            email,
            password: hashedPassword,
            role,
            department,
            position
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true,
            position: true,
            createdAt: true
          }
        });
        
        return successResponse(newUser, 'User created successfully');
      } catch (dbError: any) {
        console.error('Database user creation error:', dbError);
        // If the database operation fails, we should ideally delete the Firebase user
        // but we'll leave it for now for simplicity
        return errorResponse(
          'User created in authentication system but failed to create in database',
          500
        );
      }
    });
  } catch (error: any) {
    console.error('User creation error:', error);
    if (error.errors) {
      // Zod validation error
      return errorResponse(`Validation error: ${JSON.stringify(error.errors)}`, 400);
    }
    return errorResponse(error.message || 'Failed to create user', 500);
  }
}

// Helper for Prisma connection
async function withPrisma<T>(callback: (prisma: any) => Promise<T>): Promise<T> {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    return await callback(prisma);
  } finally {
    await prisma.$disconnect();
  }
} 