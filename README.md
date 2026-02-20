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
| Warcry Berserker      | Minion |  4   |  3  |  4  | Battlecry: +1 ATK per minion di arena           |
| Spirit Walker         | Minion |  4   |  2  |  5  | Battlecry: Heal 2 HP per minion di arena        |
| Mirror Mage           | Minion |  5   |  3  |  3  | Battlecry: Copy 1 minion acak di arena          |
| Thunder Elemental     | Minion |  5   |  4  |  4  | Battlecry: 1 AoE. Combo: +2 AoE ke minion musuh |
| Blood Knight          | Minion |  4   |  4  |  3  | Lifesteal. Combo: Draw 1 kartu                  |
| Shadow Dancer         | Minion |  3   |  2  |  3  | Combo: Gain +2/+2                               |
| Void Cultist          | Minion |  3   |  2  |  4  | End of Turn: Deal 1 damage ke hero musuh        |
| Cursed Blade          | Spell  |  2   |  —  |  —  | 3 dmg ke hero musuh. Combo: +2 dmg              |
| Chain Lightning       | Spell  |  4   |  —  |  —  | AoE 2 dmg + 2 dmg ke hero musuh                 |
| War Drums             | Spell  |  5   |  —  |  —  | Buff semua minion +2 ATK / +1 DEF               |
| Soul Exchange         | Spell  |  3   |  —  |  —  | Kedua hero -5 HP, draw 2 kartu                  |
| Phoenix Egg           | Minion |  2   |  0  |  3  | Deathrattle: Summon 3/2 Phoenix                 |
| Doom Harbinger        | Minion |  8   |  6  |  6  | Battlecry: Destroy SEMUA minion musuh           |
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

### 🎯 Tujuan

Kurangi HP hero musuh dari **60 menjadi 0** sebelum HP hero kamu habis duluan! Gunakan kombinasi kartu minion dan spell secara strategis untuk meraih kemenangan.

### 📊 Statistik Awal

| Parameter         | Nilai |
| ----------------- | :---: |
| HP Awal           |  60   |
| Mana Maks         |  10   |
| Kartu Awal (Kamu) |   4   |
| Kartu Awal (AI)   |   5   |
| Maks Kartu Tangan |   9   |
| Maks Minion Arena |  10   |
| Total Kartu Unik  |  35   |

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

#### Minion (23 Kartu)

|  #  | Kartu                     | Mana | ATK/DEF | Deskripsi Lengkap                                                                                                                          |
| :-: | ------------------------- | :--: | :-----: | ------------------------------------------------------------------------------------------------------------------------------------------ |
|  1  | **Healing Wisp**          |  1   |   0/3   | Makhluk penyembuh lemah. Saat dimainkan, menyembuhkan hero 2 HP. Berguna di early game untuk bertahan.                                     |
|  2  | **Ember Sprite**          |  1   |   1/2   | Elemental api kecil. Setiap kali menyerang, memberikan +1 damage bonus ke hero musuh. Murah dan agresif.                                   |
|  3  | **Venom Fang**            |  2   |   3/1   | Ular beracun dengan serangan tinggi tapi rapuh. Setiap serangannya memberikan +1 damage bonus. Glass cannon.                               |
|  4  | **Dark Ritualist**        |  2   |   2/2   | Pendeta gelap. Saat dimainkan, mengambil 1 kartu dari deck. Stat standar dengan bonus card advantage.                                      |
|  5  | **Plague Rat**            |  2   |   2/2   | Tikus pembawa wabah. Saat dimainkan, memberikan 1 damage ke **semua** minion musuh. Mini AoE early game.                                   |
|  6  | **Phoenix Egg**           |  2   |   0/3   | Telur phoenix yang tidak bisa menyerang. Saat mati (**Deathrattle**), memanggil Phoenix 3/2 yang kuat! Bait musuh untuk menghancurkannya.  |
|  7  | **Ironclad Knight**       |  3   |   2/5   | Ksatria berlapis besi dengan **Shield**. Menyerap damage pertama, menjadikannya tank yang andal.                                           |
|  8  | **Soul Leech**            |  3   |   3/3   | Lintah jiwa dengan **Lifesteal**. Setiap serangan menyembuhkan hero kamu sejumlah damage yang diberikan.                                   |
|  9  | **Frost Mage**            |  3   |   2/3   | Penyihir es. Saat dimainkan, deal 2 damage ke hero musuh. **Combo**: +2 damage tambahan jika sudah main kartu lain giliran ini!            |
| 10  | **Shadow Dancer**         |  3   |   2/3   | Penari bayangan. **Combo**: Mendapat +2 ATK dan +2 DEF jika sudah main kartu lain giliran ini, menjadi 4/5!                                |
| 11  | **Void Cultist**          |  3   |   2/4   | Pemuja kekosongan. **End of Turn**: Otomatis deal 1 damage ke hero musuh setiap akhir giliranmu. Damage pasif yang konsisten.              |
| 12  | **Corpse Raiser**         |  4   |   3/3   | Penyihir bangkai. Saat dimainkan, memanggil Skeleton 1/1 ke arena. Dua tubuh dengan harga satu.                                            |
| 13  | **Shadowstrike Assassin** |  4   |   5/2   | Pembunuh bayangan dengan ATK tinggi tapi DEF rendah. Saat dimainkan, deal 1 damage ke hero musuh. Agresif!                                 |
| 14  | **Warcry Berserker**      |  4   |   3/4   | Berserker yang semakin kuat dengan pasukan. Saat dimainkan, mendapat **+1 ATK per minion** yang ada di arena. Mainkan saat arena ramai!    |
| 15  | **Spirit Walker**         |  4   |   2/5   | Pejalan roh penyembuh. Saat dimainkan, menyembuhkan hero **2 HP per minion** di arena. Semakin banyak minion, semakin banyak heal.         |
| 16  | **Blood Knight**          |  4   |   4/3   | Ksatria darah dengan **Lifesteal**. **Combo**: Draw 1 kartu bonus jika sudah main kartu lain giliran ini. Serba bisa.                      |
| 17  | **Archmage Solara**       |  5   |   4/4   | Archmage legendaris. **Start of Turn**: Deal 2 damage ke hero musuh **setiap awal giliranmu**. Semakin lama hidup, semakin mematikan!      |
| 18  | **Divine Protector**      |  5   |   3/6   | Pelindung suci. Saat dimainkan, heal hero 5 HP DAN memberikan **Shield** ke semua minion di arena. Kartu defensif ultimate.                |
| 19  | **Mirror Mage**           |  5   |   3/3   | Penyihir cermin. Saat dimainkan, **meng-copy** minion acak dari arena kamu. Semakin kuat minion yang di-copy, semakin menguntungkan!       |
| 20  | **Thunder Elemental**     |  5   |   4/4   | Elemental petir. Saat dimainkan, deal 1 damage AoE ke semua minion musuh. **Combo**: +2 AoE damage tambahan! Total 3 AoE jika combo aktif. |
| 21  | **Abyssal Devourer**      |  6   |   5/6   | Pemangsa abyssal. Saat dimainkan, **menghancurkan 1 minion musuh acak** langsung. Removal premium.                                         |
| 22  | **Elder Dragon**          |  7   |   7/7   | Naga tua yang perkasa. Stat besar 7/7, saat dimainkan deal 3 damage ke hero musuh. Late game powerhouse.                                   |
| 23  | **Doom Harbinger**        |  8   |   6/6   | Pembawa kehancuran. Saat dimainkan, **MENGHANCURKAN SEMUA minion musuh**! Board clear ultimate dengan tubuh 6/6.                           |

