import React, { useMemo } from 'react';
import useRankedStore, { TIERS, calculateTierInfo } from '../../stores/useRankedStore';

export default function RankedBadge({ compact = false }) {
  const points = useRankedStore((s) => s.points);
  const wins = useRankedStore((s) => s.wins);
  const losses = useRankedStore((s) => s.losses);
  const winStreak = useRankedStore((s) => s.winStreak);

  const tierInfo = useMemo(() => calculateTierInfo(points), [points]);
  const { tier, division, progress, pointsToNext } = tierInfo;

  if (compact) {
    return (
      <div className="ranked-badge ranked-badge--compact">
        <span className="ranked-badge__icon">{tier.icon}</span>
        <span className="ranked-badge__tier">{tier.name}</span>
        {division && <span className="ranked-badge__division">{division}</span>}
        <span className="ranked-badge__points">{points} RP</span>
      </div>
    );
  }

  return (
    <div className="ranked-badge">
      <div className="ranked-badge__header">
        <span className="ranked-badge__icon ranked-badge__icon--large">{tier.icon}</span>
        <div className="ranked-badge__info">
          <span className="ranked-badge__tier ranked-badge__tier--large">
            {tier.name} {division || ''}
          </span>
          <span className="ranked-badge__points">{points} RP</span>
        </div>
      </div>

      {/* Progress bar */}
      {pointsToNext !== null && (
        <div className="ranked-badge__progress">
          <div className="ranked-badge__progress-bar">
            <div
              className="ranked-badge__progress-fill"
              style={{ width: `${Math.min(progress * 100, 100)}%` }}
            />
          </div>
          <span className="ranked-badge__progress-text">
            {pointsToNext} RP to next
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="ranked-badge__stats">
        <div className="ranked-badge__stat">
          <span className="ranked-badge__stat-value">{wins}</span>
          <span className="ranked-badge__stat-label">Wins</span>
        </div>
        <div className="ranked-badge__stat">
          <span className="ranked-badge__stat-value">{losses}</span>
          <span className="ranked-badge__stat-label">Losses</span>
        </div>
        <div className="ranked-badge__stat">
          <span className="ranked-badge__stat-value">{wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0}%</span>
          <span className="ranked-badge__stat-label">WR</span>
        </div>
        {winStreak > 0 && (
          <div className="ranked-badge__stat ranked-badge__stat--streak">
            <span className="ranked-badge__stat-value">🔥{winStreak}</span>
            <span className="ranked-badge__stat-label">Streak</span>
          </div>
        )}
      </div>

      {/* Tier ladder */}
      <div className="ranked-badge__ladder">
        {TIERS.map((t) => (
          <div
            key={t.id}
            className={`ranked-badge__ladder-tier ${t.id === tier.id ? 'ranked-badge__ladder-tier--active' : ''} ${points >= t.minPoints ? 'ranked-badge__ladder-tier--reached' : ''}`}
          >
            <span>{t.icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
