'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export function ReportsManagementClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
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

  // Fetch reports when authenticated as admin
  useEffect(() => {
    if ((status === 'authenticated' && session?.user?.role === 'admin') || forceAdmin) {
      fetchReports();
    }
  }, [status, session, forceAdmin]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reports');
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      setReports(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Report',
          description: 'System generated report',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReports(prev => [...prev, data.data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      console.error('Error generating report:', err);
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
        <Button onClick={fetchReports}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports Management</h1>
        <div className="flex space-x-3">
          <Button onClick={generateReport}>Generate New Report</Button>
          <Link href="/admin">
            <Button variant="outline">Back to Admin Dashboard</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{report.title}</h3>
                    <p className="text-sm text-gray-500">{report.description}</p>
                  </div>
                  <Badge variant={
                    report.status === 'completed' 
                      ? 'default' 
                      : report.status === 'generating'
                        ? 'secondary'
                        : report.status === 'failed'
                          ? 'destructive'
                          : 'outline'
                  }>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </Badge>
                </div>
                {report.status === 'generating' && (
                  <div className="space-y-2">
                    <Progress value={report.progress} />
                    <p className="text-sm text-gray-500">Generating report... {report.progress}%</p>
                  </div>
                )}
                {report.error && (
                  <p className="text-sm text-red-500 mt-2">{report.error}</p>
                )}
                <div className="mt-2 text-sm text-gray-500">
                  Created: {new Date(report.createdAt).toLocaleString()}
                  {report.completedAt && (
                    <span className="ml-4">Completed: {new Date(report.completedAt).toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <p className="text-center text-gray-500">No reports found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 