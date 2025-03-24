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

// Initialize Firebase with singleton pattern
let firebaseApp: FirebaseApp | undefined;
// Initialize services with default empty app
let firebaseAuth: Auth = getAuth();
let firebaseDb: Firestore = getFirestore();

// Initialize Firebase safely
try {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  } else {
    firebaseApp = getApps()[0];
  }

  // Initialize services with the proper app
  firebaseAuth = getAuth(firebaseApp);
  firebaseDb = getFirestore(firebaseApp);

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
} catch (error) {
  console.error("Firebase initialization error:", error);
  
  // Make sure we always have initialized services even in case of errors
  if (!firebaseAuth) {
    firebaseAuth = getAuth();
  }
  
  if (!firebaseDb) {
    firebaseDb = getFirestore();
  }
}

// Export the authenticated services
export const auth = firebaseAuth;
export const db = firebaseDb;

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