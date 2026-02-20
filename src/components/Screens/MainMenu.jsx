import React, { useState } from 'react';
import { initializeGame } from '../../engine/turnEngine';
import useGameStore from '../../stores/useGameStore';
import { GAME_STATUS } from '../../data/constants';

export default function MainMenu() {
  const [showGuide, setShowGuide] = useState(false);

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
        <p>20 kartu unik • Strategi berbasis giliran • Lawan AI</p>
        <p>Serangan langsung • Tema fantasi gelap</p>
      </div>

      {showGuide && (
        <div className="guide-overlay" onClick={() => setShowGuide(false)}>
          <div className="guide" onClick={(e) => e.stopPropagation()}>
            <button className="guide__close" onClick={() => setShowGuide(false)}>✕</button>
            <h2 className="guide__title">📜 Cara Bermain</h2>

            <div className="guide__content">
              <section className="guide__section">
                <h3>🎯 Tujuan</h3>
                <p>Kurangi HP musuh dari <strong>50 menjadi 0</strong> sebelum HP kamu habis duluan.</p>
              </section>

              <section className="guide__section">
                <h3>🔄 Fase Giliran</h3>
                <div className="guide__phases">
                  <div className="guide__phase">
                    <span className="guide__phase-num">1</span>
                    <div>
                      <strong>MULAI GILIRAN</strong>
                      <p>Dapat +1 kristal mana (maks 10), mana terisi penuh, minion siap bertarung.</p>
                    </div>
                  </div>
                  <div className="guide__phase">
                    <span className="guide__phase-num">2</span>
                    <div>
                      <strong>AMBIL KARTU</strong>
                      <p>Ambil 1 kartu. Tangan penuh (7)? Kartu hangus. Deck habis? Kena damage fatigue!</p>
                    </div>
                  </div>
                  <div className="guide__phase">
                    <span className="guide__phase-num">3</span>
                    <div>
                      <strong>FASE UTAMA</strong>
                      <p>Mainkan kartu dari tangan. Klik untuk memilih, klik lagi untuk memainkan. Minion masuk ke arena, spell langsung aktif.</p>
                    </div>
                  </div>
                  <div className="guide__phase">
                    <span className="guide__phase-num">4</span>
                    <div>
                      <strong>FASE SERANG</strong>
                      <p>Klik minion kamu untuk menyerang hero musuh secara langsung. Minion baru tidak bisa langsung menyerang (summoning sickness).</p>
                    </div>
                  </div>
                  <div className="guide__phase">
                    <span className="guide__phase-num">5</span>
                    <div>
                      <strong>AKHIRI GILIRAN</strong>
                      <p>Giliran berpindah ke lawan.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="guide__section">
                <h3>🃏 Jenis Kartu</h3>
                <div className="guide__grid">
                  <div className="guide__item">
                    <span>⚔️ <strong>Minion</strong></span>
                    <p>Punya ATK & DEF. Tetap di arena, menyerang setiap giliran. Mati jika DEF mencapai 0.</p>
                  </div>
                  <div className="guide__item">
                    <span>✦ <strong>Spell</strong></span>
                    <p>Efek instan (damage, heal, ambil kartu, AoE). Tidak tetap di arena.</p>
                  </div>
                </div>
              </section>

              <section className="guide__section">
                <h3>✨ Efek Spesial</h3>
                <div className="guide__grid">
                  <div className="guide__item"><strong>Battlecry</strong> — Efek saat kartu dimainkan</div>
                  <div className="guide__item"><strong>Lifesteal</strong> — Menyembuhkan hero sejumlah damage yang diberikan</div>
                  <div className="guide__item"><strong>Shield</strong> — Menyerap serangan pertama</div>
                  <div className="guide__item"><strong>AoE</strong> — Mengenai semua minion musuh</div>
                  <div className="guide__item"><strong>Summon</strong> — Memanggil minion tambahan</div>
                  <div className="guide__item"><strong>Start of Turn</strong> — Efek aktif setiap awal giliran</div>
                </div>
              </section>

              <section className="guide__section">
                <h3>💡 Tips</h3>
                <ul className="guide__tips">
                  <li><strong>Klik kanan</strong> pada kartu untuk melihat preview lebih besar</li>
                  <li>Kartu dengan <span style={{color:'#22c55e'}}>cahaya hijau</span> bisa dimainkan</li>
                  <li>Minion dengan <span style={{color:'#ef4444'}}>border merah saat di-hover</span> bisa menyerang</li>
                  <li>Mainkan kartu murah di awal, simpan kartu kuat untuk late game</li>
                  <li>Pantau <strong>Battle Log</strong> di kanan untuk melihat semua aksi</li>
                </ul>
              </section>

              <section className="guide__section">
                <h3>🌐 Multiplayer</h3>
                <p>Main melawan teman secara online via Firebase Realtime Database!</p>
                <div className="guide__phases">
                  <div className="guide__phase">
                    <span className="guide__phase-num">1</span>
                    <div>
                      <strong>BUAT ROOM</strong>
                      <p>Klik <strong>Multiplayer → Create Room</strong>. Kamu akan mendapat kode 6 huruf.</p>
                    </div>
                  </div>
                  <div className="guide__phase">
                    <span className="guide__phase-num">2</span>
                    <div>
                      <strong>BAGIKAN KODE</strong>
                      <p>Bagikan kode room ke temanmu (via chat, WA, dll).</p>
                    </div>
                  </div>
                  <div className="guide__phase">
                    <span className="guide__phase-num">3</span>
                    <div>
                      <strong>GABUNG ROOM</strong>
                      <p>Teman klik <strong>Multiplayer → masukkan kode → Join Room</strong>.</p>
                    </div>
                  </div>
                  <div className="guide__phase">
                    <span className="guide__phase-num">4</span>
                    <div>
                      <strong>BERTARUNG!</strong>
                      <p>Game otomatis dimulai. Host jalan duluan. Semua aksi di-sync real-time.</p>
                    </div>
                  </div>
                </div>
                <ul className="guide__tips" style={{marginTop: '10px'}}>
                  <li>Butuh setup <strong>Firebase</strong> (lihat <code>.env.example</code>)</li>
                  <li>Kedua pemain harus buka game di browser masing-masing</li>
                  <li>Tidak ada AI — giliran bergantian antar pemain</li>
                </ul>
              </section>
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
