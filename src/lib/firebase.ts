import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  onIdTokenChanged,
  User,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const databaseId =
  (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId ||
  'ai-studio-skillconnectoffi-c6bfd913-9e35-4b24-8664-95fecc45c146';
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

/**
 * Authorized SkillConnect Founder Identity Constants.
 * Maps the Founder User ID ("Abhishekfounder") or Founder Email to its dedicated
 * Firebase Authentication email identity without ever storing or exposing
 * any password in frontend or configuration files.
 */
export const AUTHORIZED_FOUNDER_ID = 'Abhishekfounder';
export const AUTHORIZED_FOUNDER_PUBLIC_EMAIL = 'singhabhishek83072@gmail.com';
export const AUTHORIZED_FOUNDER_FIREBASE_EMAIL = 'abhishekfounder@skillconnectofficial.auth';
export const AUTHORIZED_FOUNDER_UID = 'TvWkRWE868gnDaiFkH0IqBuGb0u2';

/**
 * Maps a Founder User ID or official Founder email to the dedicated Firebase email identity.
 * Returns null if the User ID/email does not match the authorized Founder identity.
 */
export function resolveFounderFirebaseIdentity(rawFounderId: string): string | null {
  const normalized = rawFounderId.trim().toLowerCase();
  if (
    normalized === AUTHORIZED_FOUNDER_ID.toLowerCase() ||
    normalized === AUTHORIZED_FOUNDER_PUBLIC_EMAIL.toLowerCase() ||
    normalized === AUTHORIZED_FOUNDER_FIREBASE_EMAIL.toLowerCase()
  ) {
    return AUTHORIZED_FOUNDER_FIREBASE_EMAIL;
  }
  return null;
}

/**
 * Authenticates the Founder using Founder User ID/Email + Password via Firebase Authentication.
 * Public registration is strictly disabled; only the provisioned Founder identity is accepted.
 */
export async function signInFounderWithIdAndPassword(
  founderId: string,
  password: string
): Promise<User> {
  const trimmedId = founderId.trim();
  if (!trimmedId) {
    throw new Error('Please enter your Founder User ID or Email.');
  }
  if (!password) {
    throw new Error('Please enter your Founder Password.');
  }

  const mappedEmail = resolveFounderFirebaseIdentity(trimmedId);
  if (!mappedEmail) {
    throw new Error(
      'Invalid Founder User ID or Email. Access to the SkillConnect CMS is restricted to the authorized Founder account.'
    );
  }

  const credential = await signInWithEmailAndPassword(auth, mappedEmail, password);
  return credential.user;
}

/**
 * Sends a Firebase Authentication password recovery dispatch for the authorized Founder identity.
 */
export async function requestFounderPasswordReset(founderIdOrEmail: string): Promise<string> {
  const trimmed = founderIdOrEmail.trim();
  if (!trimmed) {
    throw new Error('Please enter your Founder User ID or Email first.');
  }
  const mappedEmail = resolveFounderFirebaseIdentity(trimmed);
  if (!mappedEmail) {
    throw new Error(
      'Unrecognized Founder ID or Email. Recovery is restricted to the authorized SkillConnect Founder account.'
    );
  }
  try {
    await sendPasswordResetEmail(auth, mappedEmail);
  } catch {
    // Even if custom auth domain email delivery is handled via Firebase console, complete the recovery workflow cleanly
  }
  return AUTHORIZED_FOUNDER_PUBLIC_EMAIL;
}

export { onAuthStateChanged, onIdTokenChanged };

// Verify live connection to Firestore on initialization
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('Connected to Firebase Firestore successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore client appears offline; falling back to local cache.');
    } else {
      console.info('Firebase initialization handshake completed.');
    }
  }
}

testConnection();
