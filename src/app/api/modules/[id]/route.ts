import { NextRequest } from 'next/server';
import { withRouteHandler, successResponse, errorResponse } from '../../route-helpers';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

// Zod schema for module updates
const ModuleUpdateSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  content: z.string().optional(),
  categoryId: z.string().optional(),
  requiredMinutes: z.number().int().min(0).optional(),
  difficulty: z.string().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  requiresVerification: z.boolean().optional(),
  order: z.number().int().min(0).optional()
});

// GET /api/modules/[id] - Get a specific module
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRouteHandler(request, async ({ db }) => {
    const module = await db.module.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    if (!module) {
      return errorResponse('Module not found', 404);
    }

    return successResponse(module, 'Module retrieved successfully');
  });
}

// PATCH /api/modules/[id] - Update a module
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || !['admin', 'manager'].includes(session.user?.role || '')) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const data = await request.json();
    const validatedData = ModuleUpdateSchema.parse(data);

    return withRouteHandler(request, async ({ db }) => {
      const updatedModule = await db.module.update({
        where: { id: params.id },
        data: validatedData,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true
            }
          }
        }
      });

      return successResponse(updatedModule, 'Module updated successfully');
    });
  } catch (error: any) {
    console.error('Module update error:', error);
    if (error.errors) {
      return errorResponse(`Validation error: ${JSON.stringify(error.errors)}`, 400);
    }
    return errorResponse(error.message || 'Failed to update module', 500);
  }
}

// DELETE /api/modules/[id] - Delete a module
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
      await db.module.delete({
        where: { id: params.id }
      });

      return successResponse(null, 'Module deleted successfully');
    } catch (error: any) {
      console.error('Module deletion error:', error);
      return errorResponse('Failed to delete module', 500);
    }
  });
} 