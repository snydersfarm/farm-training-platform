import { NextRequest } from 'next/server';
import { withRouteHandler, successResponse, errorResponse } from '../../route-helpers';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

// Zod schema for user updates
const UserUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['USER', 'MANAGER', 'ADMIN']).optional(),
  department: z.string().optional(),
  position: z.string().optional()
});

// GET /api/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return errorResponse('Unauthorized', 401);
  }

  return withRouteHandler(request, async ({ db }) => {
    const user = await db.user.findUnique({
      where: { id: params.id },
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

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user, 'User retrieved successfully');
  });
}

// PATCH /api/users/[id] - Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const data = await request.json();
    const validatedData = UserUpdateSchema.parse(data);

    return withRouteHandler(request, async ({ db }) => {
      const updatedUser = await db.user.update({
        where: { id: params.id },
        data: validatedData,
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

      return successResponse(updatedUser, 'User updated successfully');
    });
  } catch (error: any) {
    console.error('User update error:', error);
    if (error.errors) {
      return errorResponse(`Validation error: ${JSON.stringify(error.errors)}`, 400);
    }
    return errorResponse(error.message || 'Failed to update user', 500);
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return errorResponse('Unauthorized', 401);
  }

  return withRouteHandler(request, async ({ db }) => {
    try {
      await db.user.delete({
        where: { id: params.id }
      });

      return successResponse(null, 'User deleted successfully');
    } catch (error: any) {
      console.error('User deletion error:', error);
      return errorResponse('Failed to delete user', 500);
    }
  });
} 