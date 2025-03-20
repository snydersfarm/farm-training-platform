import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { sendVerificationEmail } from '@/lib/firebase';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    // Get the user's session to ensure they're authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Optional continue URL from request body
    const data = await request.json().catch(() => ({}));
    const continueUrl = data.continueUrl || undefined;
    
    // Send verification email
    const result = await sendVerificationEmail(continueUrl);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to send verification email' 
      },
      { status: 500 }
    );
  }
} 