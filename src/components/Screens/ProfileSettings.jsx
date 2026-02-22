import React, { useState } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import useRankedStore, { calculateTierInfo } from '../../stores/useRankedStore';
import { updateUserProfile } from '../../firebase/userService';
import { updateProfile } from 'firebase/auth';

// ===== PROFILE SETTINGS — PRESTIGE MODE =====

const AVATAR_OPTIONS = [
  { id: 'wizard', emoji: '🧙', label: 'Wizard' },
  { id: 'knight', emoji: '⚔️', label: 'Knight' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
  { id: 'fire', emoji: '🔥', label: 'Inferno' },
  { id: 'crown', emoji: '👑', label: 'King' },
];

const TITLE_OPTIONS = [
  { minLevel: 1,  title: 'Pemula'     },
  { minLevel: 3,  title: 'Petarung'   },
  { minLevel: 5,  title: 'Penakluk'   },
  { minLevel: 8,  title: 'Sang Juara' },
  { minLevel: 10, title: 'Legenda'    },
  { minLevel: 15, title: 'Immortal'   },
];

const TIER_COLORS = {
  bronze: '#cd7f32', silver: '#94a3b8', gold: '#f59e0b',
  platinum: '#67e8f9', diamond: '#818cf8', mythic: '#f97316', immortal: '#e040fb',
};

export default function ProfileSettings({ onClose }) {
  const user          = useAuthStore((s) => s.user);
  const profile       = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const rankedPoints  = useRankedStore((s) => s.points);
  const wins          = profile?.totalWins   ?? 0;
  const losses        = profile?.totalLosses ?? 0;
  const totalGames    = profile?.totalGames  ?? 0;
  const bestStreak    = profile?.bestWinStreak ?? 0;
  const winRate       = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';

  const currentAvatar = profile?.selectedAvatar || '🧙';
  const currentName   = profile?.username || user?.displayName || '';
  const currentTitle  = profile?.title || 'Pemula';
  const level         = profile?.level || 1;

  const [selectedAvatar,    setSelectedAvatar]    = useState(currentAvatar);
  const [nickname,           setNickname]          = useState(currentName);
  const [selectedTitle,      setSelectedTitle]     = useState(currentTitle);
  const [saving,             setSaving]            = useState(false);
  const [saved,              setSaved]             = useState(false);
  const [error,              setError]             = useState(null);
  const [editingName,        setEditingName]       = useState(false);
  const [showAvatarModal,    setShowAvatarModal]   = useState(false);
  const [titleDropdownOpen,  setTitleDropdownOpen] = useState(false);

  const availableTitles = TITLE_OPTIONS.filter((t) => t.minLevel <= level);
  const hasChanges =
    selectedAvatar !== currentAvatar ||
    nickname !== currentName ||
    selectedTitle !== currentTitle;

  const { tier, division } = calculateTierInfo(rankedPoints);
  const tierColor  = TIER_COLORS[tier.id] || '#94a3b8';
  const isImmortal = tier.id === 'immortal';

  const handleSave = async () => {
    if (!user || saving) return;

    if (nickname.trim().length < 3) {
      setError('Username minimal 3 karakter.');
      return;
    }
    if (nickname.trim().length > 20) {
      setError('Username maksimal 20 karakter.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateUserProfile(user.uid, {
        avatar: selectedAvatar,
        selectedAvatar,
        username: nickname.trim(),
        title: selectedTitle,
      });

      // Also update Firebase Auth displayName
      await updateProfile(user, { displayName: nickname.trim() });

      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Gagal menyimpan. Coba lagi.');
    }
    setSaving(false);
  };

  return (
    <div className={`ps${isImmortal ? ' ps--immortal' : ''}`}>
      <button className="profile-settings__close" onClick={onClose}>✕</button>

      {isImmortal && <div className="ps__immortal-crest" aria-hidden="true">🔱</div>}

      {/* ── TOP: Hero Identity ─────────────────────────────── */}
      <div className="ps__hero">
        <button className="ps__avatar" onClick={() => setShowAvatarModal(true)} title="Ganti Avatar">
          <span className="ps__avatar-emoji">{selectedAvatar}</span>
          <span className="ps__avatar-hint">✎</span>
        </button>

        <div className="ps__identity">
          {editingName ? (
            <input
              className="ps__name-input"
              autoFocus
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              maxLength={20}
            />
          ) : (
            <button className="ps__name" onClick={() => setEditingName(true)}>
              <span>{nickname || '???'}</span>
              <span className="ps__pencil">✎</span>
            </button>
          )}

          <div className="ps__sub-row">
            <span className="ps__level">Lv.{level}</span>
            <span className="ps__sub-sep">·</span>
            <div className="ps__gelar-wrap">
              <button className="ps__gelar-btn" onClick={() => setTitleDropdownOpen((v) => !v)}>
                <span className="ps__gelar-val">{selectedTitle}</span>
                <span className="ps__gelar-caret">{titleDropdownOpen ? '▲' : '▼'}</span>
              </button>
              {titleDropdownOpen && (
                <div className="ps__gelar-dropdown">
                  {availableTitles.map((t) => (
                    <button
                      key={t.title}
                      className={`ps__gelar-opt ${selectedTitle === t.title ? 'ps__gelar-opt--on' : ''}`}
                      onClick={() => { setSelectedTitle(t.title); setTitleDropdownOpen(false); }}
                    >
                      {t.title}
                    </button>
                  ))}
                  {TITLE_OPTIONS.length > availableTitles.length && (
                    <div className="ps__gelar-locked">🔒 Level lebih tinggi</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── RANK SHOWCASE ──────────────────────────────────── */}
      <div className="ps__rank" style={{ '--tc': tierColor }}>
        <div className="ps__rank-glow" />
        {isImmortal && <div className="ps__emblem-glow" />}
        <div className="ps__rank-divider ps__rank-divider--top" />
        <div className="ps__rank-emblem">{tier.icon}</div>
        <div className="ps__rank-name">{tier.name}{division ? ` ${division}` : ''}</div>
        {tier.id === 'immortal' && (
          <div className="ps__rank-badge">Rank Tertinggi Tercapai</div>
        )}
        <div className="ps__rank-rp">{rankedPoints.toLocaleString()}</div>
        <div className="ps__rank-divider ps__rank-divider--bot" />
      </div>

      {/* ── STATS ──────────────────────────────────────────── */}
      <div className="ps__stats">
        <div className="ps__stat">
          <span className="ps__stat-val ps__stat-val--w">{wins}</span>
          <span className="ps__stat-lbl">WINS</span>
        </div>
        <div className="ps__stat">
          <span className="ps__stat-val ps__stat-val--l">{losses}</span>
          <span className="ps__stat-lbl">LOSSES</span>
        </div>
        <div className="ps__stat">
          <span className="ps__stat-val ps__stat-val--wr">{winRate}%</span>
          <span className="ps__stat-lbl">WINRATE</span>
        </div>
        <div className="ps__stat">
          <span className="ps__stat-val ps__stat-val--str">{bestStreak}</span>
          <span className="ps__stat-lbl">BEST STK</span>
        </div>
      </div>

      {/* ── AVATAR PICKER OVERLAY ──────────────────────────── */}
      {showAvatarModal && (
        <div className="ps__av-overlay" onClick={() => setShowAvatarModal(false)}>
          <div className="ps__av-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ps__av-header">
              <p className="ps__av-title">Pilih Avatar</p>
              <button className="ps__av-cancel" onClick={() => setShowAvatarModal(false)}>Batal</button>
            </div>
            <div className="ps__av-grid">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  className={`ps__av-btn ${selectedAvatar === av.emoji ? 'ps__av-btn--sel' : ''}`}
                  onClick={() => { setSelectedAvatar(av.emoji); setShowAvatarModal(false); }}
                >
                  <span className="ps__av-emoji">{av.emoji}</span>
                  <span className="ps__av-lbl">{av.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <div className="profile-settings__error">⚠️ {error}</div>}

      {/* Save */}
      <button
        className={`profile-settings__save ${saved ? 'profile-settings__save--saved' : ''}`}
        onClick={handleSave}
        disabled={saving || !hasChanges}
      >
        {saving ? '⏳ Menyimpan...' : saved ? '✅ Tersimpan!' : 'Simpan Perubahan'}
      </button>
    </div>
  );
}
