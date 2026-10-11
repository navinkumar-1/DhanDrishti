import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  verifyPasswordResetCode,
  type User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { firebaseAuth, firebaseDb } from "@/lib/firebase/client";

export async function signUpWithEmail(input: { name: string; email: string; password: string }) {
  const credential = await createUserWithEmailAndPassword(firebaseAuth(), input.email.trim(), input.password);
  const name = input.name.trim();
  await updateProfile(credential.user, { displayName: name });
  try {
    await createUserProfile(credential.user, name);
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code !== "permission-denied") throw error;
  }
  return credential.user;
}

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(firebaseAuth(), email.trim(), password);
  return credential.user;
}

export async function signOutUser() {
  await signOut(firebaseAuth());
}

/** Sends a reset email. Missing accounts are treated as success so the page does not reveal who is registered. */
export async function sendPasswordReset(email: string) {
  const auth = firebaseAuth();
  const trimmed = email.trim();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  try {
    if (origin) {
      try {
        await sendPasswordResetEmail(auth, trimmed, { url: `${origin}/login` });
        return;
      } catch (error) {
        if (firebaseErrorCode(error) !== "auth/unauthorized-continue-uri") throw error;
      }
    }
    await sendPasswordResetEmail(auth, trimmed);
  } catch (error) {
    if (firebaseErrorCode(error) === "auth/user-not-found") return;
    throw error;
  }
}

export async function lookupPasswordReset(code: string) {
  return verifyPasswordResetCode(firebaseAuth(), code);
}

export async function completePasswordReset(code: string, password: string) {
  await confirmPasswordReset(firebaseAuth(), code, password);
}

/**
 * Creates users/{uid}. Email stays in Firebase Auth and is not copied into Firestore.
 * Until the Auth onCreate function exists, the client writes this bootstrap document.
 */
async function createUserProfile(user: User, displayName: string) {
  await setDoc(doc(firebaseDb(), "users", user.uid), {
    displayName,
    preferredLanguage: "en",
    dataMode: "empty",
    knownMissingAccounts: [],
    onboarding: { completedSteps: [] },
    schemaVersion: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

function firebaseErrorCode(error: unknown) {
  return typeof error === "object" && error && "code" in error ? String(error.code) : "";
}

export function authErrorMessage(error: unknown) {
  const code = firebaseErrorCode(error);
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Log in instead.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Use at least 8 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/expired-action-code":
      return "This reset link has expired. Request a new one.";
    case "auth/invalid-action-code":
      return "This reset link is invalid or has already been used. Request a new one.";
    case "auth/user-disabled":
      return "This account is disabled.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "permission-denied":
      return "The account was created, but the profile could not be saved. Check the Firestore rules for users/{uid}.";
    default:
      return "Something went wrong. Try again.";
  }
}
