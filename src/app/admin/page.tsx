'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage platform users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button className="w-full">Manage Users</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Module Management</CardTitle>
              <CardDescription>Create and edit training modules</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/modules">
                <Button className="w-full">Manage Modules</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Certification Management</CardTitle>
              <CardDescription>Manage user certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/certifications">
                <Button className="w-full">Manage Certifications</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View training progress and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/reports">
                <Button className="w-full">View Reports</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 