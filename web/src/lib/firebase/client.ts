import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function assertConfig() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error("Firebase config is missing. Add the NEXT_PUBLIC_FIREBASE_* values and restart the dev server.");
  }
}

export function getFirebaseApp(): FirebaseApp {
  assertConfig();
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

let auth: Auth | null = null;
let db: Firestore | null = null;

export function firebaseAuth() {
  auth ??= getAuth(getFirebaseApp());
  return auth;
}

export function firebaseDb() {
  db ??= getFirestore(getFirebaseApp());
  return db;
}

/** Analytics is optional and only available in the browser. */
export async function initAnalytics() {
  if (typeof window === "undefined" || !firebaseConfig.measurementId) return;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (await isSupported()) getAnalytics(getFirebaseApp());
  } catch {
    // Analytics must not block sign-in.
  }
}
