import { NextRequest } from 'next/server';
import { withRouteHandler, successResponse, errorResponse } from '../route-helpers';
import { z } from 'zod';
import { hash } from 'bcryptjs';

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
  return withRouteHandler(request, async ({ db }) => {
    const users = await db.user.findMany({
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
    
    return successResponse(users, 'Users retrieved successfully');
  });
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  return withRouteHandler(
    request,
    async ({ db, data }) => {
      // Validate data exists
      if (!data) {
        return errorResponse('Invalid user data', 400);
      }
      
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: data.email }
      });
      
      if (existingUser) {
        return errorResponse('User with this email already exists', 400);
      }

      // Hash the password
      const hashedPassword = await hash(data.password, 12);
      
      // Create the new user with all fields
      const newUser = await db.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role || 'USER',
          department: data.department,
          position: data.position
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
    },
    { schema: UserSchema }
  );
} 