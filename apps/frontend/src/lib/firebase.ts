// ============================================================
// MatdataMitra Frontend — Firebase Configuration
// ============================================================

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Auth,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// Only initialize Firebase if API key is provided
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey) {
    console.warn("⚠️  Firebase API key not configured. Auth features disabled.");
    return null;
  }
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
}

function getFirebaseAuth(): Auth | null {
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      auth = getAuth(firebaseApp);
    }
  }
  return auth;
}

export function getFirebaseDB(): Firestore | null {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      db = getFirestore(firebaseApp);
    }
  }
  return db;
}

const googleProvider = new GoogleAuthProvider();

/** Sign in with Google popup */
export async function signInWithGoogle(): Promise<User | null> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    console.warn("Firebase not initialized — cannot sign in");
    return null;
  }
  try {
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    return null;
  }
}

/** Sign out the current user */
export async function signOut(): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) return;
  try {
    await firebaseSignOut(firebaseAuth);
  } catch (error) {
    console.error("Sign-out error:", error);
  }
}

/** Subscribe to auth state changes */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    // No Firebase — call with null immediately, return no-op unsubscribe
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(firebaseAuth, callback);
}

export { getFirebaseAuth as getAuth };
export type { User };
