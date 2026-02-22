import React, { useState } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import useRankedStore from '../../stores/useRankedStore';
import { updateUserProfile } from '../../firebase/userService';
import { TIER_CONFIG } from '../../data/constants';

// ===== DEV TOOLS — Extended =====

const PRESET_PROFILES = [
  { label: '🏆 Max Rank',    data: { level: 50, rankedPoints: 5000, totalWins: 500, totalLosses: 50,  totalGames: 550, winStreak: 25, bestWinStreak: 25, title: 'Immortal', classicWins: 250, classicLosses: 30, classicGames: 280, rankedWins: 250, rankedLosses: 20, rankedGames: 270 } },
  { label: '⚔️ Mid Player',  data: { level: 10, rankedPoints: 1200, totalWins: 80,  totalLosses: 40,  totalGames: 120, winStreak: 5,  bestWinStreak: 8,  title: 'Legenda', classicWins: 40,  classicLosses: 20, classicGames: 60,  rankedWins: 40,  rankedLosses: 20, rankedGames: 60  } },
  { label: '🌱 Fresh Start', data: { level: 1,  rankedPoints: 0,    totalWins: 0,   totalLosses: 0,   totalGames: 0,   winStreak: 0,  bestWinStreak: 0,  title: 'Pemula',  classicWins: 0,   classicLosses: 0,  classicGames: 0,   rankedWins: 0,   rankedLosses: 0,  rankedGames: 0   } },
];

const RANK_PRESETS = [
  { label: '🥉', name: 'Bronze',   points: 0    },
  { label: '🥈', name: 'Silver',   points: 300  },
  { label: '🥇', name: 'Gold',     points: 600  },
  { label: '💎', name: 'Platinum', points: 900  },
  { label: '💠', name: 'Diamond',  points: 1200 },
  { label: '🏆', name: 'Mythic',   points: 1500 },
  { label: '🔱', name: 'Immortal', points: 1800 },
];

const PROFILE_FIELDS = [
  { key: 'level',         label: 'Level',        type: 'number', min: 1, max: 99,    icon: '📊' },
  { key: 'winStreak',     label: 'Win Streak',   type: 'number', min: 0, max: 9999,  icon: '🔥' },
  { key: 'bestWinStreak', label: 'Best Streak',  type: 'number', min: 0, max: 9999,  icon: '💥' },
  { key: 'title',         label: 'Title',        type: 'text',                       icon: '🎖️' },
];

const TOTAL_STAT_FIELDS = [
  { key: 'totalWins',   label: 'Wins',   icon: '✅' },
  { key: 'totalLosses', label: 'Losses', icon: '❌' },
  { key: 'totalGames',  label: 'Games',  icon: '🎮' },
];

const MODE_STAT_GROUPS = [
  { prefix: 'classic', label: 'Classic', color: '#818cf8' },
  { prefix: 'ranked',  label: 'Ranked',  color: '#fbbf24' },
];

const INJECT_MODES = ['classic', 'ranked'];

function getActiveRankIndex(points) {
  let idx = 0;
  for (let i = 0; i < RANK_PRESETS.length; i++) {
    if (points >= RANK_PRESETS[i].points) idx = i;
  }
  return idx;
}

// Map rank name → max HP from TIER_CONFIG
function getTierMaxHp(rankName) {
  const key = rankName?.toLowerCase();
  return TIER_CONFIG[key]?.maxHp ?? 60;
}

