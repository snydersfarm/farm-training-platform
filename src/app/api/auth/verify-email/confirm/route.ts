import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail, manualVerifyEmail } from '@/lib/firebase';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Ensure this is always fresh

export async function POST(request: NextRequest) {
  console.log("Email verification API endpoint called");
  
  try {
    const body = await request.json();
    const { actionCode } = body;
    
    console.log("Received verification request with action code:", actionCode?.substring(0, 5) + "...");
    
    if (!actionCode) {
      console.error("Missing action code in request");
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }
    
    // Try the regular verification first
    console.log("Calling verifyEmail function with action code");
    const result = await verifyEmail(actionCode);
    console.log("verifyEmail result:", result);
    
    // If the regular verification fails, try the manual verification
    if (!result.success) {
      console.log("Regular verification failed, trying manual verification");
      const manualResult = await manualVerifyEmail(actionCode);
      console.log("Manual verification result:", manualResult);
      
      if (manualResult.success && manualResult.email) {
        // If manual verification succeeded, update the user in the database
        console.log("Manual verification succeeded, updating user in database");
        try {
          const user = await prisma.user.findUnique({
            where: { email: manualResult.email }
          });
          
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { emailVerified: new Date() }
            });
            console.log("Updated user email verification status in database");
          } else {
            console.warn("User not found in database with email:", manualResult.email);
          }
          
          return NextResponse.json({ 
            success: true,
            message: "Email verification successful (manual)",
            email: manualResult.email
          });
        } catch (dbError) {
          console.error("Database update error:", dbError);
          // Continue with success even if DB update fails
          return NextResponse.json({ 
            success: true,
            message: "Email verification successful but database update failed",
            email: manualResult.email
          });
        }
      }
      
      // If both verifications fail, return error
      console.error("Both verification methods failed:", result.error);
      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 400 }
      );
    }
    
    console.log("Email verification successful");
    return NextResponse.json({ 
      success: true,
      message: "Email verification successful"
    });
  } catch (error) {
    console.error('Email verification error in API route:', error);
    
    // Create detailed error object
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Email verification failed',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack?.slice(0, 200) + '...' : null
    };
    
    console.error('Error details:', errorDetails);
    
    return NextResponse.json(
      { 
        error: errorDetails.message,
        details: errorDetails
      },
      { status: 500 }
    );
  }
} 