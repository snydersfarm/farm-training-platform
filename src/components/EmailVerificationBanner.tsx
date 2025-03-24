'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function EmailVerificationBanner() {
  const { data: session } = useSession();
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Check if user exists and if email is not verified
  const needsVerification = session?.user && !session.user.emailVerified;

  // If email is verified or there's no user, don't show the banner
  if (!needsVerification) {
    return null;
  }

  const sendVerificationEmail = async () => {
    setIsSending(true);
    setError('');
    setIsSuccess(false);

    try {
      const response = await fetch('/api/auth/verify-email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
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
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Your email is not verified. Please verify your email to access all features.
          </p>
          
          {isSuccess && (
            <p className="mt-2 text-sm text-green-600">
              Verification email sent! Please check your inbox.
            </p>
          )}
          
          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
          
          <div className="mt-3">
            <button
              onClick={sendVerificationEmail}
              disabled={isSending}
              className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                isSending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSending ? 'Sending...' : 'Send verification email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 