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

export default function CertificationsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if the user is admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin' && session?.user?.email !== 'john@snydersfarm.com') {
      // Redirect non-admin users to the dashboard
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      // Redirect unauthenticated users to login
      router.push('/login');
    }
  }, [status, session, router]);
  
  // Fetch certifications when authenticated as admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchCertifications();
    }
  }, [status, session]);
  
  const fetchCertifications = async () => {
    try {
      setIsLoading(true);
      // This would be a real API endpoint in production
      // For now, we'll use mock data
      
      // Mock data for demonstration
      const mockCertifications = [
        {
          id: 'cert1',
          name: 'Farm Equipment Operation',
          description: 'Certified to operate farm machinery safely',
          moduleId: 'mod1',
          module: {
            title: 'Farm Equipment Safety'
          },
          userId: 'user1',
          user: {
            name: 'John Doe',
            email: 'john@farmtraining.com',
            department: 'Equipment',
            position: 'Operator'
          },
          issuedAt: new Date('2023-08-15').toISOString(),
          expiresAt: new Date('2024-08-15').toISOString(),
          pdfUrl: '/certificates/cert1.pdf'
        },
        {
          id: 'cert2',
          name: 'Livestock Management',
          description: 'Certified in livestock care and management',
          moduleId: 'mod2',
          module: {
            title: 'Livestock Care Basics'
          },
          userId: 'user2',
          user: {
            name: 'Jane Smith',
            email: 'jane@farmtraining.com',
            department: 'Livestock',
            position: 'Caretaker'
          },
          issuedAt: new Date('2023-09-20').toISOString(),
          expiresAt: new Date('2024-09-20').toISOString(),
          pdfUrl: '/certificates/cert2.pdf'
        },
        {
          id: 'cert3',
          name: 'Crop Pest Management',
          description: 'Certified in identifying and treating crop pests',
          moduleId: 'mod3',
          module: {
            title: 'Pest Control Techniques'
          },
          userId: 'user3',
          user: {
            name: 'Robert Johnson',
            email: 'robert@farmtraining.com',
            department: 'Crops',
            position: 'Field Manager'
          },
          issuedAt: new Date('2023-07-10').toISOString(),
          expiresAt: null,
          pdfUrl: '/certificates/cert3.pdf'
        }
      ];
      
      // In a real implementation, this would be:
      // const response = await fetch('/api/admin/certifications');
      // if (!response.ok) {
      //   throw new Error('Failed to fetch certifications');
      // }
      // const data = await response.json();
      // setCertifications(data.data);
      
      setCertifications(mockCertifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching certifications:', err);
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
    const expDate = new Date(expiresAt);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return expDate > today && expDate <= thirtyDaysFromNow;
  };
  
  const revokeCertificate = async (id: string) => {
    // In a real implementation, this would make an API call to revoke the certificate
    // For now, just update the UI by removing the certificate
    setCertifications(certifications.filter(cert => cert.id !== id));
  };
  
  const getStatusBadge = (expiresAt: string | null) => {
    if (!expiresAt) {
      return <Badge variant="default">Permanent</Badge>;
    }
    
    if (isExpired(expiresAt)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (isExpiringSoon(expiresAt)) {
      return <Badge variant="warning" className="bg-amber-100 text-amber-800">Expiring Soon</Badge>;
    }
    
    return <Badge variant="default">Valid</Badge>;
  };
  
  // Show loading state while checking auth or loading data
  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading certifications...</p>
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
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading certifications: {error}
              </p>
            </div>
          </div>
        </div>
        <Button onClick={fetchCertifications} className="flex items-center">
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Certification Management</h1>
        <div className="flex space-x-3">
          <Link href="/admin/certifications/issue">
            <Button className="flex items-center">
              <PlusIcon className="h-4 w-4 mr-2" />
              Issue New Certificate
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline">Back to Admin Dashboard</Button>
          </Link>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Certificates</TabsTrigger>
          <TabsTrigger value="valid">Valid</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Certifications</CardTitle>
              <CardDescription>Manage all user certifications across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certifications.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">
                          {cert.name}
                          <div className="text-xs text-gray-500 mt-1">{cert.module.title}</div>
                        </TableCell>
                        <TableCell>
                          {cert.user.name}
                          <div className="text-xs text-gray-500 mt-1">{cert.user.email}</div>
                        </TableCell>
                        <TableCell>{cert.user.department} - {cert.user.position}</TableCell>
                        <TableCell>{format(new Date(cert.issuedAt), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          {cert.expiresAt 
                            ? format(new Date(cert.expiresAt), 'MMM d, yyyy')
                            : 'Never'}
                        </TableCell>
                        <TableCell>{getStatusBadge(cert.expiresAt)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" title="Download Certificate" className="h-8 w-8 p-0">
                              <DownloadIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              title="Revoke Certificate"
                              className="h-8 w-8 p-0"
                              onClick={() => revokeCertificate(cert.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M18 6L6 18" />
                                <path d="M6 6l12 12" />
                              </svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="valid">
          <Card>
            <CardHeader>
              <CardTitle>Valid Certifications</CardTitle>
              <CardDescription>All currently valid certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certifications
                      .filter(cert => !isExpired(cert.expiresAt))
                      .map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">
                          {cert.name}
                          <div className="text-xs text-gray-500 mt-1">{cert.module.title}</div>
                        </TableCell>
                        <TableCell>
                          {cert.user.name}
                          <div className="text-xs text-gray-500 mt-1">{cert.user.email}</div>
                        </TableCell>
                        <TableCell>{cert.user.department} - {cert.user.position}</TableCell>
                        <TableCell>{format(new Date(cert.issuedAt), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          {cert.expiresAt 
                            ? format(new Date(cert.expiresAt), 'MMM d, yyyy')
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" title="Download Certificate" className="h-8 w-8 p-0">
                              <DownloadIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              title="Revoke Certificate"
                              className="h-8 w-8 p-0"
                              onClick={() => revokeCertificate(cert.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M18 6L6 18" />
                                <path d="M6 6l12 12" />
                              </svg>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expiring">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Soon</CardTitle>
              <CardDescription>Certifications expiring within 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Expires In</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certifications
                      .filter(cert => isExpiringSoon(cert.expiresAt))
                      .map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">
                          {cert.name}
                          <div className="text-xs text-gray-500 mt-1">{cert.module.title}</div>
                        </TableCell>
                        <TableCell>
                          {cert.user.name}
                          <div className="text-xs text-gray-500 mt-1">{cert.user.email}</div>
                        </TableCell>
                        <TableCell>{cert.user.department} - {cert.user.position}</TableCell>
                        <TableCell>
                          {cert.expiresAt && format(new Date(cert.expiresAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {cert.expiresAt && formatDistanceToNow(new Date(cert.expiresAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Button 
                            className="flex items-center" 
                            size="sm"
                          >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Renew
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {certifications.filter(cert => isExpiringSoon(cert.expiresAt)).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No certifications expiring soon
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expired">
          <Card>
            <CardHeader>
              <CardTitle>Expired Certifications</CardTitle>
              <CardDescription>Certifications that have expired</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Expired On</TableHead>
                      <TableHead>Expired</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certifications
                      .filter(cert => isExpired(cert.expiresAt))
                      .map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">
                          {cert.name}
                          <div className="text-xs text-gray-500 mt-1">{cert.module.title}</div>
                        </TableCell>
                        <TableCell>
                          {cert.user.name}
                          <div className="text-xs text-gray-500 mt-1">{cert.user.email}</div>
                        </TableCell>
                        <TableCell>{cert.user.department} - {cert.user.position}</TableCell>
                        <TableCell>
                          {cert.expiresAt && format(new Date(cert.expiresAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {cert.expiresAt && formatDistanceToNow(new Date(cert.expiresAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Button 
                            className="flex items-center" 
                            size="sm"
                          >
                            <RefreshCwIcon className="h-4 w-4 mr-2" />
                            Renew
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {certifications.filter(cert => isExpired(cert.expiresAt)).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No expired certifications
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 