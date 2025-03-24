import { PrismaClient } from '@prisma/client';
import { getPrismaClient, withPrisma } from '../../../prisma/connection';

const prisma = getPrismaClient();

export const moduleService = {
  async getAllModules() {
    return withPrisma(client => client.module.findMany({
      orderBy: {
        order: 'asc'
      }
    }));
  },

  async getUserProgress(userId: string) {
    return withPrisma(async (client) => {
      const progress = await client.progress.findMany({
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
    });
  },

  async getModuleById(id: string) {
    return withPrisma(client => client.module.findUnique({
      where: {
        id,
      },
    }));
  },

  async getModuleWithProgress(moduleId: string, userId: string) {
    return withPrisma(async (client) => {
      const [module, progress] = await Promise.all([
        client.module.findUnique({
          where: { id: moduleId }
        }),
        client.progress.findUnique({
          where: {
            userId_moduleId: {
              userId,
              moduleId
            }
          }
        })
      ]);
      return { module, progress };
    });
  },

  async updateProgress(userId: string, moduleId: string, percentage: number) {
    return withPrisma(client => client.progress.upsert({
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
    }));
  }
}; 