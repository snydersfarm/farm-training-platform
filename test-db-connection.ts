import { PrismaClient } from '@prisma/client'

// Initialize a new Prisma client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  try {
    // Test the connection with a simple query
    console.log('Testing database connection...')
    const result = await prisma.$queryRaw`SELECT 1 as "connection_test"`
    
    console.log('Connection successful!', result)
    
    // Check database tables
    console.log('\nChecking database schema...')
    
    // List all users (if any)
    const userCount = await prisma.user.count()
    console.log(`User count: ${userCount}`)
    
    // List all modules (if any)
    const moduleCount = await prisma.module.count()
    console.log(`Module count: ${moduleCount}`)
    
    console.log('\nDatabase connection and schema verified successfully!')
  } catch (error) {
    console.error('Database connection test failed:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 