import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getAuth, sendEmailVerification, applyActionCode, 
  checkActionCode, EmailAuthProvider, reauthenticateWithCredential,
  Auth
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

// Validate environment variables
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
  }
});

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-Q5N308C5JQ"
};

// Ensure Firebase is initialized
function initializeFirebase() {
  try {
    if (!getApps().length) {
      return initializeApp(firebaseConfig);
    } else {
      return getApps()[0];
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // In case of an error, still try to initialize
    return initializeApp(firebaseConfig);
  }
}

// Initialize Firebase
const firebaseApp = initializeFirebase();

// Export authenticated services
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

// Initialize analytics on client side if supported
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      getAnalytics(firebaseApp);
    }
  }).catch(err => {
    console.warn("Firebase analytics not supported:", err);
  });
}

// Email verification functions
export const sendVerificationEmail = async (continueUrl = `${process.env.NEXTAUTH_URL}/dashboard`) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user found");
    
    await sendEmailVerification(user, {
      url: continueUrl
    });
    
    return { success: true };
  } catch (error) {
    console.error("Send verification email error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send verification email" 
    };
  }
};

export const verifyEmail = async (actionCode: string) => {
  console.log("Starting email verification process with action code:", actionCode?.substring(0, 5) + "...");
  
  try {
    // First check the action code is valid
    console.log("Checking action code validity...");
    await checkActionCode(auth, actionCode);
    console.log("Action code is valid, applying code...");
    
    // Apply the verification code to confirm the action
    await applyActionCode(auth, actionCode);
    console.log("Action code applied successfully");
    
    // Force token refresh to update user's emailVerified status in session
    const currentUser = auth.currentUser;
    console.log("Current user in verifyEmail:", currentUser?.email);
    
    if (currentUser) {
      console.log("Reloading user to update emailVerified status...");
      await currentUser.reload();
      console.log("User reloaded, emailVerified status:", currentUser.emailVerified);
      
      // Force token refresh
      console.log("Forcing token refresh...");
      await currentUser.getIdToken(true);
      console.log("Token refreshed successfully");
    } else {
      console.warn("No current user found during email verification");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Email verification detailed error:", error);
    // Log detailed error properties
    if (error && typeof error === 'object') {
      console.error("Error code:", (error as any).code);
      console.error("Error message:", (error as any).message);
      console.error("Error name:", (error as any).name);
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Verification failed" 
    };
  }
};

// Add a function for manual verification that doesn't require current user
export const manualVerifyEmail = async (actionCode: string) => {
  console.log("Starting manual email verification with action code:", actionCode?.substring(0, 5) + "...");
  
  try {
    // First check if the action code is valid
    console.log("Checking action code validity...");
    const actionCodeInfo = await checkActionCode(auth, actionCode);
    console.log("Action code info:", actionCodeInfo);
    
    // Get the email from the action code info
    const email = actionCodeInfo.data.email;
    console.log("Email from action code:", email);
    
    if (!email) {
      throw new Error("No email found in the verification link");
    }
    
    // Apply the verification code to confirm the action
    await applyActionCode(auth, actionCode);
    console.log("Action code applied successfully");
    
    // Return success with the email that was verified
    return { 
      success: true,
      email
    };
  } catch (error) {
    console.error("Manual email verification error:", error);
    if (error && typeof error === 'object') {
      console.error("Error code:", (error as any).code);
      console.error("Error message:", (error as any).message);
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Verification failed" 
    };
  }
};