import { NextRequest, NextResponse } from 'next/server';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    // Get email from request body
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Create the reset URL with the application URL
    const actionCodeSettings = {
      url: `${process.env.NEXTAUTH_URL || window.location.origin}/login`,
      handleCodeInApp: true,
    };
    
    // Send password reset email using Firebase
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    
    // Always return success, even if the email doesn't exist for security reasons
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    
    // Still return success for security (don't want to leak if an email exists)
    return NextResponse.json({ success: true });
  }
} 