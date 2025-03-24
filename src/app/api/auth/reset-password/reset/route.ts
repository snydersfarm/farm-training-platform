import { NextRequest, NextResponse } from 'next/server';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
    
    // Complete the password reset with Firebase
    await confirmPasswordReset(auth, token, password);
    
    // If we get here, password reset was successful
    // Get the email associated with this reset code
    const email = await getEmailFromResetCode(token);
    
    // Update the password in your database if you're storing it there as well
    if (email) {
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

// Helper function to get email from reset code
async function getEmailFromResetCode(resetCode: string): Promise<string | null> {
  try {
    // Verify the code to get the email
    const email = await verifyPasswordResetCode(auth, resetCode);
    return email;
  } catch (error) {
    console.error('Error getting email from reset code:', error);
    return null;
  }
} 