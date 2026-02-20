import React, { useState, useEffect, useRef } from 'react';
import useMultiplayerStore from '../../stores/useMultiplayerStore';
import useGameStore from '../../stores/useGameStore';
import { signInAnon, isFirebaseConfigured } from '../../firebase/config';
import { createRoom, joinRoom, listenToRoom, deleteRoom } from '../../firebase/roomService';
import { initializeMultiplayerGame } from '../../engine/multiplayerEngine';
import { GAME_STATUS } from '../../data/constants';

export default function MultiplayerLobby() {
  const [screen, setScreen] = useState('choice'); // choice | create | join
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [opponentJoined, setOpponentJoined] = useState(false);
  const unsubRef = useRef(null);

  // Cleanup listener on unmount
  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  const handleBack = () => {
    if (unsubRef.current) unsubRef.current();
    // Clean up room if we created one
    if (roomCode && screen === 'create') {
      deleteRoom(roomCode).catch(console.error);
    }
    useMultiplayerStore.getState().reset();
    useGameStore.getState().returnToMenu();
  };

  // ========== CREATE ROOM ==========
  const handleCreateRoom = async () => {
    setError('');
    setIsLoading(true);
    setStatusText('Signing in...');

    try {
      const uid = await signInAnon();
      setStatusText('Creating room...');

      const code = await createRoom(uid);
      setRoomCode(code);
      setScreen('create');
      setStatusText('Waiting for opponent...');

      useMultiplayerStore.getState().setMultiplayer({
        uid,
        role: 'host',
        roomCode: code,
        isMultiplayer: true,
      });

      // Listen for opponent joining
      unsubRef.current = listenToRoom(code, (data) => {
        if (!data) return;
        if (data.status === 'ready' && data.guestId) {
          setOpponentJoined(true);
          setStatusText('Opponent connected! Starting game...');
          // Auto-start after short delay
          setTimeout(() => startMultiplayerGame(), 1000);
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== JOIN ROOM ==========
  const handleJoinRoom = async () => {
    const code = inputCode.trim().toUpperCase();
    if (!code || code.length < 4) {
      setError('Enter a valid room code');
      return;
    }

    setError('');
    setIsLoading(true);
    setStatusText('Signing in...');

    try {
      const uid = await signInAnon();
      setStatusText('Joining room...');

      await joinRoom(code, uid);

      setRoomCode(code);
      setStatusText('Connected! Waiting for host to start...');

      useMultiplayerStore.getState().setMultiplayer({
        uid,
        role: 'guest',
        roomCode: code,
        isMultiplayer: true,
        opponentConnected: true,
      });

      // Listen for game start
      unsubRef.current = listenToRoom(code, (data) => {
        if (!data) return;
        if (data.meta && data.meta.gameStatus === 'playing') {
          // Game started by host!
          if (unsubRef.current) unsubRef.current();
          unsubRef.current = null;
          // Guest's state will be loaded by the game listener in multiplayerEngine
          initializeMultiplayerGame().catch(console.error);
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== START GAME (Host only) ==========
  const startMultiplayerGame = async () => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    try {
      await initializeMultiplayerGame();
    } catch (err) {
      setError('Failed to start game: ' + err.message);
    }
  };

  // ========== RENDER ==========

  if (!isFirebaseConfigured) {
    return (
      <div className="lobby">
        <div className="lobby__card">
          <h2 className="lobby__title">⚠️ Firebase Not Configured</h2>
          <p className="lobby__text">
            Multiplayer requires Firebase. Create a <code>.env</code> file with your
            Firebase config. See <code>.env.example</code> for details.
          </p>
          <button className="lobby__btn lobby__btn--back" onClick={handleBack}>
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby">
      <div className="lobby__card">
        <button className="lobby__back" onClick={handleBack}>
          ← Back
        </button>

        <h2 className="lobby__title">⚔️ Multiplayer</h2>

        {error && <div className="lobby__error">{error}</div>}

        {/* Choice screen */}
        {screen === 'choice' && (
          <div className="lobby__choices">
            <button
              className="lobby__btn lobby__btn--primary"
              onClick={handleCreateRoom}
              disabled={isLoading}
            >
              {isLoading ? '...' : '🏠 Create Room'}
            </button>
            <div className="lobby__divider">or</div>
            <div className="lobby__join-form">
              <input
                className="lobby__input"
                type="text"
                placeholder="Enter room code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                maxLength={6}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <button
                className="lobby__btn lobby__btn--secondary"
                onClick={handleJoinRoom}
                disabled={isLoading || !inputCode.trim()}
              >
                {isLoading ? '...' : '🚪 Join Room'}
              </button>
            </div>
          </div>
        )}

        {/* Create room - waiting for opponent */}
        {screen === 'create' && (
          <div className="lobby__waiting">
            <div className="lobby__room-code-label">Room Code</div>
            <div className="lobby__room-code">{roomCode}</div>
            <p className="lobby__text">
              Share this code with your opponent
            </p>
            <div className="lobby__status">
              {opponentJoined ? (
                <span className="lobby__status--connected">
                  ✅ Opponent connected!
                </span>
              ) : (
                <>
                  <div className="lobby__spinner" />
                  <span>{statusText}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Join room - status */}
        {screen === 'join' && (
          <div className="lobby__waiting">
            <div className="lobby__status">
              <div className="lobby__spinner" />
              <span>{statusText}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
