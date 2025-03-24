import { NextRequest, NextResponse } from 'next/server';
import { verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    // Get token from request body
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }
    
    // Verify the password reset code with Firebase
    await verifyPasswordResetCode(auth, token);
    
    // If we get here, the token is valid
    return NextResponse.json({ 
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Error validating password reset token:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid or expired reset token' 
      },
      { status: 400 }
    );
  }
} 