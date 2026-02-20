import React, { useState } from 'react';
import { initializeGame } from '../../engine/turnEngine';
import useGameStore from '../../stores/useGameStore';
import { GAME_STATUS, GAME_VERSION } from '../../data/constants';

const GUIDE_TABS = ['Mekanik', 'Minion', 'Spell', 'Strategi'];

const MINION_CARDS = [
  { name: 'Healing Wisp', mana: 1, atk: 0, def: 3, desc: 'Makhluk penyembuh lemah. Saat dimainkan, menyembuhkan hero 2 HP. Berguna di early game untuk bertahan.' },
  { name: 'Ember Sprite', mana: 1, atk: 1, def: 2, desc: 'Elemental api kecil. Setiap kali menyerang, memberikan +1 damage bonus ke hero musuh. Murah dan agresif.' },
  { name: 'Venom Fang', mana: 2, atk: 3, def: 1, desc: 'Ular beracun dengan serangan tinggi tapi rapuh. Setiap serangannya memberikan +1 damage bonus. Glass cannon.' },
  { name: 'Dark Ritualist', mana: 2, atk: 2, def: 2, desc: 'Pendeta gelap. Saat dimainkan, mengambil 1 kartu dari deck. Stat standar dengan bonus card advantage.' },
  { name: 'Plague Rat', mana: 2, atk: 2, def: 2, desc: 'Tikus pembawa wabah. Saat dimainkan, memberikan 1 damage ke SEMUA minion musuh. Mini AoE early game.' },
  { name: 'Phoenix Egg', mana: 2, atk: 0, def: 3, desc: 'Telur phoenix yang tidak bisa menyerang. Saat mati (Deathrattle), memanggil Phoenix 3/2! Bait musuh untuk menghancurkannya.' },
  { name: 'Ironclad Knight', mana: 3, atk: 2, def: 5, desc: 'Ksatria berlapis besi dengan Shield. Menyerap damage pertama, menjadikannya tank yang andal.' },
  { name: 'Soul Leech', mana: 3, atk: 3, def: 3, desc: 'Lintah jiwa dengan Lifesteal. Setiap serangan menyembuhkan hero kamu sejumlah damage yang diberikan.' },
  { name: 'Frost Mage', mana: 3, atk: 2, def: 3, desc: 'Penyihir es. Saat dimainkan, deal 2 damage ke hero musuh. Combo: +2 damage tambahan jika sudah main kartu lain giliran ini!' },
  { name: 'Shadow Dancer', mana: 3, atk: 2, def: 3, desc: 'Penari bayangan. Combo: Mendapat +2 ATK dan +2 DEF jika sudah main kartu lain giliran ini, menjadi 4/5!' },
  { name: 'Void Cultist', mana: 3, atk: 2, def: 4, desc: 'Pemuja kekosongan. End of Turn: Otomatis deal 1 damage ke hero musuh setiap akhir giliranmu. Damage pasif yang konsisten.' },
  { name: 'Corpse Raiser', mana: 4, atk: 3, def: 3, desc: 'Penyihir bangkai. Saat dimainkan, memanggil Skeleton 1/1 ke arena. Dua tubuh dengan harga satu.' },
  { name: 'Shadowstrike Assassin', mana: 4, atk: 5, def: 2, desc: 'Pembunuh bayangan dengan ATK tinggi tapi DEF rendah. Saat dimainkan, deal 1 damage ke hero musuh. Agresif!' },
  { name: 'Warcry Berserker', mana: 4, atk: 3, def: 4, desc: 'Berserker yang semakin kuat. Saat dimainkan, mendapat +1 ATK per minion yang ada di arena. Mainkan saat arena ramai!' },
  { name: 'Spirit Walker', mana: 4, atk: 2, def: 5, desc: 'Pejalan roh penyembuh. Saat dimainkan, menyembuhkan hero 2 HP per minion di arena. Semakin banyak minion, semakin banyak heal.' },
  { name: 'Blood Knight', mana: 4, atk: 4, def: 3, desc: 'Ksatria darah dengan Lifesteal. Combo: Draw 1 kartu bonus jika sudah main kartu lain giliran ini. Serba bisa.' },
  { name: 'Archmage Solara', mana: 5, atk: 4, def: 4, desc: 'Archmage legendaris. Start of Turn: Deal 2 damage ke hero musuh setiap awal giliranmu. Semakin lama hidup, semakin mematikan!' },
  { name: 'Divine Protector', mana: 5, atk: 3, def: 6, desc: 'Pelindung suci. Saat dimainkan, heal hero 5 HP DAN memberikan Shield ke semua minion di arena. Defensif ultimate.' },
  { name: 'Mirror Mage', mana: 5, atk: 3, def: 3, desc: 'Penyihir cermin. Saat dimainkan, meng-copy minion acak dari arena kamu. Semakin kuat minion yang di-copy, semakin menguntungkan!' },
  { name: 'Thunder Elemental', mana: 5, atk: 4, def: 4, desc: 'Elemental petir. Saat dimainkan, deal 1 AoE ke semua minion musuh. Combo: +2 AoE tambahan! Total 3 AoE jika combo aktif.' },
  { name: 'Abyssal Devourer', mana: 6, atk: 5, def: 6, desc: 'Pemangsa abyssal. Saat dimainkan, menghancurkan 1 minion musuh acak langsung. Removal premium.' },
  { name: 'Elder Dragon', mana: 7, atk: 7, def: 7, desc: 'Naga tua yang perkasa. Stat besar 7/7, saat dimainkan deal 3 damage ke hero musuh. Late game powerhouse.' },
  { name: 'Doom Harbinger', mana: 8, atk: 6, def: 6, desc: 'Pembawa kehancuran. Saat dimainkan, MENGHANCURKAN SEMUA minion musuh! Board clear ultimate dengan tubuh 6/6.' },
];

