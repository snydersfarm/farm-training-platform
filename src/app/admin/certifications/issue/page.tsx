import { CertificationIssueClient } from '@/components/admin/CertificationIssueClient';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { SessionProvider } from 'next-auth/react';

export default async function CertificationIssuePage() {
  const session = await getServerSession(authOptions);
  
  return (
    <SessionProvider session={session}>
      <CertificationIssueClient />
    </SessionProvider>
  );
} 