import React, { useMemo } from 'react';
import useRankedStore, { TIERS, calculateTierInfo } from '../../stores/useRankedStore';
import useAuthStore from '../../stores/useAuthStore';

// ===== RANKED PROFILE =====
// Shows ranked stats, season info, and player highlights

// Tier color mapping for glow effects
const TIER_COLORS = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#00d4ff',
  diamond: '#b9f2ff',
  mythic: '#ff6b35',
  immortal: '#e040fb',
};

// Fun card "signature" picks based on playstyle
const SIGNATURE_CARDS = [
  { icon: '🐉', name: 'Elder Dragon', subtitle: 'Late Game Dominator', minWins: 50 },
  { icon: '🌟', name: 'Archmage Solara', subtitle: 'Burn Specialist', minWins: 30 },
  { icon: '🌌', name: 'Void Empress', subtitle: 'Soul Stealer', minWins: 20 },
  { icon: '⏳', name: 'Chrono Weaver', subtitle: 'Tempo Master', minWins: 10 },
  { icon: '🧛', name: 'Soul Leech', subtitle: 'Lifesteal Lover', minWins: 5 },
  { icon: '🔥', name: 'Ember Sprite', subtitle: 'Aggro Enjoyer', minWins: 0 },
];

// Playstyle titles based on win rate
function getPlaystyle(winRate, totalGames) {
  if (totalGames < 5) return { label: 'Newcomer', icon: '🌱', desc: 'Baru memulai perjalanan' };
  if (winRate >= 80) return { label: 'Unstoppable', icon: '💀', desc: 'Tak terhentikan' };
  if (winRate >= 65) return { label: 'Strategist', icon: '🧠', desc: 'Ahli strategi' };
  if (winRate >= 50) return { label: 'Warrior', icon: '⚔️', desc: 'Petarung tangguh' };
  if (winRate >= 35) return { label: 'Survivor', icon: '🛡️', desc: 'Pantang menyerah' };
  return { label: 'Underdog', icon: '🐺', desc: 'Bangkit dari bawah' };
}

