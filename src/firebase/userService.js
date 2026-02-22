import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { firestore, isFirebaseConfigured } from './config';

// ===== USER DATA SERVICE =====
// CRUD operations for user profile in Firestore
// Collections: users/{uid}

const DEFAULT_AVATAR = '🧙';

/** Wrap a promise with a timeout (ms) so Firestore never hangs forever */
function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout — database mungkin belum dibuat')), ms)
    ),
  ]);
}

const DAILY_REWARD_EXP = 50;

/**
 * Look up a user by username (for nickname login)
 * Returns { uid, email } or null
 */
export async function getUserByUsername(username) {
  if (!isFirebaseConfigured) return null;

  const usersRef = collection(firestore, 'users');

  // Try exact match first
  let q = query(usersRef, where('username', '==', username));
  let snapshot = await withTimeout(getDocs(q));

  // If not found, try case-insensitive by checking common variations
  if (snapshot.empty) {
    const variations = [
      username.toLowerCase(),
      username.charAt(0).toUpperCase() + username.slice(1).toLowerCase(),
    ].filter((v) => v !== username);

    for (const variant of variations) {
      q = query(usersRef, where('username', '==', variant));
      snapshot = await withTimeout(getDocs(q));
      if (!snapshot.empty) break;
    }
  }

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  return { uid: docSnap.id, email: docSnap.data().email };
}

/**
 * Create initial user profile after registration
 */
export async function createUserProfile(uid, { username, email }) {
  if (!isFirebaseConfigured) return;

  const userRef = doc(firestore, 'users', uid);
  const profile = {
    username,
    email,
    avatar: DEFAULT_AVATAR,
    level: 1,
    exp: 0,
    totalWins: 0,
    totalLosses: 0,
    totalGames: 0,
    // Per-mode stats
    classicWins: 0,
    classicLosses: 0,
    classicGames: 0,
    rankedWins: 0,
    rankedLosses: 0,
    rankedGames: 0,
    winStreak: 0,
    bestWinStreak: 0,
    rankedPoints: 0,
    unlockedCards: [], // card IDs the player has unlocked beyond starter
    deckSlots: [null, null, null], // up to 3 saved decks
    selectedAvatar: DEFAULT_AVATAR,
    title: 'Pemula',
    lastDailyReward: null, // timestamp of last daily claim
    dailyRewardStreak: 0,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  await withTimeout(setDoc(userRef, profile));
  return profile;
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid) {
  if (!isFirebaseConfigured) return null;

  const userRef = doc(firestore, 'users', uid);
  const snap = await withTimeout(getDoc(userRef));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() };
}

/**
 * Update user profile fields
 */
export async function updateUserProfile(uid, updates) {
  if (!isFirebaseConfigured) return;

  const userRef = doc(firestore, 'users', uid);
  await withTimeout(setDoc(userRef, {
    ...updates,
    lastLoginAt: serverTimestamp(),
  }, { merge: true }));
}

/**
 * Add EXP and handle level-up
 * Every 100 EXP = 1 level
 */
export async function addExp(uid, amount) {
  const profile = await getUserProfile(uid);
  if (!profile) return;

  let newExp = (profile.exp || 0) + amount;
  let newLevel = profile.level || 1;

  while (newExp >= newLevel * 100) {
    newExp -= newLevel * 100;
    newLevel++;
  }

  await updateUserProfile(uid, { exp: newExp, level: newLevel });
  return { level: newLevel, exp: newExp, leveledUp: newLevel > (profile.level || 1) };
}

/**
 * Record game result
 * mode: 'classic' | 'ranked' | 'draft' (draft counts as classic for stats)
 * meta: { pointDelta?, playerHp?, playerMaxHp?, turnCount?, duration?, outcome? }
 */
export async function recordGameResult(uid, won, mode = 'classic', meta = {}) {
  const profile = await getUserProfile(uid);
  if (!profile) return;

  const updates = {
    totalGames: (profile.totalGames || 0) + 1,
  };

  if (won) {
    updates.totalWins = (profile.totalWins || 0) + 1;
    updates.winStreak = (profile.winStreak || 0) + 1;
    updates.bestWinStreak = Math.max(updates.winStreak, profile.bestWinStreak || 0);
  } else {
    updates.totalLosses = (profile.totalLosses || 0) + 1;
    updates.winStreak = 0;
  }

  // Per-mode stats (draft counts as classic)
  const isRanked = mode === 'ranked';
  const modePrefix = isRanked ? 'ranked' : 'classic';
  updates[`${modePrefix}Games`] = (profile[`${modePrefix}Games`] || 0) + 1;
  if (won) {
    updates[`${modePrefix}Wins`] = (profile[`${modePrefix}Wins`] || 0) + 1;
  } else {
    updates[`${modePrefix}Losses`] = (profile[`${modePrefix}Losses`] || 0) + 1;
  }

  await updateUserProfile(uid, updates);

  // Award EXP for playing
  const expGain = won ? 30 : 10;
  const expResult = await addExp(uid, expGain);

  // Append to match history (last 10, newest first)
  const historyEntry = {
    result: won ? 'win' : 'lose',
    mode,
    pointDelta:    meta.pointDelta    ?? null,
    pointsBefore:  meta.pointsBefore  ?? null,
    pointsAfter:   meta.pointsAfter   ?? null,
    playerHp:      meta.playerHp      ?? null,
    playerMaxHp:   meta.playerMaxHp   ?? null,
    turnCount:     meta.turnCount     ?? null,
    duration:      meta.duration      ?? null,
    outcome:       meta.outcome       ?? null,
    ts: Date.now(),
  };
  const prevHistory = Array.isArray(profile.matchHistory) ? profile.matchHistory : [];
  const newHistory = [historyEntry, ...prevHistory].slice(0, 10);
  await updateUserProfile(uid, { matchHistory: newHistory });

  return { ...updates, expResult };
}

/**
 * Check & claim daily reward
 * Returns null if already claimed today
 */
export async function claimDailyReward(uid) {
  const profile = await getUserProfile(uid);
  if (!profile) return null;

  const now = new Date();
  const lastClaim = profile.lastDailyReward?.toDate?.() || null;

  // Check if already claimed today
  if (lastClaim) {
    const sameDay =
      lastClaim.getFullYear() === now.getFullYear() &&
      lastClaim.getMonth() === now.getMonth() &&
      lastClaim.getDate() === now.getDate();
    if (sameDay) return null; // already claimed
  }

  // Check if streak continues (claimed yesterday)
  let newStreak = 1;
  if (lastClaim) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const wasYesterday =
      lastClaim.getFullYear() === yesterday.getFullYear() &&
      lastClaim.getMonth() === yesterday.getMonth() &&
      lastClaim.getDate() === yesterday.getDate();
    if (wasYesterday) {
      newStreak = (profile.dailyRewardStreak || 0) + 1;
    }
  }

  // Streak bonus: +10% per day, max 7x
  const streakMultiplier = 1 + Math.min(newStreak - 1, 6) * 0.1;
  const expReward = Math.floor(DAILY_REWARD_EXP * streakMultiplier);

  await updateUserProfile(uid, {
    lastDailyReward: serverTimestamp(),
    dailyRewardStreak: newStreak,
  });

  const expResult = await addExp(uid, expReward);

  return {
    exp: expReward,
    streak: newStreak,
    leveledUp: expResult?.leveledUp || false,
    newLevel: expResult?.level,
  };
}
