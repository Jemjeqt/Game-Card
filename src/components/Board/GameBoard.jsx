import React, { useState, useCallback } from 'react';
import usePlayerStore from '../../stores/usePlayerStore';
import useOpponentStore from '../../stores/useOpponentStore';
import useGameStore from '../../stores/useGameStore';
import useMultiplayerStore from '../../stores/useMultiplayerStore';
import useRankedStore from '../../stores/useRankedStore';
import useDraftStore from '../../stores/useDraftStore';
import useAuthStore from '../../stores/useAuthStore';
import { updateUserProfile, recordGameResult } from '../../firebase/userService';
import useUIStore from '../../stores/useUIStore';
import useQuestStore from '../../stores/useQuestStore';
import HPBar from '../HUD/HPBar';
import ManaBar from '../HUD/ManaBar';
import DeckCounter from '../HUD/DeckCounter';
import PhaseIndicator from '../HUD/PhaseIndicator';
import TurnButton from '../HUD/TurnButton';
import RankedBadge from '../HUD/RankedBadge';
import OpponentHand from '../Hand/OpponentHand';
import PlayerHand from '../Hand/PlayerHand';
import OpponentField from '../Board/OpponentField';
import PlayerField from '../Board/PlayerField';
import BattleLog from '../BattleLog/BattleLog';
import TurnBanner from '../Effects/TurnBanner';
import QuestNotification from '../Effects/QuestNotification';
import VFXLayer from '../Effects/VFXLayer';
import CardPreview from '../Card/CardPreview';
import GameOverScreen from '../Screens/GameOverScreen';
import { GAME_STATUS } from '../../data/constants';

