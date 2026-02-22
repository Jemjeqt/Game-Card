import React, { useState } from 'react';
import { initializeGame } from '../../engine/turnEngine';
import useGameStore from '../../stores/useGameStore';
import useRankedStore, { calculateTierInfo } from '../../stores/useRankedStore';
import useDraftStore from '../../stores/useDraftStore';
import useQuestStore from '../../stores/useQuestStore';
import useAuthStore from '../../stores/useAuthStore';
import RankedBadge from '../HUD/RankedBadge';
import QuestPanel from '../HUD/QuestPanel';
import ProfileSettings from './ProfileSettings';
import RankedProfile from './RankedProfile';
import DevTools from './DevTools';
import { GAME_STATUS, GAME_VERSION, TIER_DIFFICULTY, DIFFICULTY_CONFIG, TIER_RP, TIER_CONFIG } from '../../data/constants';

const GUIDE_TABS = ['Mekanik', 'Minion', 'Spell', 'Strategi'];

// Tier glow palette for premium profile header
const TIER_GLOW = {
  bronze:   { c: '#b87333', glow: 'rgba(184,115,51,0.65)',  soft: 'rgba(184,115,51,0.18)' },
  silver:   { c: '#94a3b8', glow: 'rgba(148,163,184,0.6)', soft: 'rgba(148,163,184,0.15)' },
  gold:     { c: '#f59e0b', glow: 'rgba(245,158,11,0.7)',   soft: 'rgba(245,158,11,0.2)'  },
  platinum: { c: '#22d3ee', glow: 'rgba(6,182,212,0.65)',   soft: 'rgba(6,182,212,0.18)'  },
  diamond:  { c: '#67e8f9', glow: 'rgba(110,231,247,0.7)',  soft: 'rgba(110,231,247,0.2)' },
  mythic:   { c: '#f97316', glow: 'rgba(249,115,22,0.68)',  soft: 'rgba(249,115,22,0.18)' },
  immortal: { c: '#06b6d4', glow: 'rgba(6,182,212,0.85)',   soft: 'rgba(6,182,212,0.28)'  },
};

const MINION_CARDS = [
  // === COMMON ===
  { name: 'Healing Wisp', mana: 1, atk: 0, def: 3, desc: 'Makhluk penyembuh. Battlecry: Heal hero 2 HP. Berguna di early game untuk bertahan.' },
  { name: 'Ember Sprite', mana: 1, atk: 1, def: 2, desc: 'Roh api kecil tanpa efek spesial. Murah dan efisien untuk trade awal.' },
  { name: 'Shadow Imp', mana: 1, atk: 2, def: 1, desc: 'Iblis bayangan dengan ATK tinggi tapi sangat rapuh. Agresif untuk chip damage awal.' },
  { name: 'Plague Rat', mana: 1, atk: 1, def: 1, desc: 'Tikus wabah. Start of Turn: 1 poison damage ke hero musuh setiap giliran. Damage pasif konsisten.' },
  { name: 'Dark Ritualist', mana: 2, atk: 2, def: 2, desc: 'Pendeta gelap. Battlecry: Draw 1 kartu. Stat standar dengan bonus card advantage.' },
  { name: 'Spirit Walker', mana: 2, atk: 1, def: 4, desc: 'Pejalan roh. Battlecry: Heal 1 HP per minion di arena. Semakin banyak minion, semakin banyak heal!' },
  { name: 'Ironclad Knight', mana: 3, atk: 2, def: 5, desc: 'Ksatria berlapis besi. Shield: menyerap 2 damage pertama. Tank yang andal.' },
  // === RARE ===
  { name: 'Venom Fang', mana: 2, atk: 3, def: 1, desc: '🔵 RARE — Ular beracun. On Attack: +1 damage bonus ke hero musuh. ATK tinggi tapi rapuh.' },
  { name: 'Frost Mage', mana: 2, atk: 2, def: 3, desc: '🔵 RARE — Penyihir es. Battlecry: 1 damage. Combo: +1 extra damage ke hero.' },
  { name: 'Soul Leech', mana: 3, atk: 3, def: 3, desc: '🔵 RARE — Lintah jiwa. Lifesteal: setiap serangan menyembuhkan hero sejumlah damage yang diberikan.' },
  { name: 'Flame Warlock', mana: 3, atk: 4, def: 3, desc: '🔵 RARE — Penyihir api. Battlecry: 2 damage ke hero musuh. Stat agresif.' },
  { name: 'Shadow Dancer', mana: 3, atk: 2, def: 2, desc: '🔵 RARE — Penari bayangan. Combo: +2/+2 jika sudah main kartu lain, menjadi 4/4!' },
  { name: 'Void Cultist', mana: 3, atk: 2, def: 5, desc: '🔵 RARE — Pemuja kekosongan. End of Turn: 1 damage otomatis ke hero musuh.' },
  { name: 'Warcry Berserker', mana: 3, atk: 2, def: 4, desc: '🔵 RARE — Berserker perkasa. Battlecry: +1 ATK per minion di arena. Arena ramai = makin kuat!' },
  { name: 'Shadowstrike Assassin', mana: 4, atk: 5, def: 2, desc: '🔵 RARE — Pembunuh bayangan. Battlecry: 1 damage ke hero. ATK 5 tapi DEF rendah.' },
  { name: 'Thunder Elemental', mana: 4, atk: 3, def: 5, desc: '🔵 RARE — Elemental petir. Battlecry: 2 damage hero. Combo: +2 AoE ke semua minion musuh!' },
  // === EPIC ===
  { name: 'Phoenix Egg', mana: 2, atk: 0, def: 3, desc: '🟣 EPIC — Telur phoenix. Deathrattle: Summon Phoenix 3/3! Bait musuh menghancurkannya.' },
  { name: 'Corpse Raiser', mana: 4, atk: 3, def: 4, desc: '🟣 EPIC — Penyihir bangkai. Battlecry: Summon Skeleton 1/1. Dua tubuh harga satu.' },
  { name: 'Blood Knight', mana: 4, atk: 4, def: 3, desc: '🟣 EPIC — Ksatria darah. Lifesteal. Combo: Draw 1 kartu bonus. Serba bisa.' },
  { name: 'Mirror Mage', mana: 5, atk: 3, def: 3, desc: '🟣 EPIC — Penyihir cermin. Battlecry: Copy minion acak di arena. Target kuat = untung besar!' },
  { name: 'Divine Protector', mana: 5, atk: 3, def: 9, desc: '🟣 EPIC — Pelindung suci. Battlecry: Heal 5 HP + semua minion +1 ATK. Tank premium.' },
  { name: 'Abyssal Devourer', mana: 6, atk: 5, def: 6, desc: '🟣 EPIC — Pemangsa. Battlecry: Destroy 1 minion musuh acak langsung. Removal premium.' },
  // === LEGENDARY ===
  { name: 'Bronze Phoenix', mana: 3, atk: 2, def: 2, desc: '🌟 MINI-LEGENDARY — Deathrattle: Summon Skeleton 1/1. Legendary murah untuk tier rendah.' },
  { name: 'Mini Reaper', mana: 3, atk: 2, def: 2, desc: '🌟 MINI-LEGENDARY — Lifesteal. Penyerap jiwa kecil yang rakus.' },
  { name: 'Silver Shield', mana: 4, atk: 1, def: 4, desc: '🌟 MINI-LEGENDARY — Battlecry: +2 DEF ke friendly minion. Pelindung setia.' },
  { name: 'Archmage Solara', mana: 5, atk: 4, def: 5, desc: '⭐ LEGENDARY — Start of Turn: 2 damage ke hero musuh setiap giliran. Semakin lama hidup, semakin mematikan!' },
  { name: 'Chrono Weaver', mana: 6, atk: 3, def: 4, desc: '⭐ LEGENDARY — Battlecry: Draw 1 + Semua minion +1 ATK. Penenun waktu.' },
  { name: 'Void Empress', mana: 6, atk: 4, def: 7, desc: '⭐ LEGENDARY — Lifesteal + Start of Turn: Curi 1 ATK musuh + Draw 1. Ratu kekosongan.' },
  { name: 'Elder Dragon', mana: 7, atk: 8, def: 7, desc: '⭐ LEGENDARY — Naga legendaris 8/7. Battlecry: 3 damage ke hero. Late game powerhouse.' },
  { name: 'Celestial Arbiter', mana: 7, atk: 4, def: 8, desc: '⭐ LEGENDARY — Battlecry: 3 AoE + 3 hero dmg + Heal 5. Swiss army knife.' },
  { name: 'Doom Harbinger', mana: 8, atk: 6, def: 6, desc: '⭐ LEGENDARY — Battlecry: 5 damage ke SEMUA minion musuh. Board clear.' },
  { name: 'Shadow Sovereign', mana: 8, atk: 6, def: 6, desc: '⭐ LEGENDARY — Deathrattle: 5 AoE + 2 hero damage. Pangeran bayangan.' },
  { name: 'Abyss Monarch', mana: 8, atk: 7, def: 7, desc: '⭐ LEGENDARY — Battlecry: 4 AoE ke semua minion musuh. Bayar 5 HP hero sendiri.' },
  { name: 'Infernal Titan', mana: 9, atk: 8, def: 10, desc: '⭐ LEGENDARY — Battlecry: 4 hero dmg + Summon 2 Skeleton. Body terbesar 8/10.' },
  // === MYTHIC ===
  { name: 'Soul Reaper', mana: 7, atk: 6, def: 6, desc: '💎 MYTHIC — Lifesteal. Battlecry: 4 hero dmg + Heal 4. Pemulih sekaligus pembunuh.' },
  { name: 'Arcane Overlord', mana: 8, atk: 5, def: 9, desc: '💎 MYTHIC — Battlecry: Semua minion +2/+2 + Draw 1. Archmage supreme.' },
  { name: 'Eternal Phoenix', mana: 9, atk: 7, def: 7, desc: '💎 MYTHIC — Battlecry: Draw 2. Deathrattle: 3 AoE + Heal 10. Burung abadi.' },
  { name: 'Genesis Wyrm', mana: 9, atk: 8, def: 8, desc: '💎 MYTHIC — Battlecry: Summon 3 Skeleton. Start of Turn: Semua +1 ATK. Naga primordial.' },
  { name: 'World Ender', mana: 10, atk: 10, def: 10, desc: '💎 MYTHIC — Battlecry: 5 AoE + 5 hero dmg. 10/10 stats. The end of all things.' },
  { name: 'Void Devourer', mana: 10, atk: 9, def: 9, desc: '💎 MYTHIC — Battlecry: 8 AoE ke semua minion. Bayar 8 HP sendiri. Nuclear board clear.' },
];

