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
    console.log('ProtectedRoute state:', {
      loading,
      currentUser: currentUser?.email,
      isAdmin,
      isManager,
      requireAdmin,
      requireManager
    });

    if (!loading) {
      if (!currentUser) {
        console.log('No user found, redirecting to login');
        router.push('/login');
      } else if (requireAdmin && !isAdmin) {
        console.log('Admin required but user is not admin, redirecting to dashboard');
        router.push('/dashboard');
      } else if (requireManager && !isManager) {
        console.log('Manager required but user is not manager, redirecting to dashboard');
        router.push('/dashboard');
      }
    }
  }, [currentUser, loading, router, requireAdmin, requireManager, isAdmin, isManager]);

  // Show loading state only while loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If not loading and no user, don't render anything (will redirect in useEffect)
  if (!currentUser) {
    return null;
  }

  // If admin required but not admin, don't render anything (will redirect in useEffect)
  if (requireAdmin && !isAdmin) {
    return null;
  }

  // If manager required but not manager, don't render anything (will redirect in useEffect)
  if (requireManager && !isManager) {
    return null;
  }

  // Render children if authenticated and has required role
  return <>{children}</>;
} 