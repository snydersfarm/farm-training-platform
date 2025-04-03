'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the oobCode (action code) from URL
        const actionCode = searchParams.get('oobCode');
        const mode = searchParams.get('mode');
        
        console.log('Verification page loaded with mode:', mode);
        
        if (!actionCode) {
          setStatus('error');
          setErrorMessage('Verification code is missing');
          setDebugInfo('No oobCode parameter found in URL');
          return;
        }

        console.log('Calling API with action code:', actionCode.substring(0, 5) + '...');

        // Call the API to verify the email
        const response = await fetch('/api/auth/verify-email/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ actionCode }),
        });

        const data = await response.json();
        console.log('API response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        // If successful, update status
        setStatus('success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } catch (error) {
        console.error('Verification error in client:', error);
        setStatus('error');
        
        const errorMsg = error instanceof Error ? error.message : 'Verification failed';
        setErrorMessage(errorMsg);
        
        if (error instanceof Error) {
          setDebugInfo(JSON.stringify({
            name: error.name,
            message: error.message,
            stack: error.stack?.slice(0, 200) + '...'
          }, null, 2));
        }
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Email Verification</h1>
        
        {status === 'loading' && (
          <div className="text-center">
            <p className="mb-4">Verifying your email...</p>
            <div className="animate-pulse bg-green-100 h-2 w-full rounded"></div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="mb-4 text-green-600 bg-green-100 p-3 rounded-lg">
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p>Your email has been successfully verified!</p>
            </div>
            <p className="text-gray-600 mb-4">You will be redirected to the dashboard in a few seconds.</p>
            <Link href="/dashboard" className="text-green-600 hover:underline">
              Click here if you are not redirected
            </Link>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-lg">
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <p>Verification failed</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
            <div className="flex flex-col space-y-2">
              <Link href="/dashboard" className="text-green-600 hover:underline">
                Go to Dashboard
              </Link>
              <button 
                onClick={() => router.refresh()}
                className="text-blue-600 hover:underline"
              >
                Try Again
              </button>
              {/* Form to manually verify the email - for troubleshooting */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  If you&apos;re still having trouble, try signing in again or contact support.
                </p>
              </div>
              
              {/* Debug information for admins */}
              {debugInfo && (
                <details className="mt-4 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer">Debug Information (for administrators)</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                    {debugInfo}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 