export default function GameBoard() {
  const playerHp = usePlayerStore((s) => s.hp);
  const playerMaxHp = usePlayerStore((s) => s.maxHp);
  const playerMana = usePlayerStore((s) => s.mana);
  const playerMaxMana = usePlayerStore((s) => s.maxMana);
  const playerDeckCount = usePlayerStore((s) => s.deck.length);

  const opponentHp = useOpponentStore((s) => s.hp);
  const opponentMaxHp = useOpponentStore((s) => s.maxHp);
  const opponentMana = useOpponentStore((s) => s.mana);
  const opponentMaxMana = useOpponentStore((s) => s.maxMana);
  const opponentDeckCount = useOpponentStore((s) => s.deck.length);

  const phase = useGameStore((s) => s.phase);
  const turn = useGameStore((s) => s.turn);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const isMultiplayer = useMultiplayerStore((s) => s.isMultiplayer);
  const role = useMultiplayerStore((s) => s.role);
  const isRankedMode = useRankedStore((s) => s.isRankedMode);
  const isDraftMode = useDraftStore((s) => s.isDraftMode);

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleLeaveGame = useCallback(() => {
    // If ranked, record as a loss
    if (isRankedMode) {
      const pointsBefore = useRankedStore.getState().points;
      useRankedStore.getState().recordMatch(false);
      const st = useRankedStore.getState();
      const pointDelta = st.lastMatchResult?.pointsChange ?? null;

      // Record loss to Firestore
      const user = useAuthStore.getState().user;
      if (user) {
        const pHp    = usePlayerStore.getState().hp;
        const pMaxHp = usePlayerStore.getState().maxHp || 60;
        const turns  = useGameStore.getState().turn;
        const started = useGameStore.getState().gameStartedAt;
        const durSec  = started ? Math.round((Date.now() - started) / 1000) : null;
        recordGameResult(user.uid, false, 'ranked', {
          pointDelta,
          pointsBefore,
          pointsAfter: pointsBefore != null && pointDelta != null ? pointsBefore + pointDelta : null,
          playerHp:    pHp,
          playerMaxHp: pMaxHp,
          turnCount:   turns,
          duration:    durSec,
          outcome:     null,
        })
          .then(() => useAuthStore.getState().refreshProfile())
          .catch((err) => console.warn('Failed to record forfeit:', err));

        // Sync ranked points to Firestore
        updateUserProfile(user.uid, {
          rankedPoints:        st.points,
          highestRankedPoints: st.highestPoints,
        }).catch(() => {});
      }
    }

    // Reset all stores
    usePlayerStore.getState().resetPlayer();
    useOpponentStore.getState().resetPlayer();
    useUIStore.getState().resetUI();
    useRankedStore.getState().clearLastMatch();
    if (isDraftMode) {
      useDraftStore.getState().resetDraft();
    }
    useGameStore.getState().returnToMenu();
    setShowLeaveConfirm(false);
  }, [isRankedMode, isDraftMode]);

  const battleLogMinimized = useUIStore((s) => s.battleLogMinimized);

  const isGameOver =
    gameStatus === GAME_STATUS.PLAYER_WIN ||
    gameStatus === GAME_STATUS.OPPONENT_WIN;

  return (
    <div className={`game-board${!battleLogMinimized ? ' game-board--log-open' : ''}`}>
      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="leave-confirm-overlay" onClick={() => setShowLeaveConfirm(false)}>
          <div className="leave-confirm" onClick={(e) => e.stopPropagation()}>
            <h3 className="leave-confirm__title">
              {isRankedMode ? '🏳️ Menyerah?' : '🚪 Keluar Game?'}
            </h3>
            <p className="leave-confirm__text">
              {isRankedMode
                ? 'Keluar dari ranked match akan dihitung sebagai KALAH dan kehilangan RP.'
                : 'Progress pertandingan saat ini akan hilang.'}
            </p>
            <div className="leave-confirm__buttons">
              <button
                className="leave-confirm__btn leave-confirm__btn--cancel"
                onClick={() => setShowLeaveConfirm(false)}
              >
                Lanjut Main
              </button>
              <button
                className="leave-confirm__btn leave-confirm__btn--leave"
                onClick={handleLeaveGame}
              >
                {isRankedMode ? '🏳️ Menyerah' : '🚪 Keluar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Opponent Hero Zone */}
      <div className="hero-zone hero-zone--opponent">
        <div className="hero-zone__left">
          <button
            className="leave-game-btn"
            onClick={() => setShowLeaveConfirm(true)}
            title="Leave Game"
          >✕</button>
          <div className="hero-avatar">{isMultiplayer ? '👤' : '🤖'}</div>
          <div className="hero-zone__info">
            <span className="hero-zone__name">{isMultiplayer ? 'Opponent' : 'AI Opponent'}</span>
            <HPBar hp={opponentHp} maxHp={opponentMaxHp} />
          </div>
        </div>
        <div className="hero-zone__right">
          <ManaBar mana={opponentMana} maxMana={opponentMaxMana} />
          <DeckCounter count={opponentDeckCount} />
        </div>
      </div>

      {/* Opponent Hand */}
      <OpponentHand />

      {/* Opponent Field */}
      <OpponentField />

      {/* Battle Line — turn/phase info only */}
      <div className="battle-line">
        <div className="battle-line__state">
          <span className="battle-line__turn">Turn {turn}</span>
          <span className="battle-line__sep">—</span>
          <PhaseIndicator phase={phase} />
        </div>
      </div>

      {/* Player Field */}
      <PlayerField />

      {/* Hand Area */}
      <div className="hand-area">
        <div className="turn-action">
          <TurnButton />
        </div>
        <div className="hand-area__sep" />
        <PlayerHand />
      </div>

      {/* Player Hero Zone */}
      <div className="hero-zone hero-zone--player">
        <div className="hero-zone__left">
          <div className="hero-avatar hero-avatar--player">⚔️</div>
          <div className="hero-zone__info">
            <span className="hero-zone__name">
              {isMultiplayer ? `You (${role === 'host' ? 'Host' : 'Guest'})` : 'You'}
              {isRankedMode ? ' 🏆' : ''}{isDraftMode ? ' 📜' : ''}
            </span>
            <HPBar hp={playerHp} maxHp={playerMaxHp} />
          </div>
        </div>
        <div className="hero-zone__right">
          <ManaBar mana={playerMana} maxMana={playerMaxMana} />
          <DeckCounter count={playerDeckCount} />
        </div>
      </div>

      {/* Battle Log */}
      <BattleLog />

      {/* Turn Banner Overlay */}
      <TurnBanner />

      {/* VFX Layer (event-bus driven, portal overlay) */}
      <VFXLayer />

      {/* Quest Notification */}
      <QuestNotification />

      {/* Card Preview Overlay */}
      <CardPreview />

      {/* Game Over Overlay */}
      {isGameOver && <GameOverScreen />}
    </div>
  );
}
