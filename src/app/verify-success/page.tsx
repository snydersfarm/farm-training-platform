'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function VerificationSuccessPage() {
  const router = useRouter();
  const { reloadUser, currentUser } = useAuth();
  
  useEffect(() => {
    const verifyAndRedirect = async () => {
      try {
        // Reload user to get latest verification status
        await reloadUser();
        
        // Wait a moment to show success message
        setTimeout(() => {
          router.push('/dashboard?verified=true');
        }, 3000);
      } catch (error) {
        console.error('Verification error:', error);
      }
    };
    
    verifyAndRedirect();
  }, [reloadUser, router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Email Verified!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
            <svg 
              className="w-12 h-12 mx-auto mb-2 text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium">Thank you for verifying your email address.</p>
            <p className="text-sm mt-1">
              {currentUser?.email}
            </p>
          </div>
          
          <p className="mb-4">You will be redirected to the dashboard shortly...</p>
          
          <div className="flex justify-center mb-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          
          <Button 
            onClick={() => router.push('/dashboard')}
            className="w-full"
          >
            Go to Dashboard Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 