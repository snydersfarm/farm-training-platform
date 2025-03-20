import { initializeApp } from "firebase/app";
import { getAuth, sendEmailVerification, applyActionCode, checkActionCode, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Email verification functions
export const sendVerificationEmail = async (continueUrl = `${process.env.NEXTAUTH_URL}/dashboard`) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found");
  
  await sendEmailVerification(user, {
    url: continueUrl
  });
  
  return { success: true };
};

export const verifyEmail = async (actionCode: string) => {
  try {
    // First check the action code is valid
    await checkActionCode(auth, actionCode);
    // Apply the verification code to confirm the action
    await applyActionCode(auth, actionCode);
    
    // Force token refresh to update user's emailVerified status in session
    await auth.currentUser?.reload();
    
    return { success: true };
  } catch (error) {
    console.error("Email verification error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Verification failed" 
    };
  }
};