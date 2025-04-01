import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { SessionProvider } from 'next-auth/react';
import { CertificationsManagementClient } from '@/components/admin/CertificationsManagementClient';

export default async function CertificationsPage() {
  const session = await getServerSession(authOptions);

  return (
    <SessionProvider session={session}>
      <div className="container mx-auto py-8">
        <CertificationsManagementClient />
      </div>
    </SessionProvider>
  );
} 