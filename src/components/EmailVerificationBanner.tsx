'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function EmailVerificationBanner() {
  const { currentUser, sendVerificationEmail, reloadUser } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showBanner, setShowBanner] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Check if user exists and if email is not verified
  const needsVerification = currentUser && !currentUser.emailVerified;

  // Periodically check verification status after sending email
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSuccess) {
      interval = setInterval(async () => {
        setCheckingStatus(true);
        try {
          await reloadUser();
          if (currentUser?.emailVerified) {
            clearInterval(interval);
          }
        } finally {
          setCheckingStatus(false);
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSuccess, currentUser, reloadUser]);

  // If email is verified or there's no user, or banner is dismissed, don't show the banner
  if (!needsVerification || !showBanner) {
    return null;
  }

  const handleSendVerificationEmail = async () => {
    setIsSending(true);
    setError('');
    setIsSuccess(false);

    try {
      await sendVerificationEmail();
      setIsSuccess(true);
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
              <div className="mt-2">
                <p className="text-green-600 font-medium flex items-center">
                  {checkingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verification email sent! Please check your inbox and click the verification link.
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  After clicking the link, refresh this page or wait for automatic verification.
                </p>
              </div>
            )}
            
            {error && (
              <p className="mt-2 text-red-600">
                {error}
              </p>
            )}
          </AlertDescription>
          
          <div className="mt-3 space-x-2">
            <Button
              onClick={handleSendVerificationEmail}
              disabled={isSending || checkingStatus}
              variant="secondary"
              size="sm"
              className="bg-amber-100 text-amber-800 hover:bg-amber-200"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : checkingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : 'Send verification email'}
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