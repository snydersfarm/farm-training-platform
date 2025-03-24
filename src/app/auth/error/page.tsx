'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Map error codes to user-friendly messages
  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.';
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account. Please use your original sign-in method.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to access this resource.';
      case 'Verification':
        return 'The verification link is invalid or has expired. Please request a new one.';
      case 'Configuration':
        return 'There is a problem with the server configuration. Please contact support.';
      default:
        return 'An unexpected authentication error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-6">Authentication Error</h1>
        
        <div className="mb-6 text-red-600 bg-red-100 p-4 rounded-lg">
          <svg className="w-6 h-6 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <p className="font-medium">{getErrorMessage(error)}</p>
          {error && <p className="text-xs mt-1">Error code: {error}</p>}
        </div>
        
        <div className="space-y-4">
          <Button asChild variant="default" className="w-full">
            <Link href="/login">
              Return to Login
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/reset-password">
              Reset Password
            </Link>
          </Button>
          
          <div className="text-sm text-gray-500 mt-4">
            <p>If you continue to experience issues, please <a href="mailto:support@farmtraining.com" className="text-primary hover:underline">contact support</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 