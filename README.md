# ⚔️ Card Battle — Dark Fantasy Duel

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

- 🃏 **35 kartu unik** — Minion & Spell dengan berbagai efek spesial
- 🤖 **VS AI** — Lawan AI dengan strategi rule-based
- 🌐 **Multiplayer Online** — Main bareng teman via Firebase Realtime Database
- 🔄 **5 fase giliran** — Start Turn → Draw → Main → Attack → End Turn
- ⚔️ **Direct Attack** — Minion menyerang hero musuh langsung
- 🛡️ **Efek spesial** — Battlecry, Lifesteal, Shield, AoE, Summon, Start/End of Turn
- 💥 **Sistem Combo** — Bonus efek jika memainkan beberapa kartu dalam satu giliran
- 💀 **Deathrattle** — Efek aktif saat minion mati
- 📜 **Battle Log** — Riwayat semua aksi dalam pertarungan
- 🎨 **Dark Fantasy Theme** — UI gelap dengan animasi dan efek visual
- 🏟️ **Arena 10 slot** — Pasang hingga 10 minion di arena

---

## 🃏 Daftar Kartu (35 Kartu)

| Kartu                 | Tipe   | Mana | ATK | DEF | Efek                                            |
| --------------------- | ------ | :--: | :-: | :-: | ----------------------------------------------- |
| Healing Wisp          | Minion |  1   |  0  |  3  | Battlecry: Heal hero 2 HP                       |
| Ember Sprite          | Minion |  1   |  1  |  2  | On Attack: +1 damage ke hero                    |
| Venom Fang            | Minion |  2   |  3  |  1  | On Attack: +1 damage ke hero                    |
| Dark Ritualist        | Minion |  2   |  2  |  2  | Battlecry: Draw 1 kartu                         |
| Ironclad Knight       | Minion |  3   |  2  |  5  | Shield                                          |
| Soul Leech            | Minion |  3   |  3  |  3  | Lifesteal                                       |
| Corpse Raiser         | Minion |  4   |  3  |  3  | Battlecry: Summon 1/1 Skeleton                  |
| Shadowstrike Assassin | Minion |  4   |  5  |  2  | Battlecry: Deal 1 damage ke hero                |
| Archmage Solara       | Minion |  5   |  4  |  4  | Start of Turn: Deal 2 damage ke hero            |
| Divine Protector      | Minion |  5   |  3  |  6  | Battlecry: Heal hero 5 HP, semua minion +Shield |
| Abyssal Devourer      | Minion |  6   |  5  |  6  | Battlecry: Destroy 1 minion musuh acak          |
| Elder Dragon          | Minion |  7   |  7  |  7  | Battlecry: Deal 3 damage ke hero                |
| Frost Mage            | Minion |  3   |  2  |  3  | Battlecry: 2 dmg. Combo: +2 dmg ke hero         |
| Plague Rat            | Minion |  2   |  2  |  2  | Battlecry: Poison 1 dmg ke semua minion musuh   |
| Warcry Berserker      | Minion |  4   |  3  |  4  | Battlecry: +1 ATK per minion di arena            |
| Spirit Walker         | Minion |  4   |  2  |  5  | Battlecry: Heal 2 HP per minion di arena         |
| Mirror Mage           | Minion |  5   |  3  |  3  | Battlecry: Copy 1 minion acak di arena           |
| Thunder Elemental     | Minion |  5   |  4  |  4  | Battlecry: 1 AoE. Combo: +2 AoE ke minion musuh |
| Blood Knight          | Minion |  4   |  4  |  3  | Lifesteal. Combo: Draw 1 kartu                   |
| Shadow Dancer         | Minion |  3   |  2  |  3  | Combo: Gain +2/+2                                |
| Void Cultist          | Minion |  3   |  2  |  4  | End of Turn: Deal 1 damage ke hero musuh         |
| Cursed Blade          | Spell  |  2   |  —  |  —  | 3 dmg ke hero musuh. Combo: +2 dmg               |
| Chain Lightning       | Spell  |  4   |  —  |  —  | AoE 2 dmg + 2 dmg ke hero musuh                  |
| War Drums             | Spell  |  5   |  —  |  —  | Buff semua minion +2 ATK / +1 DEF                |
| Soul Exchange         | Spell  |  3   |  —  |  —  | Kedua hero -5 HP, draw 2 kartu                   |
| Phoenix Egg           | Minion |  2   |  0  |  3  | Deathrattle: Summon 3/2 Phoenix                   |
| Doom Harbinger        | Minion |  8   |  6  |  6  | Battlecry: Destroy SEMUA minion musuh             |
| Arcane Bolt           | Spell  |  1   |  —  |  —  | Deal 2 damage ke hero musuh                     |
| Shadow Strike         | Spell  |  2   |  —  |  —  | Deal 3 damage ke hero musuh                     |
| Blood Pact            | Spell  |  3   |  —  |  —  | Deal 3 damage ke hero sendiri, draw 3 kartu     |
| Inferno Wave          | Spell  |  5   |  —  |  —  | Deal 3 damage ke hero musuh & AoE 1 damage      |
| Holy Light            | Spell  |  2   |  —  |  —  | Heal hero 4 HP                                  |
| Dark Offering         | Spell  |  4   |  —  |  —  | Destroy minion sendiri acak, draw 3 kartu       |
| Mystic Shield         | Spell  |  3   |  —  |  —  | Beri Shield ke 1 minion                         |
| Resurrection          | Spell  |  6   |  —  |  —  | Summon 2 minion 3/3 Revenant                    |

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

### Tujuan

Kurangi HP musuh dari **60 menjadi 0** sebelum HP kamu habis!

### Fase Giliran

1. **Mulai Giliran** — Dapat +1 kristal mana (maks 10), mana terisi penuh
2. **Ambil Kartu** — Ambil 1 kartu dari deck
3. **Fase Utama** — Mainkan kartu dari tangan (butuh mana)
4. **Fase Serang** — Klik minion untuk menyerang hero musuh
5. **Akhiri Giliran** — Giliran berpindah ke lawan

### Multiplayer

1. Klik **Multiplayer → Create Room** → dapat kode 6 huruf
2. Bagikan kode ke teman
3. Teman klik **Multiplayer → masukkan kode → Join Room**
4. Game otomatis dimulai. Host jalan duluan!

---

## 🛠️ Tech Stack

| Teknologi                | Kegunaan                    |
| ------------------------ | --------------------------- |
| **React 19**             | UI framework                |
| **Vite 6**               | Build tool & dev server     |
| **Zustand**              | State management (5 stores) |
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
│   └── Screens/     # MainMenu, GameOver, MultiplayerLobby
├── data/            # Cards, constants, effects
├── engine/          # Turn engine, combat, effects, multiplayer
├── firebase/        # Config, room service, game sync
├── stores/          # Zustand stores
├── styles/          # CSS (theme, cards, board, screens, animations)
└── utils/           # Helpers (deck builder, shuffle, logger, dll)
```

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
