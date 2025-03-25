'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { auth } from '@/lib/firebase';

export default function EmailVerificationBanner() {
  const { data: session, update } = useSession();
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showBanner, setShowBanner] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  // Check if user exists and if email is not verified
  const needsVerification = session?.user && !session.user.emailVerified;

  // Check if Firebase auth is ready
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsFirebaseReady(!!user && user.email === session?.user?.email);
    });

    return () => unsubscribe();
  }, [session]);

  // If email is verified or there&apos;s no user, or banner is dismissed, don&apos;t show the banner
  if (!needsVerification || !showBanner) {
    return null;
  }

  const sendVerificationEmail = async () => {
    setIsSending(true);
    setError('');
    setIsSuccess(false);

    try {
      // Check if Firebase is authenticated
      if (!isFirebaseReady) {
        throw new Error('Please authenticate with Firebase first using the banner above');
      }

      const response = await fetch('/api/auth/verify-email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          continueUrl: window.location.origin + '/verify-email'
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send verification email');
      }

      setIsSuccess(true);
      
      // After 5 seconds, refresh the session to check if email is verified
      setTimeout(() => {
        update();
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setIsSending(false);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
  };

  return (
    <Alert className="mb-6" variant="warning">
      <div className="flex justify-between items-start">
        <div>
          <AlertTitle className="text-amber-800">Email verification required</AlertTitle>
          <AlertDescription className="text-amber-700">
            Your email is not verified. Please verify your email to access all platform features.
            
            {isSuccess && (
              <p className="mt-2 text-green-600 font-medium">
                Verification email sent! Please check your inbox.
              </p>
            )}
            
            {error && (
              <p className="mt-2 text-red-600">
                {error}
              </p>
            )}
          </AlertDescription>
          
          <div className="mt-3 space-x-2">
            <Button
              onClick={sendVerificationEmail}
              disabled={isSending || !isFirebaseReady}
              variant="secondary"
              size="sm"
              className="bg-amber-100 text-amber-800 hover:bg-amber-200"
            >
              {isSending ? 'Sending...' : 'Send verification email'}
            </Button>
            
            <Button
              onClick={dismissBanner}
              variant="ghost"
              size="sm"
              className="text-amber-800 hover:bg-amber-100"
            >
              Dismiss
            </Button>
          </div>
        </div>
        
        <svg 
          className="h-5 w-5 text-amber-400 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </Alert>
  );
} 