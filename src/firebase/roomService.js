import { db } from './config';
import { ref, set, get, update, onValue, remove } from 'firebase/database';

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createRoom(uid, _attempt = 0) {
  if (!db) throw new Error('Firebase not configured');
  if (_attempt > 10) throw new Error('Failed to create unique room code after multiple attempts');

  const roomCode = generateRoomCode();
  const roomRef = ref(db, `rooms/${roomCode}`);

  // Check collision
  const existing = await get(roomRef);
  if (existing.exists()) {
    return createRoom(uid, _attempt + 1); // Retry with new code
  }

  await set(roomRef, {
    status: 'waiting',
    hostId: uid,
    guestId: null,
    createdAt: Date.now(),
  });

  return roomCode;
}

export async function joinRoom(roomCode, uid) {
  if (!db) throw new Error('Firebase not configured');

  const roomRef = ref(db, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('Room not found! Check the code.');
  }

  const data = snapshot.val();

  if (data.status !== 'waiting') {
    throw new Error('Room is full or game already started.');
  }

  if (data.hostId === uid) {
    throw new Error('Cannot join your own room.');
  }

  await update(roomRef, {
    guestId: uid,
    status: 'ready',
  });

  return data;
}

export function listenToRoom(roomCode, callback) {
  if (!db) return () => { };

  const roomRef = ref(db, `rooms/${roomCode}`);
  const unsubscribe = onValue(roomRef, (snapshot) => {
    callback(snapshot.val());
  });

  return unsubscribe;
}

export async function updateRoomStatus(roomCode, status) {
  if (!db) return;
  await update(ref(db, `rooms/${roomCode}`), { status });
}

export async function deleteRoom(roomCode) {
  if (!db) return;
  try {
    await remove(ref(db, `rooms/${roomCode}`));
  } catch (err) {
    console.error('Failed to delete room:', err);
  }
}
