import { NextRequest, NextResponse } from 'next/server';
import { verifyPasswordReset } from '@/lib/firebase';

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
    
    // Verify the password reset code with our Firebase utility
    const result = await verifyPasswordReset(token);
    
    if (!result.success) {
      throw new Error(result.error || 'Invalid or expired reset token');
    }
    
    // If we get here, the token is valid
    return NextResponse.json({ 
      success: true,
      message: 'Token is valid',
      email: result.email
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