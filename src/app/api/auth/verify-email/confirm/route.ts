import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { actionCode } = await request.json();
    
    if (!actionCode) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }
    
    const result = await verifyEmail(actionCode);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email verification error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Email verification failed' 
      },
      { status: 500 }
    );
  }
} 