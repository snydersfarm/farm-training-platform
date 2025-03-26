import { UsersManagementClient } from '@/components/admin/UsersManagementClient';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { SessionProvider } from 'next-auth/react';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <SessionProvider session={session}>
      <UsersManagementClient />
    </SessionProvider>
  );
} 