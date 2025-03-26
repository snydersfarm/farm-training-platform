import { ReportsManagementClient } from '@/components/admin/ReportsManagementClient';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { SessionProvider } from 'next-auth/react';

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <SessionProvider session={session}>
      <ReportsManagementClient />
    </SessionProvider>
  );
} 