const SPELL_CARDS = [
  // === COMMON ===
  { name: 'Arcane Spark', mana: 1, rarity: 'common', desc: 'Deal 2 damage ke hero musuh. Murah dan efisien untuk chip damage atau trigger combo.' },
  { name: 'Mystic Shield', mana: 2, rarity: 'common', desc: '+3 Defense ke 1 friendly minion. Lindungi minion penting dari serangan musuh.' },
  { name: 'Cursed Blade', mana: 2, rarity: 'common', desc: 'Deal 2 damage ke hero. Combo: +2 extra damage (total 4). Sangat kuat jika combo aktif!' },
  { name: 'Fireball', mana: 3, rarity: 'common', desc: 'Deal 4 damage ke hero musuh. Direct damage yang solid untuk semua situasi.' },
  // === RARE ===
  { name: 'Blood Pact', mana: 2, rarity: 'rare', desc: '🔵 RARE — 2 self damage, draw 2 kartu. Risiko kecil, card advantage besar.' },
  { name: 'Chain Lightning', mana: 3, rarity: 'rare', desc: '🔵 RARE — 1 AoE ke semua minion musuh + 2 damage ke hero. Serba guna.' },
  { name: 'Mana Aegis', mana: 3, rarity: 'rare', desc: '🔵 RARE — Semua minion +2 DEF + Heal hero 3 HP. Proteksi menyeluruh.' },
  { name: 'Mindbreak', mana: 4, rarity: 'rare', desc: '🔵 RARE — Deal 2 damage ke SEMUA minion musuh. AoE murni untuk board control.' },
  // === EPIC ===
  { name: 'War Drums', mana: 4, rarity: 'epic', desc: '🟣 EPIC — Buff semua minion +2 ATK / +1 DEF. Semakin banyak minion = makin dahsyat!' },
  { name: 'Inferno Wave', mana: 5, rarity: 'epic', desc: '🟣 EPIC — 3 damage ke hero + 3 AoE ke semua minion musuh. Damage + board control.' },
  { name: 'Soul Exchange', mana: 5, rarity: 'epic', desc: '🟣 EPIC — Kedua hero -5 HP, draw 2 kartu. Untung jika HP kamu lebih tinggi.' },
  // === LEGENDARY ===
  { name: 'Tiny Arcane', mana: 3, rarity: 'legendary', desc: '🌟 MINI-LEGENDARY — Deal 3 damage ke hero + Draw 1. Small but mighty.' },
  // === MYTHIC ===
  { name: 'Divine Wrath', mana: 6, rarity: 'mythic', desc: '💎 MYTHIC — Deal 8 damage ke hero + 3 self damage. Judgment from above. Nuke spell!' },
  { name: 'Oblivion', mana: 7, rarity: 'mythic', desc: '💎 MYTHIC — Deal 6 AoE + 4 hero damage. Total annihilation. Ultimate spell.' },
];