#### Spell (12 Kartu)

|  #  | Kartu               | Mana | Deskripsi Lengkap                                                                                                                 |
| :-: | ------------------- | :--: | --------------------------------------------------------------------------------------------------------------------------------- |
|  1  | **Arcane Bolt**     |  1   | Tembakan sihir sederhana. Deal **2 damage** ke hero musuh. Murah dan efisien untuk chip damage.                                   |
|  2  | **Shadow Strike**   |  2   | Serangan bayangan. Deal **3 damage** ke hero musuh. Damage efisien untuk biayanya.                                                |
|  3  | **Holy Light**      |  2   | Cahaya suci. Menyembuhkan hero kamu **4 HP**. Penyembuhan efisien saat tertekan.                                                  |
|  4  | **Cursed Blade**    |  2   | Pedang terkutuk. Deal **3 damage** ke hero musuh. **Combo**: +2 damage tambahan (total 5)! Sangat kuat jika diaktifkan combo.     |
|  5  | **Blood Pact**      |  3   | Perjanjian darah berisiko. Deal **3 damage ke hero sendiri**, tapi draw **3 kartu**! High risk, high reward card advantage.       |
|  6  | **Mystic Shield**   |  3   | Perisai mistis. Memberikan **Shield** ke 1 minion pilihanmu. Lindungi minion penting dari 1x serangan.                            |
|  7  | **Soul Exchange**   |  3   | Pertukaran jiwa. **Kedua hero -5 HP**, lalu draw **2 kartu**. Menguntungkan jika HP kamu lebih tinggi dari musuh.                 |
|  8  | **Chain Lightning** |  4   | Petir berantai. Deal **2 damage AoE** ke semua minion musuh DAN **2 damage** ke hero musuh. Damage serba guna.                    |
|  9  | **Dark Offering**   |  4   | Persembahan gelap. **Menghancurkan 1 minion sendiri acak**, tapi draw **3 kartu**. Korbankan minion lemah untuk keuntungan besar. |
| 10  | **War Drums**       |  5   | Genderang perang. **Buff semua minion** di arena: **+2 ATK** dan **+1 DEF**. Semakin banyak minion, semakin dahsyat!              |
| 11  | **Inferno Wave**    |  5   | Gelombang api. Deal **3 damage** ke hero musuh DAN **1 damage AoE** ke semua minion musuh. Damage + board control.                |
| 12  | **Resurrection**    |  6   | Kebangkitan. Memanggil **2 Revenant (3/3)** ke arena. Membangun board presence instan yang kuat.                                  |

### 💡 Strategi & Tips

- **Early Game (Mana 1-3):** Mainkan minion murah untuk membangun arena. Kartu seperti Dark Ritualist dan Plague Rat sangat efisien.
- **Mid Game (Mana 4-6):** Mulai mainkan kartu dengan efek kuat. Aktifkan **combo** dengan memainkan kartu murah dulu, lalu kartu combo.
- **Late Game (Mana 7+):** Kartu mahal seperti Elder Dragon dan Doom Harbinger bisa membalikkan keadaan.
- **Combo Chain:** Mainkan Arcane Bolt (1 mana) → Cursed Blade (2 mana) = 2 + 5 = 7 damage hanya dengan 3 mana!
- **Deathrattle Bait:** Mainkan Phoenix Egg dan biarkan musuh menghancurkannya — kamu dapat Phoenix 3/2 gratis!
- **Board Flood + Buff:** Isi arena dengan minion murah, lalu pakai War Drums untuk buff semua sekaligus.
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
