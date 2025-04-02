import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { SessionProvider } from 'next-auth/react';
import { ErrorClient } from '@/components/auth/ErrorClient';

export default async function ErrorPage() {
  const session = await getServerSession(authOptions);

  return (
    <SessionProvider session={session}>
      <ErrorClient />
    </SessionProvider>
  );
} 