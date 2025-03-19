import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const hashedPassword = await hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });

  // Create sample modules
  const modules = await Promise.all([
    prisma.module.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        title: 'Farm Safety Basics',
        description: 'Learn the fundamental safety practices for working on a farm.',
        content: 'This module covers essential safety protocols and best practices...',
        order: 1,
      },
    }),
    prisma.module.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        title: 'Equipment Operation',
        description: 'Master the safe operation of common farm equipment.',
        content: 'Learn how to operate tractors, harvesters, and other machinery...',
        order: 2,
      },
    }),
    prisma.module.upsert({
      where: { id: '3' },
      update: {},
      create: {
        id: '3',
        title: 'Crop Management',
        description: 'Understanding crop cycles and maintenance.',
        content: 'Discover the best practices for managing different types of crops...',
        order: 3,
      },
    }),
  ]);

  console.log({ user, modules });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 