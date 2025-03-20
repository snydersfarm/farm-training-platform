# Farm Training Platform Deployment Guide

## Changes Made to Fix Deployment Issues

1. **Configuration Files Cleanup**
   - Removed duplicate configuration files (next.config.mjs and postcss.config.mjs)
   - Kept only the .js versions for consistency

2. **Package Dependencies**
   - Downgraded React from 19.0.0 to 18.2.0 for better stability
   - Removed duplicate authentication libraries (kept @next-auth/prisma-adapter, removed @auth/prisma-adapter)
   - Standardized on bcryptjs (removed bcrypt)
   - Removed dependencies on external UI libraries like lucide-react, using inline SVG components instead

3. **Next.js Configuration**
   - Removed error suppression (eslint.ignoreDuringBuilds and typescript.ignoreBuildErrors)
   - This will help identify and fix actual issues rather than hiding them

4. **Middleware**
   - Implemented proper route protection in middleware.ts
   - Added authentication checks for dashboard routes

5. **Environment Variables**
   - Created .env.example to document required environment variables
   - Added DATABASE_URL to vercel.json

## Deployment to Vercel

### Prerequisites
- A Vercel account
- A PostgreSQL database (Vercel Postgres, Neon, etc.)
- Firebase project with authentication enabled

### Steps

1. **Set Environment Variables in Vercel**
   Make sure to set these in your Vercel project settings:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: A secure random string for session encryption
   - `NEXTAUTH_URL`: Your production URL (e.g., https://farm-training-platform.vercel.app)
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

2. **Push Changes to GitHub**
   ```bash
   git add .
   git commit -m "Fix deployment issues"
   git push origin master
   ```

3. **Deploy from Vercel Dashboard**
   - Connect your GitHub repository in Vercel
   - Vercel should automatically detect the Next.js project
   - The build command is already configured in vercel.json
   - Click "Deploy"

4. **Verify Database Connection**
   - After deployment, check the logs to ensure Prisma is connecting to your database
   - If needed, run database migrations manually:
     ```bash
     npx prisma migrate deploy
     ```

5. **Seed the Database (if needed)**
   - If this is a fresh deployment, you may need to seed the database:
     ```bash
     npx prisma db seed
     ```

## Troubleshooting

- **Prisma Client Generation Errors**: Make sure Prisma is generating during the build process. This is already configured in your build command.
- **Database Connection Issues**: Verify your DATABASE_URL is correct and the database is accessible from Vercel.
- **Authentication Errors**: Check that all Firebase environment variables are set correctly.
- **Build Errors**: If you encounter TypeScript or ESLint errors, fix them rather than suppressing them.
