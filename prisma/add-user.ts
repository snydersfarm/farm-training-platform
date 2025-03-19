import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create specific user
  const hashedPassword = await hash('JpsMls4904', 12);
  const user = await prisma.user.upsert({
    where: { email: 'john@snydersfarm.com' },
    update: {},
    create: {
      email: 'john@snydersfarm.com',
      name: 'John Snyder',
      password: hashedPassword,
    },
  });

  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 