export default function RankedProfile({ onClose }) {
  const points = useRankedStore((s) => s.points);
  const wins = useRankedStore((s) => s.wins);
  const losses = useRankedStore((s) => s.losses);
  const totalGames = useRankedStore((s) => s.totalGames);
  const winStreak = useRankedStore((s) => s.winStreak);
  const bestWinStreak = useRankedStore((s) => s.bestWinStreak);
  const highestPoints = useRankedStore((s) => s.highestPoints);
  const seasonGames = useRankedStore((s) => s.seasonGames);

  const profile = useAuthStore((s) => s.profile);
  const displayName = profile?.username || 'Player';
  const displayAvatar = profile?.selectedAvatar || '🧙';

  const tierInfo = useMemo(() => calculateTierInfo(points), [points]);
  const { tier, division, progress, pointsToNext } = tierInfo;
  const tierColor = TIER_COLORS[tier.id] || '#888';

  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';
  const playstyle = getPlaystyle(parseFloat(winRate), totalGames);

  // Pick signature card based on wins
  const signatureCard = useMemo(() => {
    return SIGNATURE_CARDS.find((c) => wins >= c.minWins) || SIGNATURE_CARDS[SIGNATURE_CARDS.length - 1];
  }, [wins]);

  // Next tier info
  const currentTierIndex = TIERS.findIndex((t) => t.id === tier.id);
  const nextTier = currentTierIndex < TIERS.length - 1 ? TIERS[currentTierIndex + 1] : null;

  // Highest rank achieved
  const highestTierInfo = useMemo(() => calculateTierInfo(highestPoints), [highestPoints]);

  return (
    <div className="ranked-profile">
      <button className="profile-settings__close" onClick={onClose}>✕</button>

      {/* Header — Rank Display */}
      <div className="ranked-profile__header" style={{ '--tier-color': tierColor }}>
        <div className="ranked-profile__tier-icon">{tier.icon}</div>
        <div className="ranked-profile__tier-info">
          <span className="ranked-profile__tier-name">
            {tier.name} {division || ''}
          </span>
          <span className="ranked-profile__points">{points} RP</span>
        </div>
      </div>

      {/* Progress Bar */}
      {pointsToNext !== null && nextTier && (
        <div className="ranked-profile__progress-section">
          <div className="ranked-profile__progress-bar">
            <div
              className="ranked-profile__progress-fill"
              style={{ width: `${Math.min(progress * 100, 100)}%`, background: tierColor }}
            />
          </div>
          <div className="ranked-profile__progress-labels">
            <span>{tier.icon} {tier.name}</span>
            <span>{pointsToNext} RP lagi</span>
            <span>{nextTier.icon} {nextTier.name}</span>
          </div>
        </div>
      )}
      {tier.id === 'immortal' && (
        <div className="ranked-profile__mythic-badge">
          🔱 Rank Tertinggi Tercapai — Immortal
        </div>
      )}

      {/* Stats Grid */}
      <div className="ranked-profile__stats">
        <div className="ranked-profile__stat">
          <span className="ranked-profile__stat-value" style={{ color: '#22c55e' }}>{wins}</span>
          <span className="ranked-profile__stat-label">Menang</span>
        </div>
        <div className="ranked-profile__stat">
          <span className="ranked-profile__stat-value" style={{ color: '#ef4444' }}>{losses}</span>
          <span className="ranked-profile__stat-label">Kalah</span>
        </div>
        <div className="ranked-profile__stat">
          <span className="ranked-profile__stat-value" style={{ color: '#06b6d4' }}>{winRate}%</span>
          <span className="ranked-profile__stat-label">Win Rate</span>
        </div>
        <div className="ranked-profile__stat">
          <span className="ranked-profile__stat-value" style={{ color: '#f59e0b' }}>{totalGames}</span>
          <span className="ranked-profile__stat-label">Total</span>
        </div>
      </div>

      {/* Streak & Records */}
      <div className="ranked-profile__records">
        <div className="ranked-profile__record">
          <span className="ranked-profile__record-icon">🔥</span>
          <div className="ranked-profile__record-info">
            <span className="ranked-profile__record-value">{winStreak}</span>
            <span className="ranked-profile__record-label">Win Streak</span>
          </div>
        </div>
        <div className="ranked-profile__record">
          <span className="ranked-profile__record-icon">💥</span>
          <div className="ranked-profile__record-info">
            <span className="ranked-profile__record-value">{bestWinStreak}</span>
            <span className="ranked-profile__record-label">Best Streak</span>
          </div>
        </div>
        <div className="ranked-profile__record">
          <span className="ranked-profile__record-icon">{highestTierInfo.tier.icon}</span>
          <div className="ranked-profile__record-info">
            <span className="ranked-profile__record-value">{highestTierInfo.tier.name}</span>
            <span className="ranked-profile__record-label">Rank Tertinggi</span>
          </div>
        </div>
      </div>

      {/* Signature Card & Playstyle */}
      <div className="ranked-profile__highlights">
        <div className="ranked-profile__highlight">
          <div className="ranked-profile__highlight-icon">{signatureCard.icon}</div>
          <div className="ranked-profile__highlight-info">
            <span className="ranked-profile__highlight-title">Signature Card</span>
            <span className="ranked-profile__highlight-name">{signatureCard.name}</span>
            <span className="ranked-profile__highlight-sub">{signatureCard.subtitle}</span>
          </div>
        </div>
        <div className="ranked-profile__highlight">
          <div className="ranked-profile__highlight-icon">{playstyle.icon}</div>
          <div className="ranked-profile__highlight-info">
            <span className="ranked-profile__highlight-title">Playstyle</span>
            <span className="ranked-profile__highlight-name">{playstyle.label}</span>
            <span className="ranked-profile__highlight-sub">{playstyle.desc}</span>
          </div>
        </div>
      </div>

      {/* Player Card */}
      <div className="ranked-profile__player-card" style={{ '--tier-color': tierColor }}>
        <span className="ranked-profile__player-avatar">{displayAvatar}</span>
        <span className="ranked-profile__player-name">{displayName}</span>
        <span className="ranked-profile__player-rank">{tier.icon} {tier.name} {division || ''}</span>
        <span className="ranked-profile__player-season">Season 1</span>
      </div>
    </div>
  );
}