const SPELL_CARDS = [
  { name: 'Arcane Bolt', mana: 1, desc: 'Tembakan sihir sederhana. Deal 2 damage ke hero musuh. Murah dan efisien untuk chip damage.' },
  { name: 'Shadow Strike', mana: 2, desc: 'Serangan bayangan. Deal 3 damage ke hero musuh. Damage efisien untuk biayanya.' },
  { name: 'Holy Light', mana: 2, desc: 'Cahaya suci. Menyembuhkan hero kamu 4 HP. Penyembuhan efisien saat tertekan.' },
  { name: 'Cursed Blade', mana: 2, desc: 'Pedang terkutuk. Deal 3 damage ke hero musuh. Combo: +2 damage (total 5)! Sangat kuat jika combo aktif.' },
  { name: 'Blood Pact', mana: 3, desc: 'Perjanjian darah berisiko. Deal 3 damage ke hero sendiri, tapi draw 3 kartu! High risk, high reward.' },
  { name: 'Mystic Shield', mana: 3, desc: 'Perisai mistis. Memberikan Shield ke 1 minion pilihanmu. Lindungi minion penting dari 1x serangan.' },
  { name: 'Soul Exchange', mana: 3, desc: 'Pertukaran jiwa. Kedua hero -5 HP, lalu draw 2 kartu. Menguntungkan jika HP kamu lebih tinggi.' },
  { name: 'Chain Lightning', mana: 4, desc: 'Petir berantai. Deal 2 AoE ke semua minion musuh DAN 2 damage ke hero musuh. Damage serba guna.' },
  { name: 'Dark Offering', mana: 4, desc: 'Persembahan gelap. Hancurkan 1 minion sendiri acak, tapi draw 3 kartu. Korbankan minion lemah!' },
  { name: 'War Drums', mana: 5, desc: 'Genderang perang. Buff semua minion +2 ATK dan +1 DEF. Semakin banyak minion, semakin dahsyat!' },
  { name: 'Inferno Wave', mana: 5, desc: 'Gelombang api. Deal 3 damage ke hero musuh DAN 1 AoE ke semua minion musuh. Damage + board control.' },
  { name: 'Resurrection', mana: 6, desc: 'Kebangkitan. Memanggil 2 Revenant (3/3) ke arena. Board presence instan yang kuat.' },
];

