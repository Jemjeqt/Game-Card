import useGameStore from './stores/useGameStore';
import MainMenu from './components/Screens/MainMenu';
import MultiplayerLobby from './components/Screens/MultiplayerLobby';
import DraftScreen from './components/Screens/DraftScreen';
import GameBoard from './components/Board/GameBoard';
import { GAME_STATUS } from './data/constants';

function App() {
  const gameStatus = useGameStore((s) => s.gameStatus);

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
