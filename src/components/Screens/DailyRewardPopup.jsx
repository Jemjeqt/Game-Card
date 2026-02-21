import React, { useState, useEffect } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import { claimDailyReward } from '../../firebase/userService';

// ===== DAILY REWARD POPUP =====
// Shows on login if there's an unclaimed daily reward

export default function DailyRewardPopup({ onClose }) {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  const [reward, setReward] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  const handleClaim = async () => {
    if (!user || claiming) return;
    setClaiming(true);
    try {
      const result = await claimDailyReward(user.uid);
      if (result) {
        setReward(result);
        setClaimed(true);
        await refreshProfile();
      } else {
        setAlreadyClaimed(true);
      }
    } catch (err) {
      console.error('Failed to claim daily reward:', err);
      setAlreadyClaimed(true);
    }
    setClaiming(false);
  };

  // Auto-check on mount
  useEffect(() => {
    // Display the popup — user will click to claim
  }, []);

  if (alreadyClaimed) {
    return (
      <div className="daily-reward-overlay" onClick={onClose}>
        <div className="daily-reward-card" onClick={(e) => e.stopPropagation()}>
          <div className="daily-reward-icon">✅</div>
          <h2 className="daily-reward-title">Sudah Diklaim!</h2>
          <p className="daily-reward-text">Kembali lagi besok untuk reward berikutnya.</p>
          <button className="daily-reward-btn" onClick={onClose}>OK</button>
        </div>
      </div>
    );
  }

  if (claimed && reward) {
    return (
      <div className="daily-reward-overlay" onClick={onClose}>
        <div className="daily-reward-card daily-reward-card--success" onClick={(e) => e.stopPropagation()}>
          <div className="daily-reward-icon">🎁</div>
          <h2 className="daily-reward-title">Reward Harian!</h2>
          <div className="daily-reward-items">
            <div className="daily-reward-item">
              <span className="daily-reward-item-icon">🪙</span>
              <span className="daily-reward-item-value">+{reward.coins} Coins</span>
            </div>
            <div className="daily-reward-item">
              <span className="daily-reward-item-icon">⭐</span>
              <span className="daily-reward-item-value">+{reward.exp} EXP</span>
            </div>
          </div>
          <div className="daily-reward-streak">
            🔥 Streak: {reward.streak} hari
          </div>
          {reward.leveledUp && (
            <div className="daily-reward-levelup">
              🎉 Level Up! Level {reward.newLevel}
            </div>
          )}
          <button className="daily-reward-btn" onClick={onClose}>Lanjut</button>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-reward-overlay" onClick={onClose}>
      <div className="daily-reward-card" onClick={(e) => e.stopPropagation()}>
        <div className="daily-reward-icon">🎁</div>
        <h2 className="daily-reward-title">Daily Reward</h2>
        <p className="daily-reward-text">Login setiap hari untuk mendapat bonus!</p>
        <div className="daily-reward-streak-info">
          🔥 Streak saat ini: {profile?.dailyRewardStreak || 0} hari
        </div>
        <button
          className="daily-reward-btn daily-reward-btn--claim"
          onClick={handleClaim}
          disabled={claiming}
        >
          {claiming ? '⏳ Mengambil...' : '🎁 Klaim Reward'}
        </button>
      </div>
    </div>
  );
}
