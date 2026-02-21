import React, { useState } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import { updateUserProfile } from '../../firebase/userService';
import { updateProfile } from 'firebase/auth';

// ===== PROFILE SETTINGS =====
// Avatar selection, nickname change, account info

const AVATAR_OPTIONS = [
  { id: 'wizard', emoji: '🧙', label: 'Wizard' },
  { id: 'knight', emoji: '⚔️', label: 'Knight' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
  { id: 'fire', emoji: '🔥', label: 'Inferno' },
  { id: 'crown', emoji: '👑', label: 'King' },
];

const TITLE_OPTIONS = [
  { minLevel: 1, title: 'Pemula' },
  { minLevel: 3, title: 'Petarung' },
  { minLevel: 5, title: 'Penakluk' },
  { minLevel: 8, title: 'Sang Juara' },
  { minLevel: 10, title: 'Legenda' },
  { minLevel: 15, title: 'Immortal' },
];

export default function ProfileSettings({ onClose }) {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  const currentAvatar = profile?.selectedAvatar || '🧙';
  const currentName = profile?.username || user?.displayName || '';
  const currentTitle = profile?.title || 'Pemula';
  const level = profile?.level || 1;

  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [nickname, setNickname] = useState(currentName);
  const [selectedTitle, setSelectedTitle] = useState(currentTitle);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const availableTitles = TITLE_OPTIONS.filter((t) => t.minLevel <= level);

  const hasChanges =
    selectedAvatar !== currentAvatar ||
    nickname !== currentName ||
    selectedTitle !== currentTitle;

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
    <div className="profile-settings">
      <button className="profile-settings__close" onClick={onClose}>✕</button>
      <h2 className="profile-settings__title">⚙️ Pengaturan Profil</h2>

      {/* Current Profile Preview */}
      <div className="profile-settings__preview">
        <span className="profile-settings__preview-avatar">{selectedAvatar}</span>
        <div className="profile-settings__preview-info">
          <span className="profile-settings__preview-name">{nickname || '???'}</span>
          <span className="profile-settings__preview-level">Lv.{level} • {selectedTitle}</span>
        </div>
      </div>

      {/* Avatar Selection */}
      <div className="profile-settings__section">
        <label className="profile-settings__label">Pilih Avatar</label>
        <div className="profile-settings__avatars">
          {AVATAR_OPTIONS.map((av) => (
            <button
              key={av.id}
              className={`profile-settings__avatar-btn ${
                selectedAvatar === av.emoji ? 'profile-settings__avatar-btn--selected' : ''
              }`}
              onClick={() => setSelectedAvatar(av.emoji)}
              title={av.label}
            >
              <span className="profile-settings__avatar-emoji">{av.emoji}</span>
              <span className="profile-settings__avatar-label">{av.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nickname */}
      <div className="profile-settings__section">
        <label className="profile-settings__label">Username</label>
        <input
          className="profile-settings__input"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          placeholder="Masukkan username"
        />
      </div>

      {/* Title Selection */}
      <div className="profile-settings__section">
        <label className="profile-settings__label">Gelar</label>
        <div className="profile-settings__titles">
          {availableTitles.map((t) => (
            <button
              key={t.title}
              className={`profile-settings__title-btn ${
                selectedTitle === t.title ? 'profile-settings__title-btn--selected' : ''
              }`}
              onClick={() => setSelectedTitle(t.title)}
            >
              {t.title}
            </button>
          ))}
        </div>
        {TITLE_OPTIONS.length > availableTitles.length && (
          <p className="profile-settings__hint">
            🔒 Gelar lain terbuka di level yang lebih tinggi
          </p>
        )}
      </div>

      {/* Stats (read-only) */}
      <div className="profile-settings__section">
        <label className="profile-settings__label">Statistik</label>
        <div className="profile-settings__stats">
          <div className="profile-settings__stat">
            <span className="profile-settings__stat-icon">🏆</span>
            <span className="profile-settings__stat-value">{profile?.totalWins ?? 0}</span>
            <span className="profile-settings__stat-label">Menang</span>
          </div>
          <div className="profile-settings__stat">
            <span className="profile-settings__stat-icon">💀</span>
            <span className="profile-settings__stat-value">{profile?.totalLosses ?? 0}</span>
            <span className="profile-settings__stat-label">Kalah</span>
          </div>
          <div className="profile-settings__stat">
            <span className="profile-settings__stat-icon">🎮</span>
            <span className="profile-settings__stat-value">{profile?.totalGames ?? 0}</span>
            <span className="profile-settings__stat-label">Total</span>
          </div>
          <div className="profile-settings__stat">
            <span className="profile-settings__stat-icon">🔥</span>
            <span className="profile-settings__stat-value">{profile?.bestWinStreak ?? 0}</span>
            <span className="profile-settings__stat-label">Best Streak</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <div className="profile-settings__error">⚠️ {error}</div>}

      {/* Save Button */}
      <button
        className={`profile-settings__save ${saved ? 'profile-settings__save--saved' : ''}`}
        onClick={handleSave}
        disabled={saving || !hasChanges}
      >
        {saving ? '⏳ Menyimpan...' : saved ? '✅ Tersimpan!' : '💾 Simpan Perubahan'}
      </button>
    </div>
  );
}
