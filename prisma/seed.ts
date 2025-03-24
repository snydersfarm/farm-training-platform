import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import { withPrisma } from './connection';

// We don't need direct instantiation anymore
// const prisma = new PrismaClient();

async function main() {
  await withPrisma(async (prisma) => {
    // Create users with different roles
    const adminPassword = await hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'john@snydersfarm.com' },
      update: {
        role: UserRole.ADMIN,
        department: 'Management',
        position: 'Farm Owner',
        hireDate: new Date('2010-01-01'),
      },
      create: {
        email: 'john@snydersfarm.com',
        name: 'John Snyder',
        password: adminPassword,
        role: UserRole.ADMIN,
        department: 'Management',
        position: 'Farm Owner',
        hireDate: new Date('2010-01-01'),
      },
    });

    const managerPassword = await hash('manager123', 12);
    const manager = await prisma.user.upsert({
      where: { email: 'manager@snydersfarm.com' },
      update: {
        role: UserRole.MANAGER,
        department: 'Livestock',
        position: 'Department Manager',
      },
      create: {
        email: 'manager@snydersfarm.com',
        name: 'Sarah Thompson',
        password: managerPassword,
        role: UserRole.MANAGER,
        department: 'Livestock',
        position: 'Department Manager',
        hireDate: new Date('2018-03-15'),
      },
    });

    const workerPassword = await hash('password123', 12);
    const worker = await prisma.user.upsert({
      where: { email: 'worker@snydersfarm.com' },
      update: {
        department: 'Crops',
        position: 'Field Worker',
      },
      create: {
        email: 'worker@snydersfarm.com',
        name: 'Michael Davis',
        password: workerPassword,
        role: UserRole.USER,
        department: 'Crops',
        position: 'Field Worker',
        hireDate: new Date('2022-05-10'),
      },
    });

    // Create categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Safety' },
        update: {},
        create: {
          name: 'Safety',
          description: 'Training modules focused on farm safety protocols',
          icon: 'shield',
          color: '#FF5733',
          order: 1,
        },
      }),
      prisma.category.upsert({
        where: { name: 'Equipment' },
        update: {},
        create: {
          name: 'Equipment',
          description: 'Learn how to operate and maintain farm equipment',
          icon: 'tractor',
          color: '#33A8FF',
          order: 2,
        },
      }),
      prisma.category.upsert({
        where: { name: 'Crops' },
        update: {},
        create: {
          name: 'Crops',
          description: 'Training on crop management and harvesting',
          icon: 'wheat',
          color: '#79FF33',
          order: 3,
        },
      }),
      prisma.category.upsert({
        where: { name: 'Livestock' },
        update: {},
        create: {
          name: 'Livestock',
          description: 'Animal care and livestock management',
          icon: 'cow',
          color: '#D133FF',
          order: 4,
        },
      }),
    ]);

    // Create modules
    const safetyModule = await prisma.module.upsert({
      where: { title: 'Farm Safety Basics' },
      update: {
        categoryId: categories[0].id,
        requiredMinutes: 60,
        isPublished: true,
        isFeatured: true,
      },
      create: {
        title: 'Farm Safety Basics',
        description: 'Learn the fundamental safety practices for working on a farm.',
        content: 'This module covers essential safety protocols and best practices for farm workers.',
        categoryId: categories[0].id,
        requiredMinutes: 60,
        difficulty: 'Beginner',
        isPublished: true,
        isFeatured: true,
        order: 1,
      },
    });

    const tractorModule = await prisma.module.upsert({
      where: { title: 'Tractor Operation Safety' },
      update: {
        categoryId: categories[1].id,
        requiredMinutes: 90,
        isPublished: true,
      },
      create: {
        title: 'Tractor Operation Safety',
        description: 'Master the safe operation of tractors and attachments.',
        content: 'Learn how to safely operate tractors and implement safety protocols.',
        categoryId: categories[1].id,
        requiredMinutes: 90,
        difficulty: 'Intermediate',
        isPublished: true,
        requiresVerification: true,
        order: 2,
      },
    });

    const cropsModule = await prisma.module.upsert({
      where: { title: 'Crop Rotation Techniques' },
      update: {
        categoryId: categories[2].id,
        requiredMinutes: 75,
        isPublished: true,
      },
      create: {
        title: 'Crop Rotation Techniques',
        description: 'Understanding crop rotation for soil health and yield improvement.',
        content: 'Discover the best practices for crop rotation to maintain soil health.',
        categoryId: categories[2].id,
        requiredMinutes: 75,
        difficulty: 'Intermediate',
        isPublished: true,
        order: 3,
      },
    });

    const livestockModule = await prisma.module.upsert({
      where: { title: 'Livestock Management' },
      update: {
        categoryId: categories[3].id,
        requiredMinutes: 120,
        isPublished: true,
      },
      create: {
        title: 'Livestock Management',
        description: 'Comprehensive training on livestock care and management.',
        content: 'Learn about animal welfare, health monitoring, and management practices.',
        categoryId: categories[3].id,
        requiredMinutes: 120,
        difficulty: 'Advanced',
        isPublished: true,
        order: 4,
      },
    });

    // Add prerequisites
    await prisma.modulePrerequisite.upsert({
      where: {
        moduleId_prerequisiteId: {
          moduleId: tractorModule.id,
          prerequisiteId: safetyModule.id,
        },
      },
      update: {},
      create: {
        moduleId: tractorModule.id,
        prerequisiteId: safetyModule.id,
      },
    });

    // Create lessons for Farm Safety Basics module
    const safetyLessons = await Promise.all([
      prisma.lesson.upsert({
        where: { 
          id: 'safety-lesson-1',
        },
        update: {},
        create: {
          id: 'safety-lesson-1',
          title: 'Introduction to Farm Safety',
          content: 'Overview of common farm hazards and safety principles.',
          moduleId: safetyModule.id,
          type: 'text',
          duration: 15,
          order: 1,
        },
      }),
      prisma.lesson.upsert({
        where: { 
          id: 'safety-lesson-2',
        },
        update: {},
        create: {
          id: 'safety-lesson-2',
          title: 'Personal Protective Equipment',
          content: 'Learn about the proper PPE for different farm tasks.',
          moduleId: safetyModule.id,
          type: 'video',
          duration: 20,
          order: 2,
        },
      }),
      prisma.lesson.upsert({
        where: { 
          id: 'safety-lesson-3',
        },
        update: {},
        create: {
          id: 'safety-lesson-3',
          title: 'Emergency Procedures',
          content: 'How to respond to common farm emergencies.',
          moduleId: safetyModule.id,
          type: 'text',
          duration: 15,
          order: 3,
        },
      }),
      prisma.lesson.upsert({
        where: { 
          id: 'safety-lesson-4',
        },
        update: {},
        create: {
          id: 'safety-lesson-4',
          title: 'Farm Safety Assessment',
          content: 'Test your knowledge of farm safety principles.',
          moduleId: safetyModule.id,
          type: 'quiz',
          duration: 10,
          order: 4,
        },
      }),
    ]);

    // Create progress records
    await prisma.progress.upsert({
      where: {
        userId_moduleId: {
          userId: worker.id,
          moduleId: safetyModule.id,
        },
      },
      update: {
        percentage: 100,
        status: 'completed',
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      create: {
        userId: worker.id,
        moduleId: safetyModule.id,
        percentage: 100,
        status: 'completed',
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    });

    await prisma.progress.upsert({
      where: {
        userId_moduleId: {
          userId: worker.id,
          moduleId: tractorModule.id,
        },
      },
      update: {
        percentage: 40,
        status: 'in_progress',
        startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      create: {
        userId: worker.id,
        moduleId: tractorModule.id,
        percentage: 40,
        status: 'in_progress',
        startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    });

    // Create lesson progress records
    for (const lesson of safetyLessons) {
      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: worker.id,
            lessonId: lesson.id,
          },
        },
        update: {
          completed: true,
          timeSpent: lesson.duration * 60, // convert minutes to seconds
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + lesson.order * 60 * 60 * 1000),
        },
        create: {
          userId: worker.id,
          lessonId: lesson.id,
          completed: true,
          timeSpent: lesson.duration * 60, // convert minutes to seconds
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + lesson.order * 60 * 60 * 1000),
        },
      });
    }

    // Create certification for completed module
    await prisma.certification.upsert({
      where: {
        userId_moduleId: {
          userId: worker.id,
          moduleId: safetyModule.id,
        },
      },
      update: {},
      create: {
        name: 'Farm Safety Certified',
        description: 'Has completed all requirements for farm safety training',
        moduleId: safetyModule.id,
        userId: worker.id,
        issuedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        pdfUrl: '/certificates/farm-safety-certificate.pdf',
      },
    });

    // Add a note from manager to worker
    await prisma.userNote.upsert({
      where: {
        id: 'note-1',
      },
      update: {},
      create: {
        id: 'note-1',
        userId: worker.id,
        authorId: manager.id,
        content: 'Michael has shown excellent progress in the safety training. Ready for equipment training.',
      },
    });

    console.log('Database seeded successfully!');
  });
}

// Execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // No need to disconnect here as withPrisma handles this
  }); 