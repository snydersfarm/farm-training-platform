'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';

export default function FirebaseAuthHandler() {
  const { data: session } = useSession();
  const [isFirebaseAuth, setIsFirebaseAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Firebase auth is synced
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsFirebaseAuth(!!user && user.email === session?.user?.email);
    });

    return () => unsubscribe();
  }, [session]);

  // Handle syncing Firebase auth with NextAuth
  const syncFirebaseAuth = async () => {
    if (!session?.user?.email) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // We need a password from the user to authenticate with Firebase
      const password = prompt('Please enter your password to verify your identity:');
      
      if (!password) {
        setIsLoading(false);
        return;
      }

      // Sign in to Firebase with the user's credentials
      await signInWithEmailAndPassword(auth, session.user.email, password);
      setIsFirebaseAuth(true);
    } catch (err) {
      console.error('Firebase auth error:', err);
      setError('Authentication failed. Please check your password and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Only show this component if Firebase auth isn&apos;t synced
  if (isFirebaseAuth || !session?.user) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-2 md:mb-0">
          <p className="text-sm text-amber-700 font-medium">
            Additional authentication required for email verification and password reset features.
          </p>
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
        <Button
          onClick={syncFirebaseAuth}
          variant="outline"
          className="bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-800"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : 'Authenticate'}
        </Button>
      </div>
    </div>
  );
} 