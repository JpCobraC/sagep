import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Fail-safe check for build-time or missing configuration
const isConfigValid = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_api_key' && 
  !firebaseConfig.apiKey.includes('PLACEHOLDER');

let app: FirebaseApp | undefined;
let db: Firestore | any = null;
let auth: Auth | any = null;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  if (typeof window === 'undefined') {
    console.warn("⚠️ Firebase: Running in build mode or with placeholder keys. Firestore/Auth will be unavailable.");
  }
}

export { db, auth };
export default app;
