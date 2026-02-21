import React from 'react';
import usePlayerStore from '../../stores/usePlayerStore';
import useOpponentStore from '../../stores/useOpponentStore';
import useGameStore from '../../stores/useGameStore';
import useMultiplayerStore from '../../stores/useMultiplayerStore';
import useRankedStore from '../../stores/useRankedStore';
import useDraftStore from '../../stores/useDraftStore';
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
import AbilityVFX from '../Effects/AbilityVFX';
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

  const isGameOver =
    gameStatus === GAME_STATUS.PLAYER_WIN ||
    gameStatus === GAME_STATUS.OPPONENT_WIN;

  return (
    <div className="game-board">
      {/* Opponent HUD */}
      <div className="hud hud--opponent">
        <div className="hud__left">
          <HPBar hp={opponentHp} maxHp={opponentMaxHp} />
        </div>
        <div className="hud__center">
          <span style={{ color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'var(--font-heading)' }}>
            {isMultiplayer ? '👤 Opponent' : '🤖 AI Opponent'}
          </span>
        </div>
        <div className="hud__right">
          <ManaBar mana={opponentMana} maxMana={opponentMaxMana} />
          <DeckCounter count={opponentDeckCount} />
        </div>
      </div>

      {/* Opponent Hand */}
      <OpponentHand />

      {/* Opponent Field */}
      <OpponentField />

      {/* Center Divider */}
      <div className="center-divider">
        <span style={{ color: 'var(--text-dim)', fontSize: '11px', fontFamily: 'var(--font-heading)' }}>
          Turn {turn}
        </span>
        <PhaseIndicator phase={phase} />
        <TurnButton />
      </div>

      {/* Player Field */}
      <PlayerField />

      {/* Player Hand */}
      <PlayerHand />

      {/* Player HUD */}
      <div className="hud hud--player">
        <div className="hud__left">
          <HPBar hp={playerHp} maxHp={playerMaxHp} />
        </div>
        <div className="hud__center">
          <span style={{ color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'var(--font-heading)' }}>
            ⚔️ You{isMultiplayer ? ` (${role === 'host' ? 'Host' : 'Guest'})` : ''}
            {isRankedMode ? ' 🏆' : ''}
            {isDraftMode ? ' 📜' : ''}
          </span>
        </div>
        <div className="hud__right">
          <ManaBar mana={playerMana} maxMana={playerMaxMana} />
          <DeckCounter count={playerDeckCount} />
        </div>
      </div>

      {/* Battle Log */}
      <BattleLog />

      {/* Turn Banner Overlay */}
      <TurnBanner />

      {/* Ability VFX Overlay */}
      <AbilityVFX />

      {/* Quest Notification */}
      <QuestNotification />

      {/* Card Preview Overlay */}
      <CardPreview />

      {/* Game Over Overlay */}
      {isGameOver && <GameOverScreen />}
    </div>
  );
}
