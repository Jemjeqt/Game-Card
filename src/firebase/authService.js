import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';
import { createUserProfile, getUserProfile, getUserByUsername } from './userService';

// ===== AUTH SERVICE =====
// Handles registration, login, logout, and auth state

/**
 * Register new user with email + password
 * Firebase Auth handles hashing — password never stored as plaintext
 */
export async function registerUser(email, password, username) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured');

  // If no email provided, generate one from the nickname
  const actualEmail = email || `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@cardbattle.local`;

  // Check if username is already taken
  try {
    const existing = await getUserByUsername(username);
    if (existing) {
      throw { code: 'auth/username-taken' };
    }
  } catch (err) {
    if (err.code === 'auth/username-taken') throw err;
    console.warn('Username check failed:', err.message);
  }

  // Create auth account (Firebase hashes password automatically)
  const credential = await createUserWithEmailAndPassword(auth, actualEmail, password);
  const user = credential.user;

  // Set display name
  await updateProfile(user, { displayName: username });

  // Create user profile in Firestore (non-blocking — don't fail registration)
  try {
    await createUserProfile(user.uid, {
      username,
      email: actualEmail,
    });
  } catch (firestoreErr) {
    console.warn('Firestore profile creation failed:', firestoreErr.message);
  }

  return user;
}

/**
 * Login existing user
 */
export async function loginUser(identifier, password) {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured');

  let email = identifier;

  // If no '@', treat as nickname -> look up email from Firestore
  if (!identifier.includes('@')) {
    const found = await getUserByUsername(identifier);
    if (!found) {
      throw { code: 'auth/user-not-found' };
    }
    if (!found.email) {
      // Profile exists but email missing — try generated email pattern
      email = `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@cardbattle.local`;
    } else {
      email = found.email;
    }
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Logout current user
 */
export async function logoutUser() {
  if (!isFirebaseConfigured) return;
  await signOut(auth);
}

/**
 * Subscribe to auth state changes
 * Returns unsubscribe function
 */
export function onAuthChange(callback) {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current user (synchronous snapshot)
 */
export function getCurrentUser() {
  return auth?.currentUser ?? null;
}

/**
 * Translate Firebase auth error codes to user-friendly messages (ID)
 */
export function getAuthErrorMessage(errorCode) {
  const messages = {
    'auth/email-already-in-use': 'Nickname atau email sudah terdaftar.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/weak-password': 'Password minimal 6 karakter.',
    'auth/user-not-found': 'Akun tidak ditemukan. Periksa nickname/email.',
    'auth/wrong-password': 'Password salah. Coba lagi.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Tunggu beberapa saat.',
    'auth/invalid-credential': 'Nickname/email atau password salah.',
    'auth/network-request-failed': 'Koneksi gagal. Periksa internet kamu.',
    'auth/username-taken': 'Nickname sudah dipakai. Pilih yang lain.',
    'auth/missing-email': 'Data email tidak ditemukan. Coba login dengan email langsung.',
  };
  return messages[errorCode] || `Terjadi kesalahan: ${errorCode || 'unknown'}`;
}
