import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Use environment variable for admin email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'john@snydersfarm.com';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide NEXTAUTH_SECRET environment variable');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        try {
          // Use Firebase Authentication for credential verification
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );

          const user = userCredential.user;
          
          if (!user || !user.email) {
            throw new Error('Authentication failed');
          }

          // Check if email is verified
          if (!user.emailVerified) {
            throw new Error('Please verify your email before signing in');
          }

          // Map Firebase user to NextAuth user
          return {
            id: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            image: user.photoURL,
            role: user.email === ADMIN_EMAIL ? 'admin' : 'user',
            emailVerified: user.emailVerified ? new Date() : null,
          };
        } catch (error: any) {
          console.error('Authentication error:', error);
          
          // Handle specific Firebase errors
          switch (error.code) {
            case 'auth/invalid-email':
              throw new Error('Invalid email address');
            case 'auth/user-disabled':
              throw new Error('This account has been disabled');
            case 'auth/user-not-found':
              throw new Error('No account found with this email');
            case 'auth/wrong-password':
              throw new Error('Incorrect password');
            default:
              throw new Error('Authentication failed. Please try again.');
          }
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
    signOut: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          emailVerified: user.emailVerified,
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };
      }
      
      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      try {
        // Here you would typically refresh the token
        // For now, we'll just return the token as is
        return token;
      } catch (error) {
        console.error('Error refreshing access token', error);
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },
    async session({ session, token }) {
      // Pass token properties to the session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'admin' | 'user';
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      
      // Add error to session if token refresh failed
      if (token.error) {
        session.error = token.error;
      }
      
      return session;
    }
  },
  events: {
    async signIn(message) {
      console.log('User signed in:', message);
    },
    async signOut(message) {
      console.log('User signed out:', message);
    },
    async session(message) {
      console.log('Session updated:', message);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 