export default function MainMenu() {
  const [showGuide, setShowGuide] = useState(false);
  const [guideTab, setGuideTab] = useState(0);
  const [showPatchNotes, setShowPatchNotes] = useState(false);

  const handleStart = () => {
    initializeGame();
  };

  const handleMultiplayer = () => {
    useGameStore.getState().setGameStatus(GAME_STATUS.LOBBY);
  };

  return (
    <div className="main-menu">
      <div className="main-menu__icon">⚔️</div>
      <h1 className="main-menu__title">Card Battle</h1>
      <p className="main-menu__subtitle">Dark Fantasy Duel</p>

      <div className="main-menu__buttons">
        <button className="main-menu__button" onClick={handleStart}>
          ⚔️ VS AI
        </button>
        <button className="main-menu__button main-menu__button--multi" onClick={handleMultiplayer}>
          🌐 Multiplayer
        </button>
        <button
          className="main-menu__button main-menu__button--secondary"
          onClick={() => setShowGuide(true)}
        >
          Cara Bermain
        </button>
      </div>

      <div className="main-menu__info">
        <p>35 kartu unik • Arena 10 slot • Combo & Deathrattle</p>
        <p>Serangan langsung • Tema fantasi gelap</p>
      </div>

      <div className="main-menu__version" onClick={() => setShowPatchNotes(true)}>
        <span className="version__badge">BETA</span>
        <span className="version__text">{GAME_VERSION}</span>
      </div>

      {showPatchNotes && (
        <div className="guide-overlay" onClick={() => setShowPatchNotes(false)}>
          <div className="guide" onClick={(e) => e.stopPropagation()} style={{maxWidth: '520px'}}>
            <button className="guide__close" onClick={() => setShowPatchNotes(false)}>✕</button>
            <h2 className="guide__title">📋 Patch Notes</h2>
            <div className="guide__content">

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
                    <p>Kurangi HP hero musuh dari <strong>60 menjadi 0</strong> sebelum HP kamu habis duluan. Gunakan 35 kartu unik dengan strategi yang tepat!</p>
                    <div className="guide__stats">
                      <div className="guide__stat-item">❤️ HP Awal: <strong>60</strong></div>
                      <div className="guide__stat-item">💎 Mana Maks: <strong>10</strong></div>
                      <div className="guide__stat-item">🃏 Kartu Awal: <strong>4 / 5</strong></div>
                      <div className="guide__stat-item">✋ Maks Tangan: <strong>9</strong></div>
                      <div className="guide__stat-item">🏟️ Maks Arena: <strong>10</strong></div>
                      <div className="guide__stat-item">📦 Total Kartu: <strong>35</strong></div>
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
                          <p>Bangun arena dengan minion murah. Dark Ritualist, Plague Rat, dan Ember Sprite sangat efisien. Jangan buang spell damage terlalu awal.</p>
                        </div>
                      </div>
                      <div className="guide__phase">
                        <span className="guide__phase-num" style={{background:'rgba(245,158,11,0.2)',color:'#f59e0b'}}>⬤</span>
                        <div>
                          <strong>MID GAME (Mana 4-6)</strong>
                          <p>Mainkan kartu dengan efek kuat. Aktifkan Combo dengan kartu murah dulu. War Drums + arena penuh = buff masif!</p>
                        </div>
                      </div>
                      <div className="guide__phase">
                        <span className="guide__phase-num" style={{background:'rgba(239,68,68,0.2)',color:'#ef4444'}}>⬤</span>
                        <div>
                          <strong>LATE GAME (Mana 7+)</strong>
                          <p>Elder Dragon dan Doom Harbinger bisa membalikkan keadaan. Simpan removal untuk ancaman besar musuh.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="guide__section">
                    <h3>💥 Combo Chain Contoh</h3>
                    <div className="guide__combo-examples">
                      <div className="guide__combo-item">
                        <div className="guide__combo-chain">Arcane Bolt (1💎) → Cursed Blade (2💎)</div>
                        <div className="guide__combo-result">= 2 + 5 damage = <strong>7 damage</strong> hanya 3 mana!</div>
                      </div>
                      <div className="guide__combo-item">
                        <div className="guide__combo-chain">Healing Wisp (1💎) → Shadow Dancer (3💎)</div>
                        <div className="guide__combo-result">= Heal 2 HP + Shadow Dancer menjadi <strong>4/5</strong>! Total 4 mana.</div>
                      </div>
                      <div className="guide__combo-item">
                        <div className="guide__combo-chain">Dark Ritualist (2💎) → Thunder Elemental (5💎)</div>
                        <div className="guide__combo-result">= Draw 1 + AoE <strong>3 damage</strong> ke semua minion musuh! Total 7 mana.</div>
                      </div>
                      <div className="guide__combo-item">
                        <div className="guide__combo-chain">Arcane Bolt (1💎) → Frost Mage (3💎)</div>
                        <div className="guide__combo-result">= 2 dmg + 2 dmg + 2 combo = <strong>6 damage ke hero</strong>! Total 4 mana.</div>
                      </div>
                    </div>
                  </section>

                  <section className="guide__section">
                    <h3>🧠 Tips Pro</h3>
                    <ul className="guide__tips">
                      <li><strong>Phoenix Egg Bait:</strong> Pasang di arena, biarkan musuh hancurkan — dapat Phoenix 3/2 gratis!</li>
                      <li><strong>Board Flood + War Drums:</strong> Isi arena dengan minion murah, lalu buff semua sekaligus +2/+1.</li>
                      <li><strong>Void Cultist Stack:</strong> 2-3 Void Cultist = 2-3 damage otomatis setiap akhir giliran tanpa menyerang.</li>
                      <li><strong>Mirror Mage Value:</strong> Copy minion terkuat di arena — semakin kuat target, semakin menguntungkan.</li>
                      <li><strong>Soul Exchange Timing:</strong> Pakai saat HP kamu jauh lebih tinggi dari musuh. -5/-5 HP + draw 2!</li>
                      <li><strong>Doom Harbinger Finisher:</strong> Bersihkan seluruh arena musuh, lalu serang dengan semua minion.</li>
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
