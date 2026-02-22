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

  const isImmortal = tier.id === 'immortal';
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';

  // Prestige crest icon per tier
  const TIER_CREST = {
    bronze: '🥉', silver: '🥈', gold: '🥇',
    platinum: '💎', diamond: '💠', mythic: '🏆', immortal: '🔱',
  };
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
    <div className={`rp rp--${tier.id}`} style={{ '--tc': tierColor }}>
      <button className="profile-settings__close" onClick={onClose}>✕</button>

      {isImmortal && <div className="rp__immortal-crest" aria-hidden="true">🔱</div>}
      <div className="rp__tier-crest" aria-hidden="true">{TIER_CREST[tier.id]}</div>

      {/* 1. Hero Rank Banner */}
      <div className="rp__hero">
        {isImmortal && <div className="rp__icon-glow" />}
        <div className="rp__icon-glow" />
        <div className="rp__hero-icon">{tier.icon}</div>
        <div className="rp__hero-body">
          <div className="rp__hero-rank">{tier.name}{division ? ` ${division}` : ''}</div>
          <div className="rp__hero-rp">{points}</div>
          {tier.id === 'immortal' && highestTierInfo.tier.id === 'immortal' && (
            <div className="rp__hero-badge">🔱 Rank Tertinggi Tercapai</div>
          )}
        </div>
      </div>

      {/* Progress to next tier */}
      {pointsToNext !== null && nextTier && (
        <div className="rp__progress">
          <div className="rp__progress-bar">
            <div className="rp__progress-fill" style={{ width: `${Math.min(progress * 100, 100)}%` }} />
          </div>
          <div className="rp__progress-labels">
            <span>{tier.icon} {tier.name}</span>
            <span>{pointsToNext} to {nextTier.name}</span>
            <span>{nextTier.icon}</span>
          </div>
        </div>
      )}

      {/* 2. Stats Section */}
      <div className="rp__stats">
        <div className="rp__stats-label">Ranked Stats</div>

        {/* 4-card derived stat grid */}
        <div className="rp__grid">
          <div className="rp__grid-card">
            <span className="rp__grid-val rp__grid-val--w">{wins}</span>
            <span className="rp__grid-lbl">WINS</span>
          </div>
          <div className="rp__grid-card">
            <span className="rp__grid-val rp__grid-val--l">{losses}</span>
            <span className="rp__grid-lbl">LOSSES</span>
          </div>
          <div className="rp__grid-card">
            <span className="rp__grid-val rp__grid-val--wr">{winRate}%</span>
            <span className="rp__grid-lbl">WINRATE</span>
          </div>
          <div className="rp__grid-card">
            <span className="rp__grid-val rp__grid-val--str">{bestWinStreak}</span>
            <span className="rp__grid-lbl">BEST STK</span>
          </div>
        </div>

        {/* Streak + Best Rank row */}
        <div className="rp__streaks">
          <div className="rp__streak">
            <span className="rp__streak-icon">🔥</span>
            <div>
              <span className="rp__streak-val">{winStreak}</span>
              <span className="rp__streak-lbl">Win Streak</span>
            </div>
          </div>
          <div className="rp__streak-div" />
          <div className="rp__streak">
            <span className="rp__streak-icon">{highestTierInfo.tier.icon}</span>
            <div>
              <span className="rp__streak-val rp__streak-val--sm">{highestTierInfo.tier.name}</span>
              <span className="rp__streak-lbl">Best Rank</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3 & 4. Signature Card + Playstyle */}
      <div className="rp__accents">
        <div className="rp__accent rp__accent--sig">
          <span className="rp__accent-icon">{signatureCard.icon}</span>
          <div className="rp__accent-body">
            <span className="rp__accent-lbl">Signature Card</span>
            <span className="rp__accent-name">{signatureCard.name}</span>
            <span className="rp__accent-sub">{signatureCard.subtitle}</span>
          </div>
        </div>
        <div className="rp__accent rp__accent--play">
          <span className="rp__accent-icon">{playstyle.icon}</span>
          <div className="rp__accent-body">
            <span className="rp__accent-lbl">Playstyle</span>
            <span className="rp__accent-name">{playstyle.label}</span>
            <span className="rp__accent-sub">{playstyle.desc}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="rp__footer">
        <span className="rp__footer-avatar">{displayAvatar}</span>
        <div className="rp__footer-info">
          <span className="rp__footer-name">{displayName}</span>
          <span className="rp__footer-rank">{tier.icon} {tier.name}{division ? ` ${division}` : ''}</span>
        </div>
        <span className="rp__footer-season">Season 1</span>
      </div>
    </div>
  );
}
