import { useEffect } from 'react';
import useGameStore from './stores/useGameStore';
import useAuthStore from './stores/useAuthStore';
import LoginScreen from './components/Screens/LoginScreen';
import MainMenu from './components/Screens/MainMenu';
import MultiplayerLobby from './components/Screens/MultiplayerLobby';
import DraftScreen from './components/Screens/DraftScreen';
import GameBoard from './components/Board/GameBoard';
import { GAME_STATUS } from './data/constants';
import { isFirebaseConfigured } from './firebase/config';

function App() {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Initialize auth listener on mount
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsub = useAuthStore.getState().initAuth();
      return unsub;
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="login-screen">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="login-icon" style={{ fontSize: '60px' }}>⚔️</div>
          <h2 className="login-title">Card Battle</h2>
          <p className="login-subtitle">Memuat...</p>
        </div>
      </div>
    );
  }

  // Auth gate — must be logged in (only if Firebase is configured)
  if (isFirebaseConfigured && !user) {
    return <LoginScreen />;
  }

  return (
    <>
      {gameStatus === GAME_STATUS.MENU ? (
        <MainMenu />
      ) : gameStatus === GAME_STATUS.LOBBY ? (
        <MultiplayerLobby />
      ) : gameStatus === GAME_STATUS.DRAFT ? (
        <DraftScreen />
      ) : (
        <GameBoard />
      )}
    </>
  );
}

export default App;
