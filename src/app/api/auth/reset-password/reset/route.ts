import { NextRequest, NextResponse } from 'next/server';
import { completePasswordReset, verifyPasswordReset } from '@/lib/firebase';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Get token and new password from request body
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }
    
    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // First verify the token to get the email
    const verifyResult = await verifyPasswordReset(token);
    
    if (!verifyResult.success || !verifyResult.email) {
      throw new Error(verifyResult.error || 'Invalid or expired reset token');
    }
    
    const email = verifyResult.email;
    
    // Complete the password reset with our Firebase utility
    const resetResult = await completePasswordReset(token, password);
    
    if (!resetResult.success) {
      throw new Error(resetResult.error || 'Failed to reset password');
    }
    
    // Update the password in the database as well
    try {
      // Hash the password for database storage
      const hashedPassword = await hash(password, 10);
      
      // Update the user in the database
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
    } catch (dbError) {
      console.error('Failed to update password in database:', dbError);
      // We still consider this a success since Firebase auth was updated
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reset password' 
      },
      { status: 400 }
    );
  }
} 