import React, { useState } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import useRankedStore from '../../stores/useRankedStore';
import { updateUserProfile } from '../../firebase/userService';

// ===== DEV TOOLS =====
// Developer panel for testing — manipulate profile stats freely

const PRESET_PROFILES = [
  {
    label: '🏆 Max Rank',
    data: { level: 50, exp: 0, coins: 99999, gems: 999, rankedPoints: 5000, totalWins: 500, totalLosses: 50, totalGames: 550, winStreak: 25, bestWinStreak: 25, title: 'Immortal' },
  },
  {
    label: '⚔️ Mid Player',
    data: { level: 10, exp: 500, coins: 3000, gems: 50, rankedPoints: 1200, totalWins: 80, totalLosses: 40, totalGames: 120, winStreak: 5, bestWinStreak: 8, title: 'Legenda' },
  },
  {
    label: '🌱 Fresh Start',
    data: { level: 1, exp: 0, coins: 500, gems: 0, rankedPoints: 0, totalWins: 0, totalLosses: 0, totalGames: 0, winStreak: 0, bestWinStreak: 0, title: 'Pemula' },
  },
];

const RANK_PRESETS = [
  { label: '🥉 Bronze', points: 0 },
  { label: '🥈 Silver', points: 300 },
  { label: '🥇 Gold', points: 600 },
  { label: '💎 Platinum', points: 900 },
  { label: '💠 Diamond', points: 1200 },
  { label: '🏆 Mythic', points: 1500 },
  { label: '🔱 Immortal', points: 1800 },
];

const EDITABLE_FIELDS = [
  { key: 'level', label: 'Level', type: 'number', min: 1, max: 99, icon: '📊' },
  { key: 'exp', label: 'EXP', type: 'number', min: 0, max: 999999, icon: '⭐' },
  { key: 'coins', label: 'Coins', type: 'number', min: 0, max: 999999, icon: '🪙' },
  { key: 'gems', label: 'Gems', type: 'number', min: 0, max: 99999, icon: '💎' },
  { key: 'rankedPoints', label: 'Ranked Points', type: 'number', min: 0, max: 99999, icon: '🏆' },
  { key: 'totalWins', label: 'Total Wins', type: 'number', min: 0, max: 99999, icon: '✅' },
  { key: 'totalLosses', label: 'Total Losses', type: 'number', min: 0, max: 99999, icon: '❌' },
  { key: 'totalGames', label: 'Total Games', type: 'number', min: 0, max: 99999, icon: '🎮' },
  { key: 'winStreak', label: 'Win Streak', type: 'number', min: 0, max: 9999, icon: '🔥' },
  { key: 'bestWinStreak', label: 'Best Streak', type: 'number', min: 0, max: 9999, icon: '💥' },
  { key: 'title', label: 'Title', type: 'text', icon: '🎖️' },
];

export default function DevTools({ onClose }) {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const rankedPoints = useRankedStore((s) => s.points);

  const [values, setValues] = useState(() => {
    const initial = {};
    EDITABLE_FIELDS.forEach((f) => {
      initial[f.key] = profile?.[f.key] ?? (f.type === 'number' ? 0 : '');
    });
    initial._rankedPoints = rankedPoints;
    return initial;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (key, value, field) => {
    if (field.type === 'number') {
      const num = parseInt(value, 10);
      if (isNaN(num)) {
        setValues((v) => ({ ...v, [key]: '' }));
        return;
      }
      setValues((v) => ({ ...v, [key]: Math.max(field.min, Math.min(field.max, num)) }));
    } else {
      setValues((v) => ({ ...v, [key]: value }));
    }
  };

  const applyPreset = (preset) => {
    setValues((prev) => ({ ...prev, ...preset.data, _rankedPoints: preset.data.rankedPoints ?? prev._rankedPoints }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    setError(null);

    try {
      const updates = {};
      EDITABLE_FIELDS.forEach((f) => {
        const val = f.type === 'number' ? (values[f.key] === '' ? 0 : Number(values[f.key])) : values[f.key];
        updates[f.key] = val;
      });

      await updateUserProfile(user.uid, updates);

      // Sync all ranked data to local ranked store + localStorage
      const rp = values._rankedPoints === '' ? 0 : Number(values._rankedPoints);
      const rankedSync = {
        points: Math.max(0, rp),
        wins: updates.totalWins ?? 0,
        losses: updates.totalLosses ?? 0,
        totalGames: updates.totalGames ?? 0,
        winStreak: updates.winStreak ?? 0,
        bestWinStreak: updates.bestWinStreak ?? 0,
        highestPoints: Math.max(0, rp),
        seasonGames: updates.totalGames ?? 0,
      };
      useRankedStore.setState(rankedSync);
      try {
        localStorage.setItem('cardBattle_ranked', JSON.stringify(rankedSync));
      } catch (_) {}

      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('DevTools save failed:', err);
      setError('Gagal menyimpan. Coba lagi.');
    }
    setSaving(false);
  };

  return (
    <div className="devtools">
      <button className="profile-settings__close" onClick={onClose}>✕</button>
      <h2 className="devtools__title">🛠️ Developer Tools</h2>
      <p className="devtools__subtitle">Manipulasi data profil untuk testing</p>

      {/* Presets */}
      <div className="devtools__section">
        <label className="devtools__label">Quick Presets</label>
        <div className="devtools__presets">
          {PRESET_PROFILES.map((p) => (
            <button
              key={p.label}
              className="devtools__preset-btn"
              onClick={() => applyPreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ranked Tier */}
      <div className="devtools__section">
        <label className="devtools__label">Ranked Tier</label>
        <div className="devtools__presets">
          {RANK_PRESETS.map((r) => (
            <button
              key={r.label}
              className={`devtools__preset-btn ${values._rankedPoints >= r.points && (RANK_PRESETS.findIndex(x => x.points > values._rankedPoints) === -1 ? r === RANK_PRESETS[RANK_PRESETS.length - 1] : RANK_PRESETS[RANK_PRESETS.findIndex(x => x.points > values._rankedPoints) - 1] === r) ? 'devtools__preset-btn--active' : ''}`}
              onClick={() => setValues((v) => ({ ...v, _rankedPoints: r.points }))}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="devtools__field" style={{ marginTop: '8px' }}>
          <label className="devtools__field-label">🏅 Ranked Points (manual)</label>
          <input
            className="devtools__field-input"
            type="number"
            value={values._rankedPoints}
            onChange={(e) => {
              const num = parseInt(e.target.value, 10);
              setValues((v) => ({ ...v, _rankedPoints: isNaN(num) ? '' : Math.max(0, Math.min(99999, num)) }));
            }}
            min={0}
            max={99999}
          />
        </div>
      </div>

      {/* Editable Fields */}
      <div className="devtools__section">
        <label className="devtools__label">Edit Fields</label>
        <div className="devtools__fields">
          {EDITABLE_FIELDS.map((f) => (
            <div key={f.key} className="devtools__field">
              <label className="devtools__field-label">
                {f.icon} {f.label}
              </label>
              <input
                className="devtools__field-input"
                type={f.type}
                value={values[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value, f)}
                min={f.min}
                max={f.max}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && <div className="profile-settings__error">⚠️ {error}</div>}

      {/* Save */}
      <button
        className={`profile-settings__save ${saved ? 'profile-settings__save--saved' : ''}`}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? '⏳ Menyimpan...' : saved ? '✅ Tersimpan!' : '💾 Simpan ke Firestore'}
      </button>
    </div>
  );
}
