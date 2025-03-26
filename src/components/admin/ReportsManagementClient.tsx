'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { DownloadIcon, RefreshCwIcon } from 'lucide-react';
import { format } from 'date-fns';

interface Report {
  id: string;
  title: string;
  type: string;
  generatedAt: string;
  generatedBy: {
    name: string;
    email: string;
  };
  status: 'pending' | 'completed' | 'failed';
  downloadUrl?: string;
}

export function ReportsManagementClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
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
  
  // Fetch reports when authenticated as admin
  useEffect(() => {
    if (status === 'authenticated' && 
       (session?.user?.role === 'ADMIN' || 
        session?.user?.email === 'john@snydersfarm.com' || 
        forceAdmin)) {
      fetchReports();
    }
  }, [status, session, forceAdmin]);
  
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reports');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reports');
      }
      
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (type: string) => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate report');
      }
      
      // Refresh the list
      fetchReports();
    } catch (err) {
      console.error('Error generating report:', err);
      // You might want to show an error toast here
    }
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
        <h1 className="text-3xl font-bold">Reports Management</h1>
        <div className="flex gap-2">
          <Button onClick={fetchReports} variant="outline">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => generateReport('completion')}>
            Generate Completion Report
          </Button>
          <Button onClick={() => generateReport('certification')}>
            Generate Certification Report
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>
            View and manage generated reports
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
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Generated By</TableHead>
                    <TableHead>Generated At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.title}</TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>
                        <div>
                          <div>{report.generatedBy.name}</div>
                          <div className="text-sm text-gray-500">{report.generatedBy.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(report.generatedAt), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${report.status === 'completed' ? 'bg-green-100 text-green-800' :
                            report.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {report.downloadUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={report.downloadUrl} target="_blank" rel="noopener noreferrer">
                              <DownloadIcon className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {reports.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No reports found
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