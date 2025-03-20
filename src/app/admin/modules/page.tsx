'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Module {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  isFeatured: boolean;
  difficulty: string;
  order: number;
  createdAt: string;
}

export default function ModulesManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if the user is admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      // Redirect non-admin users to the dashboard
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      // Redirect unauthenticated users to login
      router.push('/login');
    }
  }, [status, session, router]);
  
  // Fetch modules when authenticated as admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchModules();
    }
  }, [status, session]);
  
  const fetchModules = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/modules');
      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }
      const data = await response.json();
      setModules(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching modules:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle module publish status
  const togglePublish = async (id: string, currentStatus: boolean) => {
    // In a real implementation, this would make an API call to update the module
    // For now, just update the UI optimistically
    setModules(modules.map(module => 
      module.id === id 
        ? { ...module, isPublished: !currentStatus }
        : module
    ));
  };
  
  // Toggle module featured status
  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    // In a real implementation, this would make an API call to update the module
    // For now, just update the UI optimistically
    setModules(modules.map(module => 
      module.id === id 
        ? { ...module, isFeatured: !currentStatus }
        : module
    ));
  };
  
  // Show loading state while checking auth
  if (status === 'loading' || (status === 'authenticated' && session?.user?.role !== 'admin') || isLoading) {
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
        <Button onClick={fetchModules}>Try Again</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Module Management</h1>
        <div className="flex space-x-3">
          <Link href="/admin/modules/create">
            <Button>Create New Module</Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline">Back to Admin Dashboard</Button>
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Title</th>
                  <th scope="col" className="px-6 py-3">Difficulty</th>
                  <th scope="col" className="px-6 py-3">Order</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Featured</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => (
                  <tr key={module.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{module.title}</td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        module.difficulty === 'Advanced' 
                          ? 'destructive' 
                          : module.difficulty === 'Intermediate' 
                            ? 'secondary' 
                            : 'default'
                      }>
                        {module.difficulty}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{module.order}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={module.isPublished ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => togglePublish(module.id, module.isPublished)}
                      >
                        {module.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={module.isFeatured ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleFeatured(module.id, module.isFeatured)}
                      >
                        {module.isFeatured ? 'Featured' : 'Regular'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link href={`/admin/modules/${module.id}`}>
                          <Button size="sm" variant="outline">Edit</Button>
                        </Link>
                        <Button size="sm" variant="destructive">Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {modules.length === 0 && (
                  <tr className="bg-white border-b">
                    <td colSpan={6} className="px-6 py-4 text-center">No modules found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 