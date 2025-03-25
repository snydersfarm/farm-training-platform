import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordReset } from '@/lib/firebase';

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
    
    // Use our Firebase utility to send password reset email
    const continueUrl = `${process.env.NEXTAUTH_URL || request.headers.get('origin') || ''}/login`;
    const result = await sendPasswordReset(email, continueUrl);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send reset email');
    }
    
    // Always return success, even if the email doesn&apos;t exist for security reasons
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    
    // Still return success for security (don&apos;t want to leak if an email exists)
    return NextResponse.json({ success: true });
  }
} 