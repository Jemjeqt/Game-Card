import React, { useMemo } from 'react';
import useRankedStore, { calculateTierInfo } from '../../stores/useRankedStore';
import useDraftStore from '../../stores/useDraftStore';

export default function RankedResult({ onContinue }) {
  const lastMatch = useRankedStore((s) => s.lastMatchResult);
  const points = useRankedStore((s) => s.points);
  const isDraftMode = useDraftStore((s) => s.isDraftMode);

  const tierInfo = useMemo(() => calculateTierInfo(points), [points]);

  if (!lastMatch) return null;

  const { won, pointsChange, rankUp, rankDown, oldTier, newTier, winStreak } = lastMatch;

  return (
    <div className="ranked-result">
      <div className="ranked-result__content">
        <div className={`ranked-result__badge ${won ? 'ranked-result__badge--win' : 'ranked-result__badge--loss'}`}>
          {won ? '🏆' : '💀'}
        </div>

        <h2 className={`ranked-result__title ${won ? 'ranked-result__title--win' : 'ranked-result__title--loss'}`}>
          {won ? 'Victory!' : 'Defeat'}
        </h2>

        <div className="ranked-result__points">
          <span className={`ranked-result__change ${won ? 'ranked-result__change--positive' : 'ranked-result__change--negative'}`}>
            {pointsChange > 0 ? '+' : ''}{pointsChange} RP
          </span>
        </div>

        {isDraftMode && won && (
          <div className="ranked-result__draft-bonus">
            📜 Draft Win!
          </div>
        )}

        {winStreak >= 3 && won && (
          <div className="ranked-result__streak">
            🔥 {winStreak} Win Streak!
          </div>
        )}

        {rankUp && (
          <div className="ranked-result__rank-change ranked-result__rank-change--up">
            <span>⬆️ RANK UP!</span>
            <div className="ranked-result__tier-change">
              <span>{oldTier.icon} {oldTier.name}</span>
              <span>→</span>
              <span>{newTier.icon} {newTier.name}</span>
            </div>
          </div>
        )}

        {rankDown && (
          <div className="ranked-result__rank-change ranked-result__rank-change--down">
            <span>⬇️ Rank Down</span>
            <div className="ranked-result__tier-change">
              <span>{oldTier.icon} {oldTier.name}</span>
              <span>→</span>
              <span>{newTier.icon} {newTier.name}</span>
            </div>
          </div>
        )}

        <div className="ranked-result__current">
          <span>{tierInfo.tier.icon}</span>
          <span>{tierInfo.tier.name} {tierInfo.division || ''}</span>
        </div>

        <button className="ranked-result__btn" onClick={onContinue}>
          Lanjutkan
        </button>
      </div>
    </div>
  );
}
