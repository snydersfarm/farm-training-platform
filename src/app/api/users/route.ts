import { NextRequest } from 'next/server';
import { withRouteHandler, successResponse, errorResponse } from '../route-helpers';
import { z } from 'zod';

// Zod schema for user creation/update
const UserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  role: z.enum(['USER', 'MANAGER', 'ADMIN']).optional()
});

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  return withRouteHandler(request, async ({ db }) => {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    return successResponse(users, 'Users retrieved successfully');
  });
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  return withRouteHandler(
    request,
    async ({ db, data }) => {
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: data.email }
      });
      
      if (existingUser) {
        return errorResponse('User with this email already exists', 400);
      }
      
      // Create the new user
      const newUser = await db.user.create({
        data: {
          name: data.name,
          email: data.email,
          role: data.role || 'USER'
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });
      
      return successResponse(newUser, 'User created successfully');
    },
    { schema: UserSchema }
  );
} 