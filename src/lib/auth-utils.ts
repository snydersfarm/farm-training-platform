import { Session } from 'next-auth';
import { redirect } from 'next/navigation';

export interface SessionError {
  type: 'error';
  message: string;
}

export function isSessionError(session: Session | null): session is SessionError {
  return session !== null && 'error' in session;
}

export function requireAuth(session: Session | null) {
  if (!session) {
    redirect('/login');
  }
  return session;
}

export function requireAdmin(session: Session | null) {
  const authSession = requireAuth(session);
  
  if (authSession.user.role !== 'admin') {
    redirect('/dashboard');
  }
  
  return authSession;
}

export function handleSessionError(error: unknown): SessionError {
  console.error('Session error:', error);
  
  if (error instanceof Error) {
    return {
      type: 'error',
      message: error.message,
    };
  }
  
  return {
    type: 'error',
    message: 'An unexpected error occurred',
  };
}

export function getSessionErrorMessage(error: SessionError): string {
  switch (error.message) {
    case 'RefreshAccessTokenError':
      return 'Your session has expired. Please sign in again.';
    case 'AccessTokenExpired':
      return 'Your session has expired. Please sign in again.';
    default:
      return error.message;
  }
} 