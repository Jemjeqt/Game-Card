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

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'baru saja';
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'kemarin';
  return `${d} hari lalu`;
}

export default function ProfileSettings({ onClose }) {
  const user          = useAuthStore((s) => s.user);
  const profile       = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const rankedPoints  = useRankedStore((s) => s.points);
  // All-game stats (from Firestore)
  const wins          = profile?.totalWins     ?? 0;
  const losses        = profile?.totalLosses   ?? 0;
  const totalGames    = profile?.totalGames    ?? 0;
  // Classic-only stats
  const classicWins   = profile?.classicWins   ?? 0;
  const classicLosses = profile?.classicLosses ?? 0;
  const classicGames  = profile?.classicGames  ?? 0;
  // Ranked-only stats
  const rankedWins    = profile?.rankedWins    ?? 0;
  const rankedLosses  = profile?.rankedLosses  ?? 0;
  const rankedGames   = profile?.rankedGames   ?? 0;

  const bestStreak    = profile?.bestWinStreak ?? 0;
  const winRate       = totalGames   > 0 ? ((wins        / totalGames)   * 100).toFixed(1) : '0.0';
  const classicWR     = classicGames > 0 ? ((classicWins / classicGames) * 100).toFixed(1) : '0.0';
  const rankedWR      = rankedGames  > 0 ? ((rankedWins  / rankedGames)  * 100).toFixed(1) : '0.0';

  const currentAvatar = profile?.selectedAvatar || '🧙';
  const currentName   = profile?.username || user?.displayName || '';
  const currentTitle  = profile?.title || 'Pemula';
  const level         = profile?.level || 1;

  const [selectedAvatar,    setSelectedAvatar]    = useState(currentAvatar);
  const [nickname,           setNickname]          = useState(currentName);
  const [selectedTitle,      setSelectedTitle]     = useState(currentTitle);
  const [saving,             setSaving]            = useState(false);
  const [toast,              setToast]             = useState(null); // { msg }
  const [error,              setError]             = useState(null);
  const [editingName,        setEditingName]       = useState(false);
  const [showAvatarModal,    setShowAvatarModal]   = useState(false);
  const [titleDropdownOpen,  setTitleDropdownOpen] = useState(false);
  const [statTab,            setStatTab]           = useState('all'); // 'all' | 'classic' | 'ranked'
  const [expandedHistory,    setExpandedHistory]   = useState(new Set()); // indices of expanded items

  const availableTitles = TITLE_OPTIONS.filter((t) => t.minLevel <= level);

  const showToast = (msg) => {
    setToast({ msg });
    setTimeout(() => setToast(null), 2200);
  };

  const { tier, division } = calculateTierInfo(rankedPoints);
  const tierColor  = TIER_COLORS[tier.id] || '#94a3b8';
  const isImmortal = tier.id === 'immortal';

  // Prestige crest icon per tier
  const TIER_CREST = {
    bronze: '🥉', silver: '🥈', gold: '🥇',
    platinum: '💎', diamond: '💠', mythic: '🏆', immortal: '🔱',
  };

  const saveField = async (fields, toastMsg) => {
    if (!user || saving) return;
    setSaving(true);
    setError(null);
    try {
      await updateUserProfile(user.uid, fields);
      if (fields.username) {
        await updateProfile(user, { displayName: fields.username });
      }
      await refreshProfile();
      showToast(toastMsg);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Gagal menyimpan. Coba lagi.');
    }
    setSaving(false);
  };

  const handleAvatarPick = (emoji) => {
    setSelectedAvatar(emoji);
    setShowAvatarModal(false);
    saveField({ avatar: emoji, selectedAvatar: emoji }, '✅ Avatar disimpan!');
  };

  const handleNameConfirm = () => {
    setEditingName(false);
    const trimmed = nickname.trim();
    if (trimmed === currentName) return;
    if (trimmed.length < 3) { setError('Username minimal 3 karakter.'); setNickname(currentName); return; }
    if (trimmed.length > 20) { setError('Username maksimal 20 karakter.'); setNickname(currentName); return; }
    setNickname(trimmed);
    saveField({ username: trimmed }, '✅ Nama disimpan!');
  };

  const handleTitlePick = (title) => {
    setSelectedTitle(title);
    setTitleDropdownOpen(false);
    if (title !== currentTitle) {
      saveField({ title }, '✅ Gelar disimpan!');
    }
  };

  return (
    <div className={`ps ps--${tier.id}`} style={{ '--tc': tierColor }}>
      <button className="profile-settings__close" onClick={onClose}>✕</button>

      {isImmortal && <div className="ps__immortal-crest" aria-hidden="true">🔱</div>}
      <div className="ps__tier-crest" aria-hidden="true">{TIER_CREST[tier.id]}</div>

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
              onBlur={handleNameConfirm}
              onKeyDown={(e) => e.key === 'Enter' && handleNameConfirm()}
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
                      onClick={() => handleTitlePick(t.title)}
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
        <div className="ps__emblem-glow" />
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
        {/* Tab switcher */}
        <div className="ps__stat-tabs">
          <button
            className={`ps__stat-tab ${statTab === 'all'     ? 'ps__stat-tab--on' : ''}`}
            onClick={() => setStatTab('all')}
          >All</button>
          <button
            className={`ps__stat-tab ${statTab === 'classic' ? 'ps__stat-tab--on' : ''}`}
            onClick={() => setStatTab('classic')}
          >Classic</button>
          <button
            className={`ps__stat-tab ${statTab === 'ranked'  ? 'ps__stat-tab--on' : ''}`}
            onClick={() => setStatTab('ranked')}
          >Ranked</button>
        </div>

        {/* Stat grid based on selected tab */}
        {statTab === 'all' && (
          <div className="ps__stat-grid">
            <div className="ps__stat"><span className="ps__stat-val ps__stat-val--w">{wins}</span><span className="ps__stat-lbl">WINS</span></div>
            <div className="ps__stat"><span className="ps__stat-val ps__stat-val--l">{losses}</span><span className="ps__stat-lbl">LOSSES</span></div>
            <div className="ps__stat"><span className="ps__stat-val ps__stat-val--wr">{winRate}%</span><span className="ps__stat-lbl">WINRATE</span></div>
            <div className="ps__stat"><span className="ps__stat-val ps__stat-val--str">{bestStreak}</span><span className="ps__stat-lbl">BEST STK</span></div>
          </div>
        )}
        {statTab === 'classic' && (
          <div className="ps__stat-grid">
            <div className="ps__stat"><span className="ps__stat-val ps__stat-val--w">{classicWins}</span><span className="ps__stat-lbl">WINS</span></div>
            <div className="ps__stat"><span className="ps__stat-val ps__stat-val--l">{classicLosses}</span><span className="ps__stat-lbl">LOSSES</span></div>
            <div className="ps__stat"><span className="ps__stat-val ps__stat-val--wr">{classicWR}%</span><span className="ps__stat-lbl">WINRATE</span></div>
            <div className="ps__stat"><span className="ps__stat-val">{classicGames}</span><span className="ps__stat-lbl">GAMES</span></div>
          </div>
        )}
        {statTab === 'ranked' && (
          <div className="ps__stat-grid">
            <div className="ps__stat"><span className="ps__stat-val ps__stat-val--w">{rankedWins}</span><span className="ps__stat-lbl">WINS</span></div>
            <div className="ps__stat"><span className="ps__stat-val ps__stat-val--l">{rankedLosses}</span><span className="ps__stat-lbl">LOSSES</span></div>
            <div className="ps__stat"><span className="ps__stat-val ps__stat-val--wr">{rankedWR}%</span><span className="ps__stat-lbl">WINRATE</span></div>
            <div className="ps__stat"><span className="ps__stat-val">{rankedGames}</span><span className="ps__stat-lbl">GAMES</span></div>
          </div>
        )}
      </div>

      {/* ── MATCH HISTORY ──────────────────────────────────── */}
      {(() => {
        const history = Array.isArray(profile?.matchHistory) ? profile.matchHistory : [];
        const MODE_LABEL = { classic: 'CLASSIC', ranked: 'RANKED', draft: 'DRAFT' };
        const OUTCOME_LABEL = {
          flawless: { text: 'FLAWLESS',   color: '#fbbf24' },
          dominant: { text: 'DOMINANT',   color: '#818cf8' },
          comeback: { text: 'COMEBACK',   color: '#f97316' },
        };
        const fmtDur = (s) => {
          if (!s) return null;
          if (s < 60) return `${s}s`;
          const m = Math.floor(s / 60), r = s % 60;
          return r > 0 ? `${m}m ${r}s` : `${m}m`;
        };
        const toggleExpanded = (i) => {
          setExpandedHistory((prev) => {
            const next = new Set(prev);
            next.has(i) ? next.delete(i) : next.add(i);
            return next;
          });
        };
        return (
          <div className="ps__history">
            <div className="ps__history-header">
              <span className="ps__history-header-icon">⚔️</span>
              <span className="ps__history-header-label">Riwayat Pertandingan</span>
            </div>
            {history.length === 0
              ? <div className="ps__history-empty">Belum ada pertandingan</div>
              : <div className="ps__history-list">
                  {history.map((h, i) => {
                    const delta   = h.pointDelta ?? h.rpDelta;
                    const open    = expandedHistory.has(i);
                    const outcome = OUTCOME_LABEL[h.outcome];
                    const dur     = fmtDur(h.duration);
                    return (
                      <div
                        key={i}
                        className={`ps__hi-item ps__hi-item--${h.result}${open ? ' ps__hi-item--open' : ''}`}
                        onClick={() => toggleExpanded(i)}
                      >
                        {/* ── Collapsed row ── */}
                        <div className="ps__hi-collapsed">
                          <div className="ps__hi-left">
                            <span className={`ps__hi-badge ps__hi-badge--${h.result}`}>
                              {h.result === 'win' ? 'MENANG' : 'KALAH'}
                            </span>
                            {outcome && (
                              <span className="ps__hi-outcome" style={{ color: outcome.color }}>
                                {outcome.text}
                              </span>
                            )}
                          </div>
                          <div className="ps__hi-right">
                            <span className={`ps__hi-mode ps__hi-mode--${h.mode}`}>
                              {MODE_LABEL[h.mode] ?? h.mode}
                            </span>
                            <span className="ps__hi-expand-icon">{open ? '▴' : '▾'}</span>
                          </div>
                        </div>
                        <div className="ps__hi-time">{timeAgo(h.ts)}</div>

                        {/* ── Expanded detail ── */}
                        {open && (
                          <div className="ps__hi-detail">
                            <div className="ps__hi-divider" />
                            <div className="ps__hi-section">
                              <div className="ps__hi-section-title">Match Summary</div>
                              <div className="ps__hi-rows">
                                {h.mode === 'ranked' && (
                                  <div className="ps__hi-row">
                                    <span className="ps__hi-row-label">Point</span>
                                    <span className={`ps__hi-row-val ${delta != null ? (delta >= 0 ? 'ps__hi-val--up' : 'ps__hi-val--down') : 'ps__hi-val--neutral'}`}>
                                      {h.pointsBefore != null && h.pointsAfter != null
                                        ? <>{h.pointsBefore} <span className="ps__hi-row-sub">→</span> {h.pointsAfter} <span className="ps__hi-row-sub">({delta >= 0 ? '+' : ''}{delta} PT)</span></>
                                        : delta != null ? `${delta >= 0 ? '+' : ''}${delta} PT` : '—'
                                      }
                                    </span>
                                  </div>
                                )}
                                {h.playerHp != null && (
                                  <div className="ps__hi-row">
                                    <span className="ps__hi-row-label">Sisa HP</span>
                                    <span className="ps__hi-row-val">
                                      {h.playerHp}
                                      {h.playerMaxHp ? <span className="ps__hi-row-sub"> / {h.playerMaxHp}</span> : ''}
                                    </span>
                                  </div>
                                )}
                                {h.turnCount != null && (
                                  <div className="ps__hi-row">
                                    <span className="ps__hi-row-label">Turn</span>
                                    <span className="ps__hi-row-val">{h.turnCount}</span>
                                  </div>
                                )}
                                {dur && (
                                  <div className="ps__hi-row">
                                    <span className="ps__hi-row-label">Durasi</span>
                                    <span className="ps__hi-row-val">{dur}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
            }
          </div>
        );
      })()}

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
                  onClick={() => handleAvatarPick(av.emoji)}
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

      {/* Save toast */}
      {toast && (
        <div className="ps__toast">{saving ? '⏳ Menyimpan...' : toast.msg}</div>
      )}
    </div>
  );
}
