import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: 
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Middleware to handle connection issues
prisma.$use(async (params, next) => {
  try {
    return await next(params)
  } catch (error) {
    // Handle specific Prisma errors related to connections
    if (
      error instanceof Error && 
      (error.message.includes('Connection pool') || 
       error.message.includes('Can\'t reach database server'))
    ) {
      console.error('Database connection error:', error)
      // You could implement retry logic here if needed
    }
    throw error
  }
})