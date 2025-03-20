/**
 * Deployment Verification Script
 * 
 * This script verifies that the environment is properly set up for deployment
 * and tests database connectivity.
 */

// Load environment variables from .env.local first, then .env as fallback
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env', override: false });

// Check required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

console.log('\n🔍 Checking environment variables...');
let missingVars = [];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing ${varName}`);
    missingVars.push(varName);
  } else {
    // Mask sensitive information
    const value = process.env[varName];
    const maskedValue = value.length > 8 
      ? value.substring(0, 4) + '...' + value.substring(value.length - 4) 
      : '****';
    console.log(`✅ ${varName} is set [${maskedValue}]`);
  }
});

if (missingVars.length > 0) {
  console.error(`\n❌ Missing ${missingVars.length} required environment variables. Please set them before deploying.`);
  process.exit(1);
}

// Test database connection
console.log('\n🔌 Testing database connection...');

// Lazy-load PrismaClient to avoid issues if the environment variables are missing
async function testDatabaseConnection() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('📊 Connecting to database...');
    const result = await prisma.$queryRaw`SELECT 1 as "connection_test"`;
    
    if (Array.isArray(result) && result.length > 0) {
      console.log('✅ Database connection successful!');
      
      // Check schema
      console.log('\n📋 Checking database schema...');
      const userCount = await prisma.user.count();
      console.log(`👤 User count: ${userCount}`);
      
      const moduleCount = await prisma.module.count();
      console.log(`📚 Module count: ${moduleCount}`);
      
      await prisma.$disconnect();
      return true;
    } else {
      console.error('❌ Database connection test failed - no result returned');
      await prisma.$disconnect();
      return false;
    }
  } catch (error) {
    console.error('❌ Database connection test failed:');
    console.error(error);
    return false;
  }
}

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
const fs = require('fs');
const path = require('path');

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const requiredScripts = ['build', 'start', 'prisma:generate'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ Script "${script}" found: ${packageJson.scripts[script]}`);
    } else {
      console.error(`❌ Missing script: ${script}`);
    }
  });
  
  // Check for prisma generate in build script
  if (packageJson.scripts && packageJson.scripts.build && 
      packageJson.scripts.build.includes('prisma generate')) {
    console.log('✅ build script includes prisma generate');
  } else {
    console.warn('⚠️ build script might not include prisma generate');
  }
} catch (error) {
  console.error('❌ Error checking package.json:');
  console.error(error);
}

// Run tests asynchronously
async function runTests() {
  console.log('\n🚀 Starting deployment verification...');
  
  const dbSuccess = await testDatabaseConnection();
  
  console.log('\n📝 Verification Summary:');
  console.log(`✅ Environment variables: ${missingVars.length === 0 ? 'All present' : 'Missing variables'}`);
  console.log(`✅ Database connection: ${dbSuccess ? 'Successful' : 'Failed'}`);
  
  if (missingVars.length === 0 && dbSuccess) {
    console.log('\n🎉 Deployment verification passed! The application is ready to deploy.');
    process.exit(0);
  } else {
    console.error('\n❌ Deployment verification failed. Please fix the issues before deploying.');
    process.exit(1);
  }
}

runTests(); 