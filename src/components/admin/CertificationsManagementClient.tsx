'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CalendarIcon, PlusIcon, RefreshCwIcon, DownloadIcon } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Certification {
  id: string;
  name: string;
  description: string;
  moduleId: string;
  module: {
    title: string;
  };
  userId: string;
  user: {
    name: string;
    email: string;
    department: string;
    position: string;
  };
  issuedAt: string;
  expiresAt: string | null;
  pdfUrl: string | null;
}

export function CertificationsManagementClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceAdmin, setForceAdmin] = useState(false);
  
  // Check for forced admin access (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasForceAdmin = localStorage.getItem('forceAdmin') === 'true';
      setForceAdmin(hasForceAdmin);
    }
  }, []);
  
  // Check if the user is admin
  useEffect(() => {
    if (status === 'authenticated' && 
        session?.user?.role !== 'ADMIN' && 
        session?.user?.email !== 'john@snydersfarm.com' &&
        !forceAdmin) {
      // Redirect non-admin users to the dashboard
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      // Redirect unauthenticated users to login
      router.push('/login');
    }
  }, [status, session, router, forceAdmin]);
  
  // Fetch certifications when authenticated as admin
  useEffect(() => {
    if (status === 'authenticated' && 
       (session?.user?.role === 'ADMIN' || 
        session?.user?.email === 'john@snydersfarm.com' || 
        forceAdmin)) {
      fetchCertifications();
    }
  }, [status, session, forceAdmin]);
  
  const fetchCertifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/certifications');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch certifications');
      }
      
      setCertifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch certifications');
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(expiresAt) < thirtyDaysFromNow && !isExpired(expiresAt);
  };

  const revokeCertificate = async (id: string) => {
    try {
      const response = await fetch(`/api/certifications/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to revoke certificate');
      }
      
      // Refresh the list
      fetchCertifications();
    } catch (err) {
      console.error('Error revoking certificate:', err);
      // You might want to show an error toast here
    }
  };

  const getStatusBadge = (expiresAt: string | null) => {
    if (isExpired(expiresAt)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (isExpiringSoon(expiresAt)) {
      return <Badge variant="warning">Expiring Soon</Badge>;
    }
    return <Badge variant="success">Valid</Badge>;
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || (session?.user?.role !== 'ADMIN' && !forceAdmin)) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Certifications Management</h1>
        <div className="flex gap-2">
          <Button onClick={fetchCertifications} variant="outline">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Issue New Certificate
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Certifications</CardTitle>
          <CardDescription>
            Manage and track all issued certifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certifications.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.name}</TableCell>
                      <TableCell>
                        <div>
                          <div>{cert.user.name}</div>
                          <div className="text-sm text-gray-500">{cert.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{cert.module.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {format(new Date(cert.issuedAt), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {cert.expiresAt ? (
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {format(new Date(cert.expiresAt), 'MMM d, yyyy')}
                          </div>
                        ) : (
                          'Never'
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(cert.expiresAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {cert.pdfUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                                <DownloadIcon className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => revokeCertificate(cert.id)}
                          >
                            Revoke
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {certifications.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No certifications found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 