export default function MainMenu() {
  const [showGuide, setShowGuide] = useState(false);
  const [guideTab, setGuideTab] = useState(0);
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [showRanked, setShowRanked] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showRankedProfile, setShowRankedProfile] = useState(false);

  const unclaimedQuests = useQuestStore((s) => s.getUnclaimedCount());

  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Dev mode — only for the developer account
  const isDev = user?.email === 'haezlv@cardbattle.local' || user?.displayName?.toLowerCase() === 'haezlv' || profile?.username?.toLowerCase() === 'haezlv';

  // Fallback display info when profile hasn't loaded from Firestore yet
  const displayName = profile?.username || user?.displayName || 'Player';
  const displayAvatar = profile?.selectedAvatar || '🧙';
  const displayLevel = profile?.level || 1;
  const displayTitle = profile?.title || 'Pemula';
  const displayCoins = profile?.coins ?? 0;
  const displayExp = profile?.exp ?? 0;
  const displayWins = profile?.totalWins ?? 0;
  const displayLosses = profile?.totalLosses ?? 0;

  // Ranked info
  const rankedPoints = useRankedStore((s) => s.points);
  const rankedInfo = React.useMemo(() => calculateTierInfo(rankedPoints), [rankedPoints]);
  const tierData = TIER_GLOW[rankedInfo.tier.id] || TIER_GLOW.bronze;

  // Check daily quest reset on menu load
  React.useEffect(() => {
    useQuestStore.getState().checkDailyReset();
  }, []);

  const handleStart = () => {
    useRankedStore.getState().setRankedMode(false);
    useGameStore.getState().setAiDifficulty('normal');
    initializeGame();
  };

  const handleRankedStart = () => {
    setShowRanked(true);
  };

  // Ranked: check if Gold+ (needs draft pick)
  const needsDraft = ['gold', 'platinum', 'diamond', 'mythic', 'immortal'].includes(rankedInfo.tier.id);
  const rankedDifficulty = TIER_DIFFICULTY[rankedInfo.tier.id] || 'normal';
  const rankedDiffConfig = DIFFICULTY_CONFIG[rankedDifficulty];
  const rankedRP = TIER_RP[rankedInfo.tier.id] || TIER_RP.bronze;
  const tierConfig = TIER_CONFIG[rankedInfo.tier.id] || TIER_CONFIG.bronze;

  const handleRankedConfirm = () => {
    setShowRanked(false);
    useRankedStore.getState().setRankedMode(true);
    useGameStore.getState().setAiDifficulty(rankedDifficulty);

    if (needsDraft) {
      // Gold+ goes through draft pick first
      useDraftStore.getState().startDraft(rankedInfo.tier.id);
      useGameStore.getState().setGameStatus(GAME_STATUS.DRAFT);
    } else {
      // Bronze/Silver plays directly
      initializeGame();
    }
  };

  const handleMultiplayer = () => {
    useGameStore.getState().setGameStatus(GAME_STATUS.LOBBY);
  };

  return (
    <div className="main-menu">
      {/* Premium Profile Header Bar */}
      {user && (
        <div
          className="upb"
          style={{
            '--tier-c': tierData.c,
            '--tier-glow': tierData.glow,
            '--tier-glow-soft': tierData.soft,
          }}
        >
          {/* Main row: avatar · identity · exit */}
          <div className="upb__header">
            <button className="upb__avatar-btn" onClick={() => setShowProfile(true)} title="Pengaturan Profil">
              {displayAvatar}
            </button>

            <div className="upb__identity">
              <div className="upb__name-row">
                <span className="upb__name">{displayName}</span>
                <button className="upb__rank-chip" onClick={() => setShowRankedProfile(true)} title={`${rankedInfo.tier.name}${rankedInfo.division ? ` ${rankedInfo.division}` : ''} — ${rankedPoints}`}>
                  <span className="upb__rank-icon">{rankedInfo.tier.icon}</span>
                </button>
                {isDev && (
                  <button className="upb__dev-btn" onClick={() => setShowDevTools(true)} title="Dev Tools">
                    🔧
                  </button>
                )}
              </div>
              <span className="upb__sub">Lv.{displayLevel}</span>
            </div>

            <button className="upb__exit-btn" onClick={logout} title="Logout">🚪</button>
          </div>
        </div>
      )}

      <div className="main-menu__icon">⚔️</div>
      <h1 className="main-menu__title">Card Battle</h1>
      <p className="main-menu__subtitle">Dark Fantasy Duel</p>

      <div className="main-menu__buttons">
        <button className="main-menu__button" onClick={handleStart}>
          ⚔️ Classic
        </button>
        <button className="main-menu__button main-menu__button--ranked" onClick={handleRankedStart}>
          🏆 Ranked
        </button>
        <button className="main-menu__button main-menu__button--multi" onClick={handleMultiplayer}>
          🌐 Multiplayer
        </button>
      </div>

      {/* Secondary menu row */}
      <div className="main-menu__secondary-row">
        <button className="main-menu__secondary-btn" onClick={() => setShowGuide(true)}>
          📖 Cara Bermain
        </button>
        <button className="main-menu__secondary-btn" onClick={() => setShowQuests(!showQuests)}>
          📋 Quests {unclaimedQuests > 0 && <span className="main-menu__quest-badge">{unclaimedQuests}</span>}
        </button>
      </div>

      {/* Ranked Detail Panel */}
      {showRanked && (
        <div className="guide-overlay" onClick={() => setShowRanked(false)}>
          <div className="guide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <button className="guide__close" onClick={() => setShowRanked(false)}>✕</button>
            <h2 className="guide__title">🏆 Ranked Match</h2>
            <div className="guide__content">
              <RankedBadge />

              <div className="ranked-match-info">
                <div className="ranked-match-info__row">
                  <span className="ranked-match-info__label">❤️ HP</span>
                  <span className="ranked-match-info__value">{tierConfig.hp}</span>
                </div>
                <div className="ranked-match-info__row">
                  <span className="ranked-match-info__label">💎 Max Mana</span>
                  <span className="ranked-match-info__value">{tierConfig.maxMana}</span>
                </div>
                <div className="ranked-match-info__row">
                  <span className="ranked-match-info__label">🂴 Deck Size</span>
                  <span className="ranked-match-info__value">{tierConfig.deckSize} kartu</span>
                </div>
                <div className="ranked-match-info__row">
                  <span className="ranked-match-info__label">⚔️ Mana Range</span>
                  <span className="ranked-match-info__value">{tierConfig.manaRange[0]}–{tierConfig.manaRange[1]}</span>
                </div>
                <div className="ranked-match-info__row">
                  <span className="ranked-match-info__label">🎯 Difficulty</span>
                  <span className="ranked-match-info__value">{rankedDiffConfig.icon} {rankedDiffConfig.label}</span>
                </div>
                <div className="ranked-match-info__row">
                  <span className="ranked-match-info__label">🃏 Mode</span>
                  <span className="ranked-match-info__value">{needsDraft ? '📜 Draft Pick' : '⚔️ Standard'}</span>
                </div>
                <div className="ranked-match-info__row">
                  <span className="ranked-match-info__label">📈 Win</span>
                  <span className="ranked-match-info__value" style={{ color: '#22c55e' }}>+{rankedRP.win}</span>
                </div>
                <div className="ranked-match-info__row">
                  <span className="ranked-match-info__label">📉 Lose</span>
                  <span className="ranked-match-info__value" style={{ color: '#ef4444' }}>-{rankedRP.loss}</span>
                </div>
              </div>

              {needsDraft && (
                <p className="ranked-match-info__note">
                  📜 Gold ke atas menggunakan <strong>Draft Pick</strong> — pilih kartu sebelum bertarung!
                </p>
              )}

              <button
                className="main-menu__button main-menu__button--ranked"
                style={{ marginTop: '16px', width: '100%' }}
                onClick={handleRankedConfirm}
              >
                {needsDraft ? '📜 Mulai Draft Pick' : '⚔️ Mulai Ranked Match'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quest Panel */}
      {showQuests && (
        <div className="guide-overlay" onClick={() => setShowQuests(false)}>
          <div className="guide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <QuestPanel onClose={() => setShowQuests(false)} />
          </div>
        </div>
      )}

      {/* Profile Settings */}
      {showProfile && (
        <div className="guide-overlay" onClick={() => setShowProfile(false)}>
          <div className="guide" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <ProfileSettings onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}

      {/* Ranked Profile */}
      {showRankedProfile && (
        <div className="guide-overlay" onClick={() => setShowRankedProfile(false)}>
          <div className="guide" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 28px 70px rgba(0,0,0,0.75)', overflow: 'hidden' }}>
            <RankedProfile onClose={() => setShowRankedProfile(false)} />
          </div>
        </div>
      )}

      {/* Dev Tools */}
      {showDevTools && (
        <div className="guide-overlay" onClick={() => setShowDevTools(false)}>
          <div className="guide" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <DevTools onClose={() => setShowDevTools(false)} />
          </div>
        </div>
      )}

      <div className="main-menu__version" onClick={() => setShowPatchNotes(true)}>
        <span className="version__badge">BETA</span>
        <span className="version__text">{GAME_VERSION}</span>
      </div>

      <p className="main-menu__credit">Created by <strong>Haezlv</strong></p>

      {showPatchNotes && (
        <div className="guide-overlay" onClick={() => setShowPatchNotes(false)}>
          <div className="guide" onClick={(e) => e.stopPropagation()} style={{maxWidth: '520px'}}>
            <button className="guide__close" onClick={() => setShowPatchNotes(false)}>✕</button>
            <h2 className="guide__title">📋 Patch Notes</h2>
            <div className="guide__content">

              <section className="guide__section">
                <h3 className="patch__version-header">✨ v0.4.1-beta <span className="patch__date">22 Feb 2026</span></h3>
                <p style={{color:'var(--accent-cyan)', fontSize:'12px', marginBottom:'10px'}}>Rank Rebalance, Profile & UX Improvements</p>
                <ul className="guide__tips">
                  <li><strong>⚖️ Tier Rebalance Total</strong> — HP, Deck, dan Mana Range direconfigurasi ulang. Bronze mulai HP 60, Immortal HP 90, deck 30–40 kartu.</li>
                  <li><strong>🃏 Mana Range Mulai dari 1</strong> — Semua tier kini mulai mana dari 1. Semua rarity bisa muncul sejak Bronze — tier tinggi lebih chaotic karena ceiling mana lebih besar.</li>
                  <li><strong>🔒 Legendary Limit per Tier</strong> — Bronze/Silver maks 1 kartu Legendary class, Gold/Platinum/Diamond maks 2, Mythic/Immortal maks 3 per deck.</li>
                  <li><strong>📊 Derived Stats Profile</strong> — Statistik profil kini menampilkan Wins, Losses, Winrate % (dihitung otomatis), dan Best Streak.</li>
                  <li><strong>🔱 Immortal Prestige UI</strong> — Visual eksklusif di ProfileSettings & RankedProfile: emblem glow animasi, watermark crest, tint ungu pada judul rank.</li>
                  <li><strong>🏷️ Label Poin Dibersihkan</strong> — Tampilan poin rank tidak lagi memakai sufiks "RP".</li>
                </ul>
              </section>

              <section className="guide__section">
                <h3 className="patch__version-header">⚔️ v0.4.0-beta <span className="patch__date">21 Feb 2026</span></h3>
                <p style={{color:'var(--accent-cyan)', fontSize:'12px', marginBottom:'10px'}}>Tier System, Mythic & Balance Overhaul</p>
                <ul className="guide__tips">
                  <li><strong>🏰 7 Tier System</strong> — Bronze → Silver → Gold → Platinum → Diamond → Mythic → Immortal, masing-masing dengan HP, Mana, Deck Size, dan Card Pool yang berbeda</li>
                  <li><strong>💎 8 Kartu Mythic Baru</strong> — World Ender, Eternal Phoenix, Arcane Overlord, Soul Reaper, Genesis Wyrm, Oblivion, Divine Wrath, Void Devourer</li>
                  <li><strong>🌟 4 Mini Legendary Baru</strong> — Bronze Phoenix, Tiny Arcane, Silver Shield, Mini Reaper — kartu Legendary dengan mana rendah untuk tier awal</li>
                  <li><strong>👑 Rarity Mythic & Immortal</strong> — 2 tier rarity baru ditambahkan ke sistem kartu</li>
                  <li><strong>📊 Per-Tier Config</strong> — HP (20–45), Max Mana (5–15), Deck Size (20–30), Mana Range per tier</li>
                  <li><strong>📜 Draft Pick Gold+</strong> — Mode Draft hanya untuk tier Gold ke atas di Ranked</li>
                  <li><strong>🤖 7 Level AI</strong> — AI difficulty scaling dari Easy (Bronze) hingga Immortal</li>
                  <li><strong>📈 RP Scaling</strong> — Win/Loss RP berbeda per tier: Bronze (+30/-10) → Immortal (+12/-28)</li>
                  <li><strong>54 kartu total</strong> — 40 Minion + 14 Spell + 3 Token</li>
                </ul>
                <p style={{color:'var(--accent-yellow)', fontSize:'12px', marginTop:'8px', fontWeight:'bold'}}>⚖️ Balance Changes:</p>
                <ul className="guide__tips" style={{marginTop:'4px'}}>
                  <li><strong>🔻 NERF Fireball</strong> — Damage 5→4</li>
                  <li><strong>🔻 NERF Frost Mage</strong> — Combo damage +2→+1</li>
                  <li><strong>🔻 NERF Cursed Blade</strong> — Combo damage +3→+2</li>
                  <li><strong>🔻 NERF Doom Harbinger</strong> — AoE 6→5</li>
                  <li><strong>🔻 NERF Infernal Titan</strong> — Hero damage 5→4</li>
                  <li><strong>🎨 12 Icon Fix</strong> — Semua kartu sekarang punya icon emoji unik (tidak ada duplikat)</li>
                </ul>
              </section>

              <section className="guide__section">
                <h3 className="patch__version-header">🔧 v0.3.2-beta <span className="patch__date">21 Feb 2026</span></h3>
                <p style={{color:'var(--accent-cyan)', fontSize:'12px', marginBottom:'10px'}}>VFX, Mobile & Bugfix Patch</p>
                <ul className="guide__tips">
                  <li><strong>✨ 3-Phase VFX System</strong> — Efek visual baru: Windup → Impact → Resolve per kartu</li>
                  <li><strong>📱 Full Mobile Responsive</strong> — UI responsif untuk semua ukuran layar (mobile/tablet/desktop)</li>
                  <li><strong>📸 Camera Shake</strong> — Efek getaran kamera untuk kartu Epic & Legendary</li>
                  <li><strong>⚡ Adaptive Performance</strong> — VFX otomatis menyesuaikan performa device</li>
                  <li><strong>♿ Reduced Motion</strong> — Aksesibilitas: animasi minimal jika OS setting aktif</li>
                  <li><strong>🐛 FIX: Phoenix Egg</strong> — Sekarang summon Phoenix 3/2 (bukan Skeleton)</li>
                  <li><strong>🐛 FIX: Warcry Berserker</strong> — +ATK per minion sekarang berfungsi benar</li>
                  <li><strong>🐛 FIX: AI Combo</strong> — AI sekarang bisa mengaktifkan efek Combo</li>
                  <li><strong>🐛 FIX: Board Limit Visual</strong> — Kartu playable glow benar hingga 10 slot</li>
                  <li><strong>📝 Fix typo</strong> — Perbaikan teks di battle log & patch notes</li>
                </ul>
              </section>

              <section className="guide__section">
                <h3 className="patch__version-header">⚖️ v0.3.1-beta <span className="patch__date">21 Feb 2026</span></h3>
                <p style={{color:'var(--accent-cyan)', fontSize:'12px', marginBottom:'10px'}}>Balance Patch</p>
                <ul className="guide__tips">
                  <li><strong>🔻 NERF Chrono Weaver</strong> — Mana 5→6, Draw 2→1, Buff ATK +2→+1</li>
                  <li><strong>🔻 NERF Doom Harbinger</strong> — AoE 99→6 (tidak lagi instant kill)</li>
                  <li><strong>🔻 NERF Celestial Arbiter</strong> — ATK 5→4</li>
                  <li><strong>🔻 NERF Shadow Sovereign</strong> — AoE 99→5, Hero DMG 3→2</li>
                  <li><strong>🔺 BUFF Elder Dragon</strong> — ATK 7→8</li>
                  <li><strong>🔺 BUFF Thunder Elemental</strong> — Base DMG 1→2</li>
                  <li><strong>🔺 BUFF Divine Protector</strong> — DEF 8→9</li>
                  <li><strong>🔄 REWORK Blood Pact</strong> — 3 mana→2 mana, 3 self DMG→2, Draw 3→2</li>
                  <li><strong>✦ NEW Mana Aegis</strong> — 3 mana spell: +2 DEF semua minion + Heal 3</li>
                  <li><strong>✦ NEW Abyss Monarch</strong> — 8 mana 7/7: AoE 4 + Self DMG 5</li>
                  <li><strong>+2 kartu baru</strong> — Mana Aegis & Abyss Monarch (total 42)</li>
                </ul>
              </section>

              <section className="guide__section">
                <h3 className="patch__version-header">🏆 v0.3.0-beta <span className="patch__date">21 Feb 2026</span></h3>
                <p style={{color:'var(--accent-cyan)', fontSize:'12px', marginBottom:'10px'}}>Ranked, Draft & Legendary Update</p>
                <ul className="guide__tips">
                  <li><strong>🏆 Ranked Mode</strong> — Sistem tier Bronze → Immortal (RP scaling per tier)</li>
                  <li><strong>📜 Draft Mode</strong> — Pilih 1 dari 3 kartu, 15 kali, lalu battle!</li>
                  <li><strong>⭐ 5 Legendary Baru</strong> — Celestial Arbiter, Void Empress, Infernal Titan, Chrono Weaver, Shadow Sovereign</li>
                  <li><strong>📋 Daily Quest</strong> — 3 quest harian dengan reward Ranked Points</li>
                  <li><strong>42 kartu</strong> — Total kartu bertambah dari 35 ke 42</li>
                  <li><strong>9 Legendary</strong> — Kartu legendary limit 1 per deck</li>
                  <li><strong>Win Streak</strong> — Tracking streak dan best streak</li>
                  <li><strong>Ranked Profile</strong> — Lihat rank, tier ladder, dan statistik</li>
                </ul>
              </section>

              <section className="guide__section">
                <h3 className="patch__version-header">🔥 v0.2.0-beta <span className="patch__date">20 Feb 2026</span></h3>
                <p style={{color:'var(--accent-cyan)', fontSize:'12px', marginBottom:'10px'}}>Major Expansion Update</p>
                <ul className="guide__tips">
                  <li><strong>35 kartu</strong> — 15 kartu baru ditambahkan (dari 20)</li>
                  <li><strong>Arena 10 slot</strong> — Board diperlebar dari 5 ke 10 minion</li>
                  <li><strong>HP 60</strong> — HP awal dinaikkan dari 50 ke 60</li>
                  <li><strong>Hand size 9</strong> — Maks kartu di tangan dari 7 ke 9</li>
                  <li><strong>Sistem Combo</strong> — Bonus efek jika main beberapa kartu dalam 1 giliran</li>
                  <li><strong>Deathrattle</strong> — Efek aktif saat minion mati (Phoenix Egg, dll)</li>
                  <li><strong>End of Turn</strong> — Efek otomatis setiap akhir giliran (Void Cultist)</li>
                  <li><strong>Copy Minion</strong> — Mirror Mage bisa menduplikasi minion di arena</li>
                  <li><strong>Buff All</strong> — War Drums: buff semua minion +2/+1</li>
                  <li><strong>Doom Harbinger</strong> — Board clear ultimate, destroy semua minion musuh</li>
                  <li><strong>Guide lengkap</strong> — Cara Bermain dengan tab + deskripsi 35 kartu</li>
                </ul>
              </section>

              <section className="guide__section">
                <h3 className="patch__version-header">⚙️ v0.1.0 <span className="patch__date">Rilis Awal</span></h3>
                <ul className="guide__tips">
                  <li>20 kartu unik (Minion & Spell)</li>
                  <li>VS AI dengan strategi rule-based</li>
                  <li>Multiplayer online via Firebase</li>
                  <li>5 fase giliran (Start → Draw → Main → Attack → End)</li>
                  <li>Efek: Battlecry, Lifesteal, Shield, AoE, Summon, Start of Turn</li>
                  <li>Battle Log, Dark Fantasy theme, Card preview</li>
                  <li>Deploy ke Vercel</li>
                </ul>
              </section>

            </div>
          </div>
        </div>
      )}

      {showGuide && (
        <div className="guide-overlay" onClick={() => setShowGuide(false)}>
          <div className="guide" onClick={(e) => e.stopPropagation()}>
            <button className="guide__close" onClick={() => setShowGuide(false)}>✕</button>
            <h2 className="guide__title">📜 Cara Bermain</h2>

            {/* Tabs */}
            <div className="guide__tabs">
              {GUIDE_TABS.map((tab, i) => (
                <button
                  key={tab}
                  className={`guide__tab ${guideTab === i ? 'guide__tab--active' : ''}`}
                  onClick={() => setGuideTab(i)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="guide__content">

              {/* TAB 0: MEKANIK */}
              {guideTab === 0 && (
                <>
                  <section className="guide__section">
                    <h3>🎯 Tujuan Permainan</h3>
                    <p>Kurangi HP hero musuh menjadi <strong>0</strong> sebelum HP kamu habis duluan. Gunakan 54 kartu unik (6 rarity) dengan strategi yang tepat!</p>
                    <div className="guide__stats">
                      <div className="guide__stat-item">🃏 Kartu Awal: <strong>4 / 5</strong></div>
                      <div className="guide__stat-item">✋ Maks Tangan: <strong>9</strong></div>
                      <div className="guide__stat-item">🏟️ Maks Arena: <strong>10</strong></div>
                      <div className="guide__stat-item">📦 Total Kartu: <strong>54</strong></div>
                    </div>
                  </section>

                  <section className="guide__section">
                    <h3>🏰 Mode Permainan</h3>
                    <div className="guide__grid">
                      <div className="guide__item">
                        <span>⚔️ <strong>Classic</strong></span>
                        <p>Mode bebas melawan AI Normal. HP 60, Max Mana 10, semua kartu tersedia.</p>
                      </div>
                      <div className="guide__item">
                        <span>🏆 <strong>Ranked</strong></span>
                        <p>Mode kompetitif dengan 7 tier. HP, Mana, dan Deck berbeda per tier. Gold+ menggunakan Draft Pick.</p>
                      </div>
                      <div className="guide__item">
                        <span>🌐 <strong>Multiplayer</strong></span>
                        <p>Main melawan teman online via room code. HP 60, semua kartu tersedia.</p>
                      </div>
                    </div>
                  </section>

                  <section className="guide__section">
                    <h3>🏆 Sistem Ranked (7 Tier)</h3>
                    <div className="guide__effects-list">
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">🥉 Bronze</span>
                        <span className="guide__effect-desc">HP 60, Mana 7, Deck 30, Mana 1–7 | Leg. Limit 1 | AI Easy | +30/-10</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">🥈 Silver</span>
                        <span className="guide__effect-desc">HP 65, Mana 8, Deck 32, Mana 1–8 | Leg. Limit 1 | AI Normal | +25/-15</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">🥇 Gold</span>
                        <span className="guide__effect-desc">HP 70, Mana 10, Deck 33, Mana 1–10 | Leg. Limit 2 | AI Hard | Draft | +22/-18</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">💠 Platinum</span>
                        <span className="guide__effect-desc">HP 75, Mana 10, Deck 35, Mana 1–10 | Leg. Limit 2 | AI Expert | Draft | +20/-20</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">💎 Diamond</span>
                        <span className="guide__effect-desc">HP 80, Mana 12, Deck 36, Mana 1–12 | Leg. Limit 2 | AI Master | Draft | +18/-22</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">👑 Mythic</span>
                        <span className="guide__effect-desc">HP 85, Mana 15, Deck 38, Mana 1–15 | Leg. Limit 3 | AI Mythic | Draft | +15/-25</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">🔱 Immortal</span>
                        <span className="guide__effect-desc">HP 90, Mana 15, Deck 40, Mana 1–15 | Leg. Limit 3 | AI Immortal | Draft | +12/-28</span>
                      </div>
                    </div>
                  </section>

                  <section className="guide__section">
                    <h3>🔄 Fase Giliran</h3>
                    <div className="guide__phases">
                      <div className="guide__phase">
                        <span className="guide__phase-num">1</span>
                        <div>
                          <strong>MULAI GILIRAN</strong>
                          <p>Dapat +1 kristal mana (maks 10), mana terisi penuh, minion siap bertarung kembali.</p>
                        </div>
                      </div>
                      <div className="guide__phase">
                        <span className="guide__phase-num">2</span>
                        <div>
                          <strong>AMBIL KARTU</strong>
                          <p>Otomatis ambil 1 kartu. Tangan penuh (9)? Kartu hangus. Deck habis? Kena damage fatigue yang meningkat!</p>
                        </div>
                      </div>
                      <div className="guide__phase">
                        <span className="guide__phase-num">3</span>
                        <div>
                          <strong>FASE UTAMA</strong>
                          <p>Mainkan kartu dari tangan. Klik untuk memilih, klik lagi untuk memainkan. Minion masuk arena, spell langsung aktif.</p>
                        </div>
                      </div>
                      <div className="guide__phase">
                        <span className="guide__phase-num">4</span>
                        <div>
                          <strong>FASE SERANG</strong>
                          <p>Klik minion untuk menyerang hero musuh langsung. Minion baru tidak bisa langsung menyerang (summoning sickness).</p>
                        </div>
                      </div>
                      <div className="guide__phase">
                        <span className="guide__phase-num">5</span>
                        <div>
                          <strong>AKHIRI GILIRAN</strong>
                          <p>Efek End of Turn aktif, lalu giliran berpindah ke lawan.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="guide__section">
                    <h3>🃏 Jenis Kartu</h3>
                    <div className="guide__grid">
                      <div className="guide__item">
                        <span>⚔️ <strong>Minion</strong></span>
                        <p>Punya ATK & DEF. Tetap di arena, menyerang hero musuh setiap giliran. Mati jika DEF mencapai 0.</p>
                      </div>
                      <div className="guide__item">
                        <span>✦ <strong>Spell</strong></span>
                        <p>Efek instan (damage, heal, draw, AoE, buff). Langsung masuk graveyard setelah dipakai.</p>
                      </div>
                    </div>
                  </section>

                  <section className="guide__section">
                    <h3>✨ Efek & Mekanik Spesial</h3>
                    <div className="guide__effects-list">
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">⚔️ Battlecry</span>
                        <span className="guide__effect-desc">Efek aktif <strong>saat kartu dimainkan</strong>. Contoh: deal damage, heal, summon.</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">💚 Lifesteal</span>
                        <span className="guide__effect-desc">Saat menyerang, hero kamu <strong>sembuh sejumlah damage</strong> yang diberikan.</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">🛡️ Shield</span>
                        <span className="guide__effect-desc">Menyerap <strong>damage pertama</strong> yang diterima. Habis setelah 1x.</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">💥 AoE</span>
                        <span className="guide__effect-desc">Mengenai <strong>semua minion musuh</strong> sekaligus. Efektif lawan banyak minion.</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">👻 Summon</span>
                        <span className="guide__effect-desc">Memanggil <strong>minion tambahan</strong> ke arena (Skeleton 1/1, Revenant 3/3, dll).</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">🌅 Start of Turn</span>
                        <span className="guide__effect-desc">Efek otomatis <strong>setiap awal giliran</strong>. Contoh: Archmage deal 2 dmg tiap giliran.</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">🌙 End of Turn</span>
                        <span className="guide__effect-desc">Efek otomatis <strong>setiap akhir giliran</strong>. Contoh: Void Cultist deal 1 dmg.</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">💥 Combo</span>
                        <span className="guide__effect-desc">Bonus efek jika sudah <strong>main kartu lain</strong> di giliran yang sama sebelumnya.</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">💀 Deathrattle</span>
                        <span className="guide__effect-desc">Efek aktif saat <strong>minion mati</strong>. Contoh: Phoenix Egg → summon Phoenix 3/2.</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">🪞 Copy</span>
                        <span className="guide__effect-desc">Membuat <strong>salinan</strong> minion acak yang ada di arena kamu.</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">📈 Buff</span>
                        <span className="guide__effect-desc">Menambah <strong>ATK/DEF</strong> minion. Bisa per-minion atau buff semua sekaligus.</span>
                      </div>
                      <div className="guide__effect-row">
                        <span className="guide__effect-name">☠️ Destroy</span>
                        <span className="guide__effect-desc">Menghancurkan minion <strong>langsung</strong>, mengabaikan sisa DEF.</span>
                      </div>
                    </div>
                  </section>

                  <section className="guide__section">
                    <h3>🌐 Multiplayer</h3>
                    <p>Main melawan teman secara online!</p>
                    <div className="guide__phases">
                      <div className="guide__phase">
                        <span className="guide__phase-num">1</span>
                        <div><strong>BUAT ROOM</strong><p>Klik Multiplayer → Create Room. Dapat kode 6 huruf.</p></div>
                      </div>
                      <div className="guide__phase">
                        <span className="guide__phase-num">2</span>
                        <div><strong>BAGIKAN KODE</strong><p>Kirim kode ke teman via WA, chat, dll.</p></div>
                      </div>
                      <div className="guide__phase">
                        <span className="guide__phase-num">3</span>
                        <div><strong>GABUNG & MAIN</strong><p>Teman masukkan kode → Join Room. Game dimulai otomatis!</p></div>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* TAB 1: MINION CARDS */}
              {guideTab === 1 && (
                <section className="guide__section">
                  <h3>⚔️ Kartu Minion ({MINION_CARDS.length} Kartu)</h3>
                  <p style={{marginBottom: '12px'}}>Minion ditempatkan di arena dan bisa menyerang hero musuh setiap giliran.</p>
                  <div className="guide__card-list">
                    {MINION_CARDS.map((card, i) => (
                      <div key={i} className="guide__card-entry">
                        <div className="guide__card-header">
                          <span className="guide__card-name">{card.name}</span>
                          <span className="guide__card-stats">
                            <span className="guide__card-mana">{card.mana}💎</span>
                            <span className="guide__card-atk">{card.atk}⚔️</span>
                            <span className="guide__card-def">{card.def}🛡️</span>
                          </span>
                        </div>
                        <p className="guide__card-desc">{card.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* TAB 2: SPELL CARDS */}
              {guideTab === 2 && (
                <section className="guide__section">
                  <h3>✦ Kartu Spell ({SPELL_CARDS.length} Kartu)</h3>
                  <p style={{marginBottom: '12px'}}>Spell memberikan efek instan dan langsung masuk graveyard setelah dipakai.</p>
                  <div className="guide__card-list">
                    {SPELL_CARDS.map((card, i) => (
                      <div key={i} className="guide__card-entry guide__card-entry--spell">
                        <div className="guide__card-header">
                          <span className="guide__card-name">{card.name}</span>
                          <span className="guide__card-stats">
                            <span className="guide__card-mana">{card.mana}💎</span>
                          </span>
                        </div>
                        <p className="guide__card-desc">{card.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* TAB 3: STRATEGI */}
              {guideTab === 3 && (
                <>
                  <section className="guide__section">
                    <h3>🎯 Strategi per Fase Game</h3>
                    <div className="guide__phases">
                      <div className="guide__phase">
                        <span className="guide__phase-num" style={{background:'rgba(34,197,94,0.2)',color:'#22c55e'}}>⬤</span>
                        <div>
                          <strong>EARLY GAME (Mana 1-3)</strong>
                          <p>Bangun arena dengan minion murah. Dark Ritualist (draw 1), Plague Rat (poison/turn), dan Shadow Imp (2 ATK) sangat efisien. Simpan spell untuk combo.</p>
                        </div>
                      </div>
                      <div className="guide__phase">
                        <span className="guide__phase-num" style={{background:'rgba(245,158,11,0.2)',color:'#f59e0b'}}>⬤</span>
                        <div>
                          <strong>MID GAME (Mana 4-6)</strong>
                          <p>Aktifkan Combo: mainkan kartu murah dulu → lalu Frost Mage, Shadow Dancer, atau Thunder Elemental untuk bonus. Mana Aegis untuk bertahan. War Drums + arena penuh = buff masif!</p>
                        </div>
                      </div>
                      <div className="guide__phase">
                        <span className="guide__phase-num" style={{background:'rgba(239,68,68,0.2)',color:'#ef4444'}}>⬤</span>
                        <div>
                          <strong>LATE GAME (Mana 7+)</strong>
                          <p>Legendary & Mythic jadi game changer. Elder Dragon (8/7 + 3 dmg), Celestial Arbiter (3 AoE + Heal 5), atau World Ender (10/10 + 5 AoE + 5 hero). Mainkan kartu terkuat!</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="guide__section">
                    <h3>💥 Combo Chain Contoh</h3>
                    <div className="guide__combo-examples">
                      <div className="guide__combo-item">
                        <div className="guide__combo-chain">Arcane Spark (1💎) → Cursed Blade (2💎)</div>
                        <div className="guide__combo-result">= 2 + 2 + 2 combo = <strong>6 damage</strong> hanya 3 mana!</div>
                      </div>
                      <div className="guide__combo-item">
                        <div className="guide__combo-chain">Healing Wisp (1💎) → Shadow Dancer (3💎)</div>
                        <div className="guide__combo-result">= Heal 2 HP + Shadow Dancer menjadi <strong>4/4</strong>! Total 4 mana.</div>
                      </div>
                      <div className="guide__combo-item">
                        <div className="guide__combo-chain">Dark Ritualist (2💎) → Thunder Elemental (4💎)</div>
                        <div className="guide__combo-result">= Draw 1 + 2 hero dmg + <strong>2 AoE</strong> ke semua minion musuh! Total 6 mana.</div>
                      </div>
                      <div className="guide__combo-item">
                        <div className="guide__combo-chain">Arcane Spark (1💎) → Frost Mage (2💎)</div>
                        <div className="guide__combo-result">= 2 dmg + 1 dmg + 1 combo = <strong>4 damage ke hero</strong>! Total 3 mana.</div>
                      </div>
                      <div className="guide__combo-item">
                        <div className="guide__combo-chain">Blood Pact (2💎) → Blood Knight (4💎)</div>
                        <div className="guide__combo-result">= Draw 2 + Lifesteal 4/3 + <strong>Draw 1 combo</strong> = 3 kartu! Total 6 mana.</div>
                      </div>
                    </div>
                  </section>

                  <section className="guide__section">
                    <h3>⭐ Legendary Strategy</h3>
                    <ul className="guide__tips">
                      <li><strong>Archmage Solara (5💎):</strong> Lindungi dengan buff — 2 dmg per giliran makin lama makin mematikan.</li>
                      <li><strong>Void Empress (6💎):</strong> Lifesteal + curi ATK musuh tiap giliran. Semakin lama hidup, semakin dominan.</li>
                      <li><strong>Celestial Arbiter (7💎):</strong> Swiss army knife — 3 AoE + 3 hero dmg + Heal 5. Efektif di situasi apapun.</li>
                      <li><strong>Infernal Titan (9💎):</strong> Finisher — 4 hero dmg + 8/10 body + 2 Skeleton. Mainkan saat mana penuh.</li>
                      <li><strong>Abyss Monarch (8💎):</strong> 4 AoE tapi bayar 5 HP. Pakai saat HP kamu masih aman.</li>
                      <li><strong>Mini Legendary (3-4💎):</strong> Bronze Phoenix, Mini Reaper, Silver Shield — Legendary murah untuk tier rendah!</li>
                      <li><strong>Ingat:</strong> Maks 1 copy per Legendary/Mythic di deck — pilih yang cocok!</li>
                    </ul>
                  </section>

                  <section className="guide__section">
                    <h3>💎 Mythic Strategy</h3>
                    <ul className="guide__tips">
                      <li><strong>World Ender (10💎):</strong> 10/10 + 5 AoE + 5 hero. Ultimate finisher. Mainkan untuk mengakhiri pertandingan.</li>
                      <li><strong>Eternal Phoenix (9💎):</strong> Draw 2 masuk + Deathrattle 3 AoE + Heal 10. Value tak tertandingi!</li>
                      <li><strong>Genesis Wyrm (9💎):</strong> 3 Skeleton + Start of Turn buff. Semakin lama hidup, arena makin kuat.</li>
                      <li><strong>Arcane Overlord (8💎):</strong> +2/+2 ke semua minion. Mainkan saat arena sudah penuh.</li>
                      <li><strong>Void Devourer (10💎):</strong> 8 AoE nuclear tapi bayar 8 HP! Pakai saat benar-benar perlu board clear.</li>
                      <li><strong>Oblivion (7💎):</strong> 6 AoE + 4 hero. Spell mythic terkuat untuk clear + damage.</li>
                    </ul>
                  </section>

                  <section className="guide__section">
                    <h3>🏆 Tips Ranked</h3>
                    <ul className="guide__tips">
                      <li><strong>Bronze (HP 20):</strong> Game cepat! Kartu murah dan agresif lebih efektif. Jangan menunggu late game.</li>
                      <li><strong>Silver (HP 25):</strong> Sedikit lebih panjang. Mulai pertimbangkan card advantage.</li>
                      <li><strong>Gold+ (Draft Pick):</strong> Pilih kartu dengan sinergi yang baik. Prioritaskan late game bombs.</li>
                      <li><strong>Diamond+ (Mythic cards):</strong> Kartu Mythic tersedia! Rencanakan deck around kartu Mythic.</li>
                      <li><strong>RP Tips:</strong> Di tier rendah, menang banyak (+30). Di tier tinggi, kalah banyak (-28). Main konsisten!</li>
                    </ul>
                  </section>

                  <section className="guide__section">
                    <h3>🧠 Tips Pro</h3>
                    <ul className="guide__tips">
                      <li><strong>Phoenix Egg Bait:</strong> Pasang di arena, biarkan musuh hancurkan — dapat Phoenix 3/3 gratis!</li>
                      <li><strong>Board Flood + War Drums:</strong> Isi arena dengan minion murah, lalu buff semua sekaligus +2/+1.</li>
                      <li><strong>Void Cultist Stack:</strong> 2-3 Void Cultist = 2-3 damage otomatis setiap akhir giliran.</li>
                      <li><strong>Mirror Mage Value:</strong> Copy minion terkuat di arena — semakin kuat target, semakin untung.</li>
                      <li><strong>Soul Exchange Timing:</strong> Pakai saat HP kamu jauh lebih tinggi dari musuh.</li>
                      <li><strong>Doom Harbinger:</strong> 5 AoE bersihkan arena, lalu serang langsung dengan semua minion.</li>
                      <li><strong>Klik kanan</strong> pada kartu untuk preview lebih besar</li>
                      <li>Kartu <span style={{color:'#22c55e'}}>hijau</span> = bisa dimainkan, Minion <span style={{color:'#ef4444'}}>merah</span> = bisa menyerang</li>
                    </ul>
                  </section>
                </>
              )}

            </div>

            <button className="guide__start" onClick={() => { setShowGuide(false); handleStart(); }}>
              ⚔️ Mulai Pertarungan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
