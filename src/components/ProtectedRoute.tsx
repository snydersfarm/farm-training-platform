'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireManager?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireManager = false 
}: ProtectedRouteProps) {
  const { currentUser, loading, isAdmin, isManager } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        // User not logged in, redirect to login
        router.push('/login');
      } else if (requireAdmin && !isAdmin) {
        // User not admin, redirect to dashboard
        router.push('/dashboard');
      } else if (requireManager && !isManager) {
        // User not manager or admin, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [currentUser, loading, router, requireAdmin, requireManager, isAdmin, isManager]);

  // Show loading state
  if (loading || (!currentUser) || (requireAdmin && !isAdmin) || (requireManager && !isManager)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated and has required role
  return <>{children}</>;
} 