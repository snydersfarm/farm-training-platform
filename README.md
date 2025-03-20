# Farm Training Platform

A Next.js application that provides training modules for farm workers.

## Features

- User authentication with NextAuth and Firebase
- Training module management
- Progress tracking
- Responsive design with TailwindCSS
- PWA capabilities

## Documentation

- [API Documentation](./API-DOCUMENTATION.md) - Complete list of available API endpoints
- [Deployment Guide](./DEPLOYMENT-GUIDE.md) - Step-by-step guide for deployment
- [Learning Journal](./LEARNING-JOURNAL.md) - Development progress and issue tracking

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy .env.example to .env.local and fill in the values)
4. Set up the database:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   npm run prisma:seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Configuration

The platform is configured to use PostgreSQL for both development and production environments to ensure consistency. Make sure the following environment variables are set:

```
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://username:password@hostname:port/database
```

For local development, you can use a local PostgreSQL instance or a cloud provider like Neon, Supabase, or Railway.

## Deployment to Vercel

### Prerequisites

- A Vercel account
- A PostgreSQL database (Vercel Postgres, PlanetScale, Neon, etc.)
- Firebase project with authentication enabled

### Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, BitBucket)
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project" 
4. Import your repository
5. Configure environment variables:

   ```
   # Database
   DATABASE_PROVIDER=postgresql
   DATABASE_URL=postgresql://username:password@hostname:port/database
   
   # NextAuth
   NEXTAUTH_URL=https://your-production-domain.vercel.app
   NEXTAUTH_SECRET=your-nextauth-secret
   
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   
   # Admin settings
   ADMIN_EMAIL=admin@yourdomain.com
   ```

6. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `.next`

7. Click "Deploy"

## Database Migration

This project uses PostgreSQL for both development and production environments to ensure consistency. When deploying to production:

1. Create a PostgreSQL database with your preferred provider (Vercel Postgres, Neon, Supabase, etc.)
2. Update the DATABASE_URL in your environment variables to point to your production database
3. Deploy to Vercel - the build process will generate the Prisma client
4. After deployment, apply migrations and seed the database if needed:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Technologies Used

- Next.js 15.2
- React 18.2
- TypeScript
- Prisma
- NextAuth.js
- Firebase
- TailwindCSS
- PostgreSQL

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
