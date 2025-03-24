require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signOut } = require('firebase/auth');

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Test user credentials
const testUserEmail = 'testuser@example.com';
const testUserPassword = 'Test123!';

// Create the test user
async function createTestUser() {
  try {
    console.log(`Attempting to create test user: ${testUserEmail}`);
    
    const userCredential = await createUserWithEmailAndPassword(auth, testUserEmail, testUserPassword);
    const user = userCredential.user;
    
    console.log('Test user created successfully:');
    console.log(`- Email: ${user.email}`);
    console.log(`- User ID: ${user.uid}`);
    console.log(`- Email verified: ${user.emailVerified}`);
    console.log(`\nUse these credentials for testing:`);
    console.log(`- Email: ${testUserEmail}`);
    console.log(`- Password: ${testUserPassword}`);
    
    // Sign out to avoid any issues
    await signOut(auth);
    
    console.log('\nUser has been signed out.');
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`Test user ${testUserEmail} already exists.`);
      console.log(`\nUse these credentials for testing:`);
      console.log(`- Email: ${testUserEmail}`);
      console.log(`- Password: ${testUserPassword}`);
    } else {
      console.error('Error creating test user:', error);
    }
  }
}

createTestUser()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 