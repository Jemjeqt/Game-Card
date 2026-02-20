import React from 'react';
import useDraftStore, { DRAFT_PICKS } from '../../stores/useDraftStore';
import useGameStore from '../../stores/useGameStore';
import { initializeGame } from '../../engine/turnEngine';
import { GAME_STATUS } from '../../data/constants';

export default function DraftScreen() {
  const {
    isDrafting,
    draftComplete,
    currentPick,
    choices,
    pickedCards,
    pickCard,
    resetDraft,
  } = useDraftStore();

  const handlePick = (cardId) => {
    pickCard(cardId);
  };

  const handleStartBattle = () => {
    initializeGame();
  };

  const handleCancel = () => {
    resetDraft();
    useGameStore.getState().setGameStatus(GAME_STATUS.MENU);
  };

  // Rarity color helper
  const rarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return '#f59e0b';
      case 'epic': return '#8b5cf6';
      case 'rare': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="draft-screen">
      <div className="draft-screen__header">
        <h1 className="draft-screen__title">📜 Draft Mode</h1>
        <p className="draft-screen__subtitle">
          {isDrafting
            ? `Pilih kartu ${currentPick + 1} dari ${DRAFT_PICKS}`
            : draftComplete
            ? 'Draft selesai! Siap bertarung!'
            : 'Pilih 1 dari 3 kartu sebanyak 15 kali'}
        </p>
        <div className="draft-screen__progress">
          <div className="draft-screen__progress-bar">
            <div
              className="draft-screen__progress-fill"
              style={{ width: `${(currentPick / DRAFT_PICKS) * 100}%` }}
            />
          </div>
          <span className="draft-screen__progress-text">{currentPick}/{DRAFT_PICKS}</span>
        </div>
      </div>

      {/* Draft choices */}
      {isDrafting && choices.length > 0 && (
        <div className="draft-screen__choices">
          {choices.map((card) => (
            <div
              key={card.id}
              className="draft-card"
              style={{ borderColor: rarityColor(card.rarity) }}
              onClick={() => handlePick(card.id)}
            >
              <div className="draft-card__mana">{card.manaCost}</div>
              <div className="draft-card__art">{card.icon}</div>
              <div className="draft-card__name">{card.name}</div>
              <div className="draft-card__rarity" style={{ color: rarityColor(card.rarity) }}>
                {card.rarity.toUpperCase()}
                {card.rarity === 'legendary' && ' ⭐'}
              </div>
              {card.type === 'minion' && (
                <div className="draft-card__stats">
                  <span className="draft-card__atk">{card.attack}⚔️</span>
                  <span className="draft-card__def">{card.defense}🛡️</span>
                </div>
              )}
              <div className="draft-card__desc">{card.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Draft complete — show deck summary */}
      {draftComplete && (
        <div className="draft-screen__summary">
          <h3 className="draft-screen__deck-title">Deck Kamu ({pickedCards.length} kartu)</h3>
          <div className="draft-screen__deck-list">
            {pickedCards
              .sort((a, b) => a.manaCost - b.manaCost)
              .map((card, i) => (
                <div
                  key={`${card.id}-${i}`}
                  className="draft-deck-item"
                  style={{ borderLeftColor: rarityColor(card.rarity) }}
                >
                  <span className="draft-deck-item__mana">{card.manaCost}💎</span>
                  <span className="draft-deck-item__icon">{card.icon}</span>
                  <span className="draft-deck-item__name">{card.name}</span>
                  {card.type === 'minion' && (
                    <span className="draft-deck-item__stats">{card.attack}/{card.defense}</span>
                  )}
                </div>
              ))}
          </div>
          <div className="draft-screen__actions">
            <button className="draft-screen__btn draft-screen__btn--primary" onClick={handleStartBattle}>
              ⚔️ Mulai Pertarungan
            </button>
            <button className="draft-screen__btn draft-screen__btn--secondary" onClick={handleCancel}>
              ← Kembali
            </button>
          </div>
        </div>
      )}

      {/* Cancel button during draft */}
      {isDrafting && (
        <button className="draft-screen__cancel" onClick={handleCancel}>
          ✕ Batalkan Draft
        </button>
      )}
    </div>
  );
}
