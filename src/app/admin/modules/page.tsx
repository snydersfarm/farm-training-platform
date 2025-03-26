import { ModulesManagementClient } from '@/components/admin/ModulesManagementClient';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { SessionProvider } from 'next-auth/react';

export default async function ModulesPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <SessionProvider session={session}>
      <ModulesManagementClient />
    </SessionProvider>
  );
} 