export default function DevTools({ onClose }) {
  const user    = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const storePoints = useRankedStore((s) => s.points);

  const buildInitial = () => {
    const v = {};
    PROFILE_FIELDS.forEach((f) => { v[f.key] = profile?.[f.key] ?? (f.type === 'number' ? 0 : ''); });
    TOTAL_STAT_FIELDS.forEach((f) => { v[f.key] = profile?.[f.key] ?? 0; });
    MODE_STAT_GROUPS.forEach(({ prefix }) => {
      ['Wins', 'Losses', 'Games'].forEach((s) => {
        const k = `${prefix}${s}`;
        v[k] = profile?.[k] ?? 0;
      });
    });
    v._rp = storePoints;
    return v;
  };

  const [values,       setValues]       = useState(buildInitial);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [error,        setError]        = useState(null);
  const [injectMode,        setInjectMode]        = useState('classic');
  const [injectResult,      setInjectResult]      = useState('win');
  const [injectRp,          setInjectRp]          = useState('');
  const [injectPointBefore, setInjectPointBefore] = useState('1000');
  const [injectHp,          setInjectHp]          = useState('18');
  const [injectTurns,       setInjectTurns]       = useState('7');
  const [injectDur,         setInjectDur]         = useState('180');
  const [injectOutcome,     setInjectOutcome]     = useState('');

  const setNum = (key, val, min = 0, max = 99999) => {
    const n = parseInt(val, 10);
    setValues((v) => ({ ...v, [key]: isNaN(n) ? '' : Math.max(min, Math.min(max, n)) }));
  };

  const applyPreset = (preset) => {
    setValues((prev) => ({ ...prev, ...preset.data, _rp: preset.data.rankedPoints ?? prev._rp }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    setError(null);
    try {
      const updates = {};
      [...PROFILE_FIELDS, ...TOTAL_STAT_FIELDS].forEach((f) => {
        const val = f.type === 'number' ? (values[f.key] === '' ? 0 : Number(values[f.key])) : values[f.key];
        updates[f.key] = val;
      });
      MODE_STAT_GROUPS.forEach(({ prefix }) => {
        ['Wins', 'Losses', 'Games'].forEach((s) => {
          const k = `${prefix}${s}`;
          updates[k] = values[k] === '' ? 0 : Number(values[k]);
        });
      });
      const rp = values._rp === '' ? 0 : Math.max(0, Number(values._rp));
      updates.rankedPoints        = rp;
      updates.highestRankedPoints = rp;

      await updateUserProfile(user.uid, updates);

      const rankedSync = {
        points: rp, highestPoints: rp,
        wins: updates.totalWins, losses: updates.totalLosses,
        totalGames: updates.totalGames, winStreak: updates.winStreak,
        bestWinStreak: updates.bestWinStreak, seasonGames: updates.totalGames,
      };
      useRankedStore.setState(rankedSync);
      try { localStorage.setItem('cardBattle_ranked', JSON.stringify(rankedSync)); } catch (_) {}

      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('DevTools save failed:', err);
      setError('Gagal menyimpan.');
    }
    setSaving(false);
  };

  const handleInjectHistory = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      const rpDelta  = injectMode === 'ranked' && injectRp !== '' ? Number(injectRp) : null;
      const ptBefore = injectMode === 'ranked' && injectPointBefore !== '' ? Number(injectPointBefore) : null;
      const tierMaxHp = getTierMaxHp(RANK_PRESETS[getActiveRankIndex(values._rp === '' ? 0 : Number(values._rp))].name);
      const entry = {
        result:       injectResult,
        mode:         injectMode,
        pointDelta:   rpDelta,
        pointsBefore: ptBefore,
        pointsAfter:  ptBefore != null && rpDelta != null ? ptBefore + rpDelta : null,
        playerHp:     injectHp    !== '' ? Number(injectHp)    : null,
        playerMaxHp:  tierMaxHp,
        turnCount:    injectTurns !== '' ? Number(injectTurns) : null,
        duration:     injectDur   !== '' ? Number(injectDur)   : null,
        outcome:      injectOutcome || null,
        ts:           Date.now(),
      };
      const prev = Array.isArray(profile?.matchHistory) ? profile.matchHistory : [];
      const next = [entry, ...prev].slice(0, 10);
      await updateUserProfile(user.uid, { matchHistory: next });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError('Gagal inject history.');
    }
    setSaving(false);
  };

  const handleDeleteEntry = async (i) => {
    if (!user || saving) return;
    setSaving(true);
    try {
      const prev = Array.isArray(profile?.matchHistory) ? profile.matchHistory : [];
      const next = prev.filter((_, idx) => idx !== i);
      await updateUserProfile(user.uid, { matchHistory: next });
      await refreshProfile();
    } catch (_) {}
    setSaving(false);
  };

  const handleWipeHistory = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { matchHistory: [] });
      await refreshProfile();
    } catch (_) {}
    setSaving(false);
  };

  const activeRankIdx = getActiveRankIndex(values._rp === '' ? 0 : Number(values._rp));

  return (
    <div className="devtools">
      <button className="profile-settings__close" onClick={onClose}>✕</button>

      {/* Header */}
      <div className="devtools__header">
        <div className="devtools__header-main">
          <span className="devtools__icon">🛠️</span>
          <h2 className="devtools__title">Developer Tools</h2>
          <span className="devtools__badge">DEV</span>
        </div>
        <p className="devtools__subtitle">Manipulasi data profil untuk testing</p>
      </div>

      {/* ── Quick Presets ─── */}
      <section className="devtools__section">
        <div className="devtools__section-label devtools__section-label--preset">⚡ Quick Presets</div>
        <div className="devtools__presets">
          {PRESET_PROFILES.map((p) => (
            <button key={p.label} className="devtools__preset-btn" onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Ranked Tier ─── */}
      <section className="devtools__section">
        <div className="devtools__section-label devtools__section-label--ranked">🏅 Ranked Tier</div>
        <div className="devtools__rank-pills">
          {RANK_PRESETS.map((r, i) => (
            <button
              key={r.name}
              className={`devtools__rank-pill ${activeRankIdx === i ? 'devtools__rank-pill--on' : ''}`}
              onClick={() => setValues((v) => ({ ...v, _rp: r.points }))}
            >
              {r.label} {r.name}
            </button>
          ))}
        </div>
        <div className="devtools__rp-row">
          <label className="devtools__inline-label">Manual Point</label>
          <input
            className="devtools__rp-input"
            type="number" min={0} max={99999}
            value={values._rp}
            onChange={(e) => setNum('_rp', e.target.value, 0, 99999)}
          />
        </div>
      </section>

      {/* ── Profile Fields ─── */}
      <section className="devtools__section">
        <div className="devtools__section-label devtools__section-label--profile">📋 Profil</div>
        <div className="devtools__fields">
          {PROFILE_FIELDS.map((f) => (
            <div key={f.key} className="devtools__field">
              <label className="devtools__field-label">{f.icon} {f.label}</label>
              <input
                className="devtools__field-input"
                type={f.type} min={f.min} max={f.max}
                value={values[f.key]}
                onChange={(e) =>
                  f.type === 'number'
                    ? setNum(f.key, e.target.value, f.min, f.max)
                    : setValues((v) => ({ ...v, [f.key]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ─── */}
      <section className="devtools__section">
        <div className="devtools__section-label devtools__section-label--stats">📈 Stats</div>

        <div className="devtools__stats-row">
          {TOTAL_STAT_FIELDS.map((f) => (
            <div key={f.key} className="devtools__field devtools__field--compact">
              <label className="devtools__field-label">{f.icon} {f.label}</label>
              <input className="devtools__field-input" type="number" min={0} max={99999}
                value={values[f.key]} onChange={(e) => setNum(f.key, e.target.value)} />
            </div>
          ))}
        </div>

        {MODE_STAT_GROUPS.map(({ prefix, label, color }) => (
          <div key={prefix} className="devtools__mode-block">
            <span className="devtools__mode-badge" style={{ '--mc': color }}>{label}</span>
            <div className="devtools__stats-row">
              {['Wins', 'Losses', 'Games'].map((s) => {
                const k = `${prefix}${s}`;
                return (
                  <div key={k} className="devtools__field devtools__field--compact">
                    <label className="devtools__field-label">{s}</label>
                    <input className="devtools__field-input" type="number" min={0} max={99999}
                      value={values[k]} onChange={(e) => setNum(k, e.target.value)} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* ── Inject History ─── */}
      <section className="devtools__section">
        <div className="devtools__section-label devtools__section-label--history">🕓 Inject History</div>
        <div className="devtools__inject-row">
          <div className="devtools__toggle-group">
            {['win', 'lose'].map((r) => (
              <button key={r}
                className={`devtools__toggle ${injectResult === r ? 'devtools__toggle--on' : ''}`}
                onClick={() => setInjectResult(r)}
              >{r === 'win' ? '✅ Menang' : '❌ Kalah'}</button>
            ))}
          </div>
          <div className="devtools__toggle-group">
            {INJECT_MODES.map((m) => (
              <button key={m}
                className={`devtools__toggle ${injectMode === m ? 'devtools__toggle--on' : ''}`}
                onClick={() => setInjectMode(m)}
              >{m}</button>
            ))}
          </div>
        </div>
        <div className="devtools__inject-inputs">
          {injectMode === 'ranked' && (
            <>
              <div className="devtools__field">
                <label className="devtools__field-label">📊 Point Sebelum</label>
                <input className="devtools__field-input" type="number" placeholder="1000"
                  value={injectPointBefore} onChange={(e) => setInjectPointBefore(e.target.value)} />
              </div>
              <div className="devtools__field">
                <label className="devtools__field-label">🏅 Point Delta</label>
                <input className="devtools__field-input" type="number" placeholder="+15"
                  value={injectRp} onChange={(e) => setInjectRp(e.target.value)} />
              </div>
            </>
          )}
          <div className="devtools__field">
            <label className="devtools__field-label">❤️ Sisa HP</label>
            <input className="devtools__field-input" type="number" min={0} max={30} placeholder="18"
              value={injectHp} onChange={(e) => setInjectHp(e.target.value)} />
          </div>
          <div className="devtools__field">
            <label className="devtools__field-label">🔄 Turns</label>
            <input className="devtools__field-input" type="number" min={1} placeholder="7"
              value={injectTurns} onChange={(e) => setInjectTurns(e.target.value)} />
          </div>
          <div className="devtools__field">
            <label className="devtools__field-label">⏱ Durasi (detik)</label>
            <input className="devtools__field-input" type="number" min={0} placeholder="180"
              value={injectDur} onChange={(e) => setInjectDur(e.target.value)} />
          </div>
          <div className="devtools__field">
            <label className="devtools__field-label">🏷 Outcome</label>
            <select className="devtools__field-input" value={injectOutcome} onChange={(e) => setInjectOutcome(e.target.value)}>
              <option value="">— none —</option>
              <option value="flawless">FLAWLESS (HP &gt; 80%)</option>
              <option value="dominant">DOMINANT (HP &gt; 50%)</option>
              <option value="comeback">COMEBACK (HP ≤ 20%)</option>
            </select>
          </div>
        </div>
        <div className="devtools__inject-actions">
          <button className="devtools__inject-btn" onClick={handleInjectHistory} disabled={saving}>
            ➕ Tambah Entri
          </button>
          <button className="devtools__wipe-btn" onClick={handleWipeHistory} disabled={saving}>
            🗑️ Hapus Semua
          </button>
        </div>

        {/* Per-entry delete list */}
        {(() => {
          const hist = Array.isArray(profile?.matchHistory) ? profile.matchHistory : [];
          if (hist.length === 0) return <div className="devtools__history-empty">Belum ada riwayat.</div>;
          const fmtDur = (s) => { if (!s) return '—'; if (s < 60) return `${s}s`; const m = Math.floor(s/60), r = s%60; return r ? `${m}m ${r}s` : `${m}m`; };
          return (
            <div className="devtools__history-list">
              {hist.map((h, i) => (
                <div key={i} className={`devtools__history-entry devtools__history-entry--${h.result}`}>
                  <span className={`devtools__hi-badge devtools__hi-badge--${h.result}`}>{h.result === 'win' ? 'MENANG' : 'KALAH'}</span>
                  <span className="devtools__hi-mode">{h.mode?.toUpperCase()}</span>
                  {h.outcome && <span className="devtools__hi-outcome">{h.outcome.toUpperCase()}</span>}
                  <span className="devtools__hi-meta">HP {h.playerHp ?? '?'}/{h.playerMaxHp ?? 60} · {h.turnCount ?? '?'}T · {fmtDur(h.duration)}</span>
                  {h.mode === 'ranked' && (h.pointsBefore != null || h.pointDelta != null) && (
                    <span className={`devtools__hi-pt ${h.pointDelta >= 0 ? 'devtools__hi-pt--up' : 'devtools__hi-pt--down'}`}>
                      {h.pointsBefore != null && h.pointsAfter != null
                        ? `${h.pointsBefore}→${h.pointsAfter}`
                        : `${h.pointDelta >= 0 ? '+' : ''}${h.pointDelta} PT`}
                    </span>
                  )}
                  <button className="devtools__hi-del" onClick={() => handleDeleteEntry(i)} disabled={saving}>✕</button>
                </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* Error */}
      {error && <div className="profile-settings__error">⚠️ {error}</div>}

      {/* Save */}
      <button
        className={`devtools__save-btn ${saved ? 'devtools__save-btn--saved' : ''}`}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? '⏳ Menyimpan...' : saved ? '✅ Tersimpan!' : '💾 Simpan'}
      </button>
    </div>
  );
}
