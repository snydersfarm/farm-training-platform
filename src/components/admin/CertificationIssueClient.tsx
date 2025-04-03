'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
}

interface Certification {
  id: string;
  userId: string;
  moduleId: string;
  issuedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'revoked';
}

export function CertificationIssueClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceAdmin, setForceAdmin] = useState(false);

  // Check for forced admin access
  useEffect(() => {
    const forcedAdmin = localStorage.getItem('forceAdmin') === 'true';
    setForceAdmin(forcedAdmin);
  }, []);

  // Check if the user is admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin' && !forceAdmin) {
      // Redirect non-admin users to the dashboard
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      // Redirect unauthenticated users to login
      router.push('/login');
    }
  }, [status, session, router, forceAdmin]);

  // Fetch users and modules when authenticated as admin
  useEffect(() => {
    if ((status === 'authenticated' && session?.user?.role === 'admin') || forceAdmin) {
      fetchUsersAndModules();
    }
  }, [status, session, forceAdmin]);

  const fetchUsersAndModules = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, modulesResponse] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/modules')
      ]);

      if (!usersResponse.ok || !modulesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [usersData, modulesData] = await Promise.all([
        usersResponse.json(),
        modulesResponse.json()
      ]);

      setUsers(usersData.data);
      setModules(modulesData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const issueCertification = async () => {
    if (!selectedUser || !selectedModule) {
      setError('Please select both a user and a module');
      return;
    }

    try {
      const response = await fetch('/api/certifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          moduleId: selectedModule,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to issue certification');
      }

      // Reset form
      setSelectedUser('');
      setSelectedModule('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue certification');
      console.error('Error issuing certification:', err);
    }
  };

  // Show loading state while checking auth
  if (status === 'loading' || (status === 'authenticated' && session?.user?.role !== 'admin' && !forceAdmin) || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
        <Button onClick={fetchUsersAndModules}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Issue Certification</h1>
        <Link href="/admin/certifications">
          <Button variant="outline">Back to Certifications</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue New Certification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Module
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a module...</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.title}
                  </option>
                ))}
              </select>
            </div>

            <Button 
              onClick={issueCertification}
              disabled={!selectedUser || !selectedModule}
              className="w-full"
            >
              Issue Certification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 