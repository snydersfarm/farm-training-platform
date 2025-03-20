// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

// Check environment variables
console.log('Checking environment variables:');
console.log('DATABASE_URL exists:', Boolean(process.env.DATABASE_URL));
console.log('DIRECT_URL exists:', Boolean(process.env.DIRECT_URL));

// Log the database URLs for debugging (masking credentials)
if (process.env.DATABASE_URL) {
  const maskedUrl = process.env.DATABASE_URL.replace(
    /(postgresql:\/\/[^:]+:)([^@]+)(@.+)/,
    '$1********$3'
  );
  console.log('DATABASE_URL:', maskedUrl);
}

if (process.env.DIRECT_URL) {
  const maskedDirectUrl = process.env.DIRECT_URL.replace(
    /(postgresql:\/\/[^:]+:)([^@]+)(@.+)/,
    '$1********$3'
  );
  console.log('DIRECT_URL:', maskedDirectUrl);
}

// Initialize a new Prisma client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    // Test the connection with a simple query
    console.log('\nTesting database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as "connection_test"`;
    
    console.log('Connection successful!', result);
    
    // Check database tables
    console.log('\nChecking database schema...');
    
    // List all users (if any)
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);
    
    // List all modules (if any)
    const moduleCount = await prisma.module.count();
    console.log(`Module count: ${moduleCount}`);
    
    console.log('\nDatabase connection and schema verified successfully!');
  } catch (error) {
    console.error('Database connection test failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 