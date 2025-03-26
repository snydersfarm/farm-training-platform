'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
}

export function ModulesManagementClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [forceAdmin, setForceAdmin] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    difficulty: 'BEGINNER',
    status: 'DRAFT'
  });

  // Check for forced admin access (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasForceAdmin = localStorage.getItem('forceAdmin') === 'true';
      setForceAdmin(hasForceAdmin);
    }
  }, []);

  // Check authentication and authorization
  useEffect(() => {
    if (status === 'authenticated' && 
        session?.user?.role !== 'ADMIN' && 
        session?.user?.email !== 'john@snydersfarm.com' &&
        !forceAdmin) {
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router, forceAdmin]);

  // Fetch modules when authenticated as admin
  useEffect(() => {
    if (status === 'authenticated' && 
       (session?.user?.role === 'ADMIN' || 
        session?.user?.email === 'john@snydersfarm.com' || 
        forceAdmin)) {
      fetchModules();
    }
  }, [status, session, forceAdmin]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select input changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setCreateError(null);
    setCreateSuccess(false);
    setIsCreating(true);
    
    try {
      // Validate form
      if (!formData.title) {
        throw new Error('Title is required');
      }
      
      if (!formData.description) {
        throw new Error('Description is required');
      }
      
      if (!formData.category) {
        throw new Error('Category is required');
      }
      
      if (!formData.duration || isNaN(Number(formData.duration))) {
        throw new Error('Duration must be a number');
      }
      
      // Submit the form data
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          duration: Number(formData.duration)
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create module');
      }
      
      setCreateSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: '',
        duration: '',
        difficulty: 'BEGINNER',
        status: 'DRAFT'
      });
      
      // Refresh modules list
      fetchModules();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create module');
    } finally {
      setIsCreating(false);
    }
  };

  const fetchModules = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/modules');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch modules');
      }
      
      setModules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch modules');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated' || (session?.user?.role !== 'ADMIN' && !forceAdmin)) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Modules Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Module creation form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => handleSelectChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            {createError && (
              <div className="text-red-500 text-sm">{createError}</div>
            )}
            
            {createSuccess && (
              <div className="text-green-500 text-sm">Module created successfully!</div>
            )}
            
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Module'
              )}
            </Button>
          </form>

          {/* Modules list */}
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="space-y-4">
              {modules.map((module) => (
                <Card key={module.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{module.title}</h3>
                        <p className="text-sm text-gray-500">{module.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{module.category}</Badge>
                          <Badge variant="secondary">{module.difficulty}</Badge>
                          <Badge variant={module.status === 'PUBLISHED' ? 'success' : 'outline'}>
                            {module.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 