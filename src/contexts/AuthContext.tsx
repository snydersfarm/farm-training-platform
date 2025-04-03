'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  sendEmailVerification, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Define our authentication context type
interface AuthContextType {
  currentUser: FirebaseUser | null;
  isAdmin: boolean;
  isManager: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<FirebaseUser>;
  signUp: (email: string, password: string, name?: string) => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  reloadUser: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Admin email from environment variable
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'john@snydersfarm.com';
// Manager emails (could expand this to use database roles)
const MANAGER_EMAILS = [
  'manager@snydersfarm.com'
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // User authentication state change listener
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', {
        user: user ? {
          email: user.email,
          emailVerified: user.emailVerified,
          uid: user.uid
        } : null
      });
      
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  // Check if user is admin based on email
  const isAdmin = Boolean(
    currentUser?.email && currentUser.email === ADMIN_EMAIL
  );

  // Check if user is manager based on email
  const isManager = Boolean(
    currentUser?.email && (MANAGER_EMAILS.includes(currentUser.email) || isAdmin)
  );

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Sign in successful:', {
      email: userCredential.user.email,
      emailVerified: userCredential.user.emailVerified,
      uid: userCredential.user.uid
    });
    return userCredential.user;
  };

  // Sign up new user with email and password
  const signUp = async (email: string, password: string, name?: string) => {
    console.log('Attempting sign up for:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Set user display name if provided
    if (name && user) {
      await user.updateProfile({ displayName: name });
    }
    
    console.log('Sign up successful:', {
      email: user.email,
      emailVerified: user.emailVerified,
      uid: user.uid
    });
    
    return user;
  };

  // Sign out the current user
  const signOut = async () => {
    console.log('Signing out user');
    await firebaseSignOut(auth);
    console.log('Sign out successful');
  };

  // Send email verification to current user
  const sendVerificationEmail = async () => {
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    console.log('Sending verification email to:', currentUser.email);
    await sendEmailVerification(currentUser, {
      url: `${window.location.origin}/dashboard`,
    });
    console.log('Verification email sent');
  };

  // Send password reset email
  const resetPassword = async (email: string) => {
    console.log('Sending password reset email to:', email);
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`,
    });
    console.log('Password reset email sent');
  };

  // Add the reloadUser function
  const reloadUser = async () => {
    if (currentUser) {
      console.log('Reloading user data');
      await currentUser.reload();
      // Force component update by creating a new user object
      setCurrentUser(Object.assign({}, auth.currentUser));
      console.log('User data reloaded:', {
        email: currentUser.email,
        emailVerified: currentUser.emailVerified,
        uid: currentUser.uid
      });
    }
  };

  const value: AuthContextType = {
    currentUser,
    isAdmin,
    isManager,
    loading,
    signIn,
    signUp,
    signOut,
    sendVerificationEmail,
    resetPassword,
    reloadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 