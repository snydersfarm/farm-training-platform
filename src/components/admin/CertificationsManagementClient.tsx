'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export function CertificationsManagementClient() {
  const { data: session, status } = useSession();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const response = await fetch('/api/admin/certifications');
        if (!response.ok) {
          throw new Error('Failed to fetch certifications');
        }
        const data = await response.json();
        setCertifications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch certifications');
        toast({
          title: 'Error',
          description: 'Failed to load certifications',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchCertifications();
    }
  }, [status, toast]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>Please sign in to access this page.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Certifications Management</h1>
        <Button>Add New Certification</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certifications.map((certification) => (
          <Card key={certification.id}>
            <CardHeader>
              <CardTitle>{certification.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{certification.description}</p>
              <div className="space-y-2">
                <h4 className="font-medium">Requirements:</h4>
                <ul className="list-disc list-inside text-sm">
                  {certification.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 