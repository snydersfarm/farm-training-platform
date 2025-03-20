import { NextRequest } from 'next/server';
import { withRouteHandler, successResponse, errorResponse } from '../route-helpers';
import { z } from 'zod';

// Zod schema for module creation/update
const ModuleSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  content: z.string(),
  categoryId: z.string().optional(),
  requiredMinutes: z.number().int().min(0).optional(),
  difficulty: z.string().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  requiresVerification: z.boolean().optional(),
  order: z.number().int().min(0).optional()
});

// GET /api/modules - Get all modules
export async function GET(request: NextRequest) {
  return withRouteHandler(request, async ({ db }) => {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    
    // Build the query filter
    const filter: any = {};
    
    if (published === 'true') {
      filter.isPublished = true;
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }
    
    if (category) {
      filter.categoryId = category;
    }
    
    // Query the database
    const modules = await db.module.findMany({
      where: filter,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });
    
    return successResponse(modules, 'Modules retrieved successfully');
  });
}

// POST /api/modules - Create a new module
export async function POST(request: NextRequest) {
  return withRouteHandler(
    request,
    async ({ db, data }) => {
      // Check if module with this title already exists
      const existingModule = await db.module.findUnique({
        where: { title: data.title }
      });
      
      if (existingModule) {
        return errorResponse('Module with this title already exists', 400);
      }
      
      // Create the new module
      const newModule = await db.module.create({
        data: {
          title: data.title,
          description: data.description,
          content: data.content,
          categoryId: data.categoryId,
          requiredMinutes: data.requiredMinutes || 0,
          difficulty: data.difficulty || 'Beginner',
          isPublished: data.isPublished || false,
          isFeatured: data.isFeatured || false,
          requiresVerification: data.requiresVerification || false,
          order: data.order || 0
        }
      });
      
      return successResponse(newModule, 'Module created successfully');
    },
    { schema: ModuleSchema }
  );
} 