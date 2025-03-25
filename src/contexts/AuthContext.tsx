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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  // Sign up new user with email and password
  const signUp = async (email: string, password: string, name?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Set user display name if provided
    if (name && user) {
      await user.updateProfile({ displayName: name });
    }
    
    return user;
  };

  // Sign out the current user
  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  // Send email verification to current user
  const sendVerificationEmail = async () => {
    if (!currentUser) {
      throw new Error('No authenticated user');
    }
    
    await sendEmailVerification(currentUser, {
      url: `${window.location.origin}/dashboard`,
    });
  };

  // Send password reset email
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`,
    });
  };

  // Add the reloadUser function
  const reloadUser = async () => {
    if (currentUser) {
      await currentUser.reload();
      // Force component update by creating a new user object
      setCurrentUser(Object.assign({}, auth.currentUser));
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