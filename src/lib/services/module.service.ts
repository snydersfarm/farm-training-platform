import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const moduleService = {
  async getAllModules() {
    return prisma.module.findMany({
      orderBy: {
        order: 'asc'
      }
    });
  },

  async getUserProgress(userId: string) {
    const progress = await prisma.progress.findMany({
      where: {
        userId,
      },
      select: {
        moduleId: true,
        percentage: true,
      },
    });

    return progress.map(p => ({
      moduleId: p.moduleId,
      progressPercentage: p.percentage,
    }));
  },

  async getModuleById(id: string) {
    return prisma.module.findUnique({
      where: {
        id,
      },
    });
  },

  async getModuleWithProgress(moduleId: string, userId: string) {
    const [module, progress] = await Promise.all([
      prisma.module.findUnique({
        where: { id: moduleId }
      }),
      prisma.progress.findUnique({
        where: {
          userId_moduleId: {
            userId,
            moduleId
          }
        }
      })
    ]);
    return { module, progress };
  },

  async updateProgress(userId: string, moduleId: string, percentage: number) {
    return prisma.progress.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
      update: {
        percentage,
      },
      create: {
        userId,
        moduleId,
        percentage,
      },
    });
  }
}; 