# ⚔️ Card Battle — Dark Fantasy Duel

![Version](https://img.shields.io/badge/Version-v0.4.0--beta-blueviolet)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-orange?logo=firebase)
![Zustand](https://img.shields.io/badge/Zustand-State%20Management-brown)

Game kartu strategi berbasis giliran dengan tema dark fantasy. Mainkan kartu minion dan spell untuk mengalahkan lawan — bisa melawan AI atau teman secara online!

🌐 **Live Demo:** [dist-seven-mocha.vercel.app](https://dist-seven-mocha.vercel.app)

---

## 📸 Screenshots

|                      Menu Utama                       |                      Pertarungan                       |
| :---------------------------------------------------: | :----------------------------------------------------: |
| Menu dengan opsi VS AI, Multiplayer, dan Cara Bermain | Arena pertarungan dengan kartu, minion, dan battle log |

---

## ✨ Fitur

- 🃏 **54 kartu unik** — 40 Minion & 14 Spell dengan 6 tier rarity (Common → Mythic)
- 🏰 **7 Tier Ranked** — Bronze → Silver → Gold → Platinum → Diamond → Mythic → Immortal
- 📊 **Per-Tier Config** — HP, Max Mana, Deck Size, dan Card Pool berbeda per tier
- 📜 **Draft Mode** — Pilih 1 dari 3 kartu di Gold+ Ranked, jumlah pick = deck size tier
- 📋 **Daily Quest** — 3 quest harian dengan reward Ranked Points
- 🤖 **7 Level AI** — Easy (Bronze) → Immortal, scaling difficulty per tier
- 🌐 **Multiplayer Online** — Main bareng teman via Firebase Realtime Database
- 🔄 **5 fase giliran** — Start Turn → Draw → Main → Attack → End Turn
- ⚔️ **Direct Attack** — Minion menyerang hero musuh langsung
- 🛡️ **Efek spesial** — Battlecry, Lifesteal, Shield, AoE, Summon, Start/End of Turn
- 💥 **Sistem Combo** — Bonus efek jika memainkan beberapa kartu dalam satu giliran
- 💀 **Deathrattle** — Efek aktif saat minion mati
- 📜 **Battle Log** — Riwayat semua aksi dalam pertarungan
- 🎨 **Dark Fantasy Theme** — UI gelap dengan animasi dan efek visual
- 🏟️ **Arena 10 slot** — Pasang hingga 10 minion di arena
- ⭐ **Legendary/Mythic Limit** — Maks 1 copy per Legendary/Mythic card di deck

---

## 🃏 Daftar Kartu (54 Kartu)

### Minion (40 Kartu)

#### Common (7 Minion)

| Kartu           | Mana | ATK | DEF | Efek                                      |
| --------------- | :--: | :-: | :-: | ----------------------------------------- |
| Healing Wisp    |  1   |  0  |  3  | Battlecry: Heal hero 2 HP                 |
| Ember Sprite    |  1   |  1  |  2  | —                                         |
| Shadow Imp      |  1   |  2  |  1  | —                                         |
| Plague Rat      |  1   |  1  |  1  | Start of Turn: 1 poison dmg ke hero musuh |
| Dark Ritualist  |  2   |  2  |  2  | Battlecry: Draw 1 kartu                   |
| Spirit Walker   |  2   |  1  |  4  | Battlecry: Heal 1 HP per minion di arena  |
| Ironclad Knight |  3   |  2  |  5  | Shield (absorbs 2 damage)                 |

#### Rare (9 Minion)

| Kartu                 | Mana | ATK | DEF | Efek                                            |
| --------------------- | :--: | :-: | :-: | ----------------------------------------------- |
| Venom Fang            |  2   |  3  |  1  | On Attack: +1 damage ke hero                    |
| Frost Mage            |  2   |  2  |  3  | Battlecry: 1 dmg. Combo: +1 dmg ke hero         |
| Soul Leech            |  3   |  3  |  3  | Lifesteal                                       |
| Flame Warlock         |  3   |  4  |  3  | Battlecry: Deal 2 damage ke hero                |
| Shadow Dancer         |  3   |  2  |  2  | Combo: Gain +2/+2                               |
| Void Cultist          |  3   |  2  |  5  | End of Turn: Deal 1 damage ke hero musuh        |
| Warcry Berserker      |  3   |  2  |  4  | Battlecry: +1 ATK per minion di arena           |
| Shadowstrike Assassin |  4   |  5  |  2  | Battlecry: Deal 1 damage ke hero                |
| Thunder Elemental     |  4   |  3  |  5  | Battlecry: 2 dmg. Combo: +2 AoE ke minion musuh |

#### Epic (6 Minion)

| Kartu            | Mana | ATK | DEF | Efek                                       |
| ---------------- | :--: | :-: | :-: | ------------------------------------------ |
| Phoenix Egg      |  2   |  0  |  3  | Deathrattle: Summon 3/3 Phoenix            |
| Corpse Raiser    |  4   |  3  |  4  | Battlecry: Summon 1/1 Skeleton             |
| Blood Knight     |  4   |  4  |  3  | Lifesteal. Combo: Draw 1 kartu             |
| Mirror Mage      |  5   |  3  |  3  | Battlecry: Copy 1 minion acak di arena     |
| Divine Protector |  5   |  3  |  9  | Battlecry: Heal 5 HP + semua minion +1 ATK |
| Abyssal Devourer |  6   |  5  |  6  | Battlecry: Destroy 1 minion musuh acak     |

#### Legendary (12 Minion)

| Kartu                | Mana | ATK | DEF | Efek                                        |
| -------------------- | :--: | :-: | :-: | ------------------------------------------- |
| Bronze Phoenix 🌟    |  3   |  2  |  2  | Deathrattle: Summon 1/1 Skeleton            |
| Mini Reaper 🌟       |  3   |  2  |  2  | Lifesteal                                   |
| Silver Shield 🌟     |  4   |  1  |  4  | Battlecry: Friendly minion +2 DEF           |
| Archmage Solara ⭐   |  5   |  4  |  5  | Start of Turn: Deal 2 damage ke hero        |
| Chrono Weaver ⭐     |  6   |  3  |  4  | Battlecry: Draw 1 + semua minion +1 ATK     |
| Void Empress ⭐      |  6   |  4  |  7  | Lifesteal + Steal 1 ATK/turn + Draw 1       |
| Elder Dragon ⭐      |  7   |  8  |  7  | Battlecry: Deal 3 damage ke hero            |
| Celestial Arbiter ⭐ |  7   |  4  |  8  | Battlecry: 3 AoE + 3 hero dmg + Heal 5      |
| Doom Harbinger ⭐    |  8   |  6  |  6  | Battlecry: Deal 5 AoE ke semua minion musuh |
| Shadow Sovereign ⭐  |  8   |  6  |  6  | Deathrattle: 5 AoE + 2 hero damage          |
| Abyss Monarch ⭐     |  8   |  7  |  7  | Battlecry: 4 AoE + 5 self damage            |
| Infernal Titan ⭐    |  9   |  8  | 10  | Battlecry: 4 hero dmg + Summon 2 Skeleton   |

#### Mythic (6 Minion)

| Kartu              | Mana | ATK | DEF | Efek                                                 |
| ------------------ | :--: | :-: | :-: | ---------------------------------------------------- |
| Soul Reaper 💎     |  7   |  6  |  6  | Lifesteal. Battlecry: 4 hero dmg + Heal 4            |
| Arcane Overlord 💎 |  8   |  5  |  9  | Battlecry: Semua minion +2/+2 + Draw 1               |
| Eternal Phoenix 💎 |  9   |  7  |  7  | Battlecry: Draw 2. Deathrattle: 3 AoE + Heal 10      |
| Genesis Wyrm 💎    |  9   |  8  |  8  | Battlecry: Summon 3 Skeleton. Start: All +1 ATK      |
| World Ender 💎     |  10  | 10  | 10  | Battlecry: 5 AoE + 5 hero dmg. The end of all things |
| Void Devourer 💎   |  10  |  9  |  9  | Battlecry: 8 AoE ke semua minion + 8 self damage     |

### Spell (14 Kartu)

| Kartu           | Mana | Rarity    | Efek                                     |
| --------------- | :--: | --------- | ---------------------------------------- |
| Arcane Spark    |  1   | Common    | Deal 2 damage ke hero musuh              |
| Mystic Shield   |  2   | Common    | +3 Defense ke 1 minion                   |
| Cursed Blade    |  2   | Common    | 2 dmg ke hero. Combo: +2 dmg             |
| Fireball        |  3   | Common    | Deal 4 damage ke hero musuh              |
| Blood Pact      |  2   | Rare      | 2 self damage, draw 2 kartu              |
| Chain Lightning |  3   | Rare      | 1 AoE + 2 dmg ke hero musuh              |
| Mana Aegis      |  3   | Rare      | Semua minion +2 DEF + Heal hero 3 HP     |
| Mindbreak       |  4   | Rare      | Deal 2 AoE ke semua minion musuh         |
| War Drums       |  4   | Epic      | Buff semua minion +2 ATK / +1 DEF        |
| Inferno Wave    |  5   | Epic      | 3 dmg hero + 3 AoE ke semua minion musuh |
| Soul Exchange   |  5   | Epic      | Kedua hero -5 HP, draw 2 kartu           |
| Tiny Arcane 🌟  |  3   | Legendary | 3 dmg ke hero + Draw 1 kartu             |
| Divine Wrath 💎 |  6   | Mythic    | 8 dmg ke hero + 3 self damage            |
| Oblivion 💎     |  7   | Mythic    | 6 AoE + 4 dmg ke hero musuh              |

---

## 🚀 Cara Install

### Prasyarat

- [Node.js](https://nodejs.org/) v18+
- Akun [Firebase](https://firebase.google.com/) (untuk multiplayer)

### Langkah

```bash
# Clone repo
git clone https://github.com/Jemjeqt/Game-Card.git
cd Game-Card

# Install dependencies
npm install

# Setup Firebase (untuk multiplayer)
cp .env.example .env
# Edit .env dan masukkan Firebase config kamu

# Jalankan development server
npm run dev
```

### Setup Firebase (Multiplayer)

1. Buat project di [Firebase Console](https://console.firebase.google.com/)
2. Aktifkan **Realtime Database**
3. Aktifkan **Authentication → Anonymous**
4. Copy config ke file `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Set rules Realtime Database:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

---

## 🎮 Cara Bermain

### 🎯 Tujuan

Kurangi HP hero musuh menjadi **0** sebelum HP hero kamu habis duluan! Gunakan kombinasi kartu minion dan spell secara strategis untuk meraih kemenangan.

### 🏰 Mode Permainan

| Mode           | HP  | Mana Maks | Deck Size | Keterangan                         |
| -------------- | :-: | :-------: | :-------: | ---------------------------------- |
| ⚔️ Classic     | 60  |    10     |    30     | VS AI Normal, semua kartu tersedia |
| 🏆 Ranked      | \*  |    \*     |    \*     | Per-tier config, lihat tabel tier  |
| 🌐 Multiplayer | 60  |    10     |    30     | VS teman online via room code      |

### 🏆 Sistem Ranked (7 Tier)

| Tier        | HP  | Max Mana | Deck | Mana Range | AI       | Mode     | RP Win/Loss |
| ----------- | :-: | :------: | :--: | :--------: | -------- | -------- | :---------: |
| 🥉 Bronze   | 20  |    5     |  20  |    1-3     | Easy     | Standard |  +30 / -10  |
| 🥈 Silver   | 25  |    6     |  20  |    1-4     | Normal   | Standard |  +25 / -15  |
| 🥇 Gold     | 30  |    8     |  25  |    1-5     | Hard     | Draft    |  +22 / -18  |
| 💠 Platinum | 35  |    10    |  25  |    2-6     | Expert   | Draft    |  +20 / -20  |
| 💎 Diamond  | 40  |    12    |  30  |    2-7     | Master   | Draft    |  +18 / -22  |
| 👑 Mythic   | 45  |    15    |  30  |    3-10    | Mythic   | Draft    |  +15 / -25  |
| 🔱 Immortal | 45  |    15    |  30  |    3-10    | Immortal | Draft    |  +12 / -28  |

### 📊 Statistik Dasar (Classic)

| Parameter         | Nilai |
| ----------------- | :---: |
| HP Awal           |  60   |
| Mana Maks         |  10   |
| Kartu Awal (Kamu) |   4   |
| Kartu Awal (AI)   |   5   |
| Maks Kartu Tangan |   9   |
| Maks Minion Arena |  10   |
| Total Kartu Unik  |  54   |

### 🔄 Fase Giliran

Setiap giliran terdiri dari **5 fase** berurutan:

1. **⏳ MULAI GILIRAN** — Kamu mendapat +1 kristal mana (maks 10). Semua mana terisi penuh. Minion yang sudah ada siap bertarung kembali.
2. **🃏 AMBIL KARTU** — Otomatis mengambil 1 kartu dari deck. Jika tangan sudah penuh (9 kartu), kartu yang diambil hangus. Jika deck habis, kamu terkena **damage fatigue** yang meningkat setiap giliran!
3. **🎴 FASE UTAMA** — Mainkan kartu dari tangan ke arena. Klik kartu untuk memilih, klik lagi untuk memainkan. Setiap kartu membutuhkan **mana** sesuai biayanya. Minion masuk arena, spell langsung aktif.
4. **⚔️ FASE SERANG** — Klik minion kamu yang sudah siap untuk menyerang **hero musuh secara langsung**. Minion yang baru dipanggil giliran ini tidak bisa menyerang (**summoning sickness**).
5. **🏁 AKHIRI GILIRAN** — Efek **End of Turn** aktif, lalu giliran berpindah ke lawan.

### 🃏 Jenis Kartu

**⚔️ Minion (Kartu Makhluk)**

- Punya nilai **ATK** (serangan) dan **DEF** (pertahanan)
- Ditempatkan di arena dan bertahan di sana sampai DEF-nya mencapai 0
- Bisa menyerang hero musuh langsung setiap giliran (kecuali baru dipanggil)

**✦ Spell (Kartu Sihir)**

- Efek instan — langsung aktif saat dimainkan
- Tidak tetap di arena, langsung masuk graveyard setelah dipakai
- Bisa berupa damage, heal, AoE, buff, draw kartu, dll

### ✨ Mekanik & Efek Spesial

| Efek                     | Penjelasan                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Battlecry**            | Efek yang aktif **saat kartu dimainkan** ke arena. Contoh: deal damage, heal, summon minion, dll.                                                                   |
| **Lifesteal**            | Saat minion menyerang hero musuh, hero kamu **sembuh sejumlah damage** yang diberikan. Sangat berguna saat HP rendah.                                               |
| **Shield**               | Minion menyerap **damage pertama** yang diterima. Shield habis setelah 1x menyerap.                                                                                 |
| **AoE (Area of Effect)** | Mengenai **semua minion musuh** sekaligus. Sangat efektif melawan banyak minion kecil.                                                                              |
| **Summon**               | Memanggil minion tambahan ke arena (seperti Skeleton 1/1 atau Revenant 3/3).                                                                                        |
| **Start of Turn**        | Efek yang aktif secara otomatis **setiap awal giliran** pemilik minion. Contoh: Archmage Solara deal 2 damage setiap giliran.                                       |
| **💥 Combo**             | Bonus efek yang aktif jika kamu sudah **memainkan kartu lain** di giliran yang sama sebelumnya. Mainkan kartu murah dulu untuk mengaktifkan combo kartu berikutnya! |
| **💀 Deathrattle**       | Efek yang aktif saat **minion mati** (DEF mencapai 0 atau di-destroy). Contoh: Phoenix Egg memanggil Phoenix 3/2 saat mati.                                         |
| **🌙 End of Turn**       | Efek yang aktif secara otomatis **setiap akhir giliran** pemilik minion. Contoh: Void Cultist deal 1 damage ke hero musuh.                                          |
| **🪞 Copy**              | Membuat **salinan** dari minion acak yang sudah ada di arena kamu.                                                                                                  |
| **💉 Heal Per Minion**   | Menyembuhkan hero sejumlah HP **dikalikan jumlah minion** yang ada di arena. Semakin banyak minion, semakin banyak heal!                                            |
| **📈 Buff Per Minion**   | Menambah ATK diri sendiri **per jumlah minion** yang ada di arena. Semakin ramai arena, semakin kuat!                                                               |
| **🛡️ Buff All**          | Menguatkan **semua minion** di arena sekaligus (+ATK dan/atau +DEF).                                                                                                |
| **☠️ Destroy**           | Menghancurkan minion musuh secara langsung, mengabaikan DEF.                                                                                                        |

### 🃏 Deskripsi Semua Kartu

_(Lihat tabel kartu lengkap di bagian Daftar Kartu di atas)_

### 💡 Strategi & Tips

- **Early Game (Mana 1-3):** Mainkan minion murah untuk membangun arena. Kartu seperti Dark Ritualist dan Plague Rat sangat efisien.
- **Mid Game (Mana 4-6):** Mulai mainkan kartu dengan efek kuat. Aktifkan **combo** dengan memainkan kartu murah dulu, lalu kartu combo.
- **Late Game (Mana 7+):** Kartu mahal seperti Elder Dragon dan Doom Harbinger bisa membalikkan keadaan.
- **Combo Chain:** Mainkan Arcane Spark (1 mana) → Cursed Blade (2 mana) = 2 + 5 = 7 damage hanya dengan 3 mana!
- **Deathrattle Bait:** Mainkan Phoenix Egg dan biarkan musuh menghancurkannya — kamu dapat Phoenix 3/3 gratis!
- **Board Flood + Buff:** Isi arena dengan minion murah, lalu pakai War Drums untuk buff semua sekaligus.
- **Legendary Strategy:** Legendary limit 1 per deck — pilih yang paling cocok dengan strategi kamu.
- **Klik kanan** pada kartu untuk melihat preview lebih besar.
- Kartu dengan **cahaya hijau** di tangan bisa dimainkan.
- Minion dengan **border merah saat di-hover** bisa menyerang.

### 🌐 Multiplayer

1. Klik **Multiplayer → Create Room** → dapat kode 6 huruf
2. Bagikan kode ke teman (via WA, chat, dll)
3. Teman klik **Multiplayer → masukkan kode → Join Room**
4. Game otomatis dimulai. Host jalan duluan!
5. Semua aksi di-sync real-time via Firebase

---

## 🛠️ Tech Stack

| Teknologi                | Kegunaan                    |
| ------------------------ | --------------------------- |
| **React 19**             | UI framework                |
| **Vite 6**               | Build tool & dev server     |
| **Zustand**              | State management (8 stores) |
| **Firebase Realtime DB** | Multiplayer sync            |
| **Vercel**               | Hosting & deployment        |

### Struktur Project

```
src/
├── ai/              # AI controller & strategy
├── components/      # React components
│   ├── Board/       # GameBoard, PlayerField, OpponentField
│   ├── Card/        # Card, CardBack, CardPreview
│   ├── Hand/        # PlayerHand, OpponentHand
│   ├── HUD/         # HPBar, ManaBar, TurnButton, dll
│   ├── BattleLog/   # Battle log panel
│   ├── Effects/     # TurnBanner
│   └── Screens/     # MainMenu, GameOver, MultiplayerLobby, DraftScreen
├── data/            # Cards (54), constants, effects
├── engine/          # Turn engine, combat, effects, multiplayer
├── firebase/        # Config, room service, game sync
├── stores/          # Zustand stores
├── styles/          # CSS (theme, cards, board, screens, animations)
└── utils/           # Helpers (deck builder, shuffle, logger, dll)
```

---

## 📋 Patch Notes

### v0.4.0-beta — 21 Februari 2026

**Tier System, Mythic & Balance Overhaul**

- 🏰 **7 Tier System** — Bronze → Silver → Gold → Platinum → Diamond → Mythic → Immortal, masing-masing dengan HP, Mana, Deck Size, dan Card Pool berbeda
- 💎 **8 Kartu Mythic Baru** — World Ender, Eternal Phoenix, Arcane Overlord, Soul Reaper, Genesis Wyrm, Oblivion, Divine Wrath, Void Devourer
- 🌟 **4 Mini Legendary Baru** — Bronze Phoenix, Tiny Arcane, Silver Shield, Mini Reaper (Legendary murah untuk tier awal)
- 👑 **Rarity Mythic & Immortal** — 2 tier rarity baru ditambahkan ke sistem kartu
- 📊 **Per-Tier Config** — HP (20–45), Max Mana (5–15), Deck Size (20–30), Mana Range per tier
- 📜 **Draft Pick Gold+** — Mode Draft hanya untuk tier Gold ke atas di Ranked
- 🤖 **7 Level AI** — Easy → Normal → Hard → Expert → Master → Mythic → Immortal
- 📈 **RP Scaling** — Win/Loss RP berbeda per tier: Bronze (+30/-10) hingga Immortal (+12/-28)
- 🔻 **NERF Fireball** — Damage 5→4
- 🔻 **NERF Frost Mage** — Combo damage +2→+1
- 🔻 **NERF Cursed Blade** — Combo damage +3→+2
- 🔻 **NERF Doom Harbinger** — AoE 6→5
- 🔻 **NERF Infernal Titan** — Hero damage 5→4
- 🎨 **12 Icon Fix** — Semua kartu memiliki icon emoji unik (tidak ada duplikat)
- 📖 **Guide Update** — Cara Bermain diperbarui dengan info tier, Mythic cards, dan strategi baru
- **54 kartu total** — 40 Minion + 14 Spell + 3 Token

### v0.3.2-beta — 21 Februari 2026

**VFX, Mobile & Bugfix Patch**

- ✨ **3-Phase VFX System** — Efek visual baru: Windup → Impact → Resolve per kartu
- 📱 **Full Mobile Responsive** — UI responsif untuk semua ukuran layar (mobile/tablet/desktop)
- 📸 **Camera Shake** — Efek getaran kamera untuk kartu Epic & Legendary
- ⚡ **Adaptive Performance** — VFX otomatis menyesuaikan performa device
- ♿ **Reduced Motion** — Aksesibilitas: animasi minimal jika OS setting aktif
- 🐛 **FIX: Phoenix Egg** — Sekarang summon Phoenix 3/2 (bukan Skeleton 1/1)
- 🐛 **FIX: Warcry Berserker** — +ATK per minion sekarang berfungsi benar
- 🐛 **FIX: AI Combo** — AI sekarang bisa mengaktifkan efek Combo
- 🐛 **FIX: Board Limit Visual** — Kartu playable glow benar hingga 10 slot
- 📝 **Fix typo** — Perbaikan teks di battle log & patch notes

### v0.3.1-beta — 21 Februari 2026

**Balance Patch**

- 🔻 **NERF Chrono Weaver** — Mana 5→6, Draw 2→1, Buff ATK +2→+1
- 🔻 **NERF Doom Harbinger** — AoE 99→6 (tidak lagi instant kill)
- 🔻 **NERF Celestial Arbiter** — ATK 5→4
- 🔻 **NERF Shadow Sovereign** — AoE 99→5, Hero DMG 3→2
- 🔺 **BUFF Elder Dragon** — ATK 7→8
- 🔺 **BUFF Thunder Elemental** — Base DMG 1→2
- 🔺 **BUFF Divine Protector** — DEF 8→9
- 🔄 **REWORK Blood Pact** — 3 mana→2 mana, 3 self DMG→2, Draw 3→2
- ✦ **NEW Mana Aegis** — 3 mana spell: +2 DEF semua minion + Heal 3
- ✦ **NEW Abyss Monarch** — 8 mana 7/7: AoE 4 + Self DMG 5
- +2 kartu baru — Mana Aegis & Abyss Monarch (total 42)

### v0.3.0-beta — 21 Februari 2026

**Ranked, Draft & Legendary Update**

- 🏆 **Ranked Mode** — Sistem tier Bronze → Mythic (+25 menang, -15 kalah)
- 📜 **Draft Mode** — Pilih 1 dari 3 kartu, 15 kali, lalu battle!
- ⭐ **5 Legendary Baru** — Celestial Arbiter, Void Empress, Infernal Titan, Chrono Weaver, Shadow Sovereign
- 📋 **Daily Quest** — 3 quest harian dengan reward Ranked Points
- 42 kartu — Total kartu bertambah dari 35 ke 42
- 9 Legendary — Kartu legendary limit 1 per deck
- Win Streak — Tracking streak dan best streak
- Ranked Profile — Lihat rank, tier ladder, dan statistik

### v0.2.0-beta — 20 Februari 2026

**Major Expansion Update**

- 🃏 **35 Kartu** — Dari 20 menjadi 35 kartu unik (minion + spell)
- 🏟️ **Arena 10 Slot** — Board diperbesar dari 5 menjadi 10 slot per pemain
- ❤️ **HP 60** — HP awal ditingkatkan dari 50 menjadi 60
- 🖐️ **Hand Size 9** — Maksimal kartu di tangan dari 7 menjadi 9
- 🔥 **Combo System** — Kartu kedua+ dalam satu turn mendapat bonus efek combo
- 💀 **Deathrattle** — Efek khusus saat minion mati (damage, summon, heal, dll)
- 🔄 **End of Turn Effects** — Efek otomatis di akhir turn (regen, poison, buff)
- 📋 **Copy Minion** — Spell yang menduplikasi minion di arena
- 💪 **Buff All** — Spell yang meng-buff semua minion sekaligus
- 👹 **Doom Harbinger** — Minion legendary dengan Deathrattle AoE
- 📖 **Panduan Lengkap** — Guide in-game dengan tab (Mekanik/Minion/Spell/Strategi) + deskripsi semua kartu
- 🏷️ **Version Badge** — Badge versi di menu + Patch Notes overlay

### v0.1.0 — Rilis Awal

**Initial Release**

- 🃏 20 kartu unik (minion + spell)
- 🤖 Mode VS AI dengan strategi scoring
- 🌐 Mode Multiplayer via Firebase Realtime Database
- 🎮 5 fase permainan: Draw → Mana → Main → Combat → End
- ⚡ Efek kartu: Battlecry, Lifesteal, Divine Shield, Taunt, AoE, Summon, Start of Turn
- 📜 Battle Log dengan fitur minimize
- 🎨 Dark Fantasy theme
- 🚀 Deploy ke Vercel

---

## 📝 Scripts

```bash
npm run dev      # Jalankan dev server
npm run build    # Build untuk production
npm run preview  # Preview build result
```

---

## 📄 Lisensi

MIT License

---

<p align="center">
  Created by <strong>Haezlv</strong>
</p>
