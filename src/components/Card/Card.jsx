import React from 'react';

export default function Card({
  card,
  size = 'hand', // 'hand' | 'board' | 'preview'
  isPlayable = false,
  isSelected = false,
  isExhausted = false,
  canAttack = false,
  isTargetable = false,
  isEntering = false,
  onClick,
  onRightClick,
  onMouseEnter,
  onMouseLeave,
}) {
  if (!card) return null;

  const isSpell = card.type === 'spell';
  const isBuffed =
    card.currentAttack > card.baseAttack || card.currentDefense > card.baseDefense;
  const isDamaged = card.currentDefense < card.baseDefense;

  const classNames = [
    'card',
    `card--${size}`,
    `card--${card.rarity}`,
    isSpell && 'card--spell',
    isPlayable && 'card--playable',
    isSelected && 'card--selected',
    isExhausted && 'card--exhausted',
    canAttack && !isExhausted && 'card--can-attack',
    isTargetable && 'card--targeting',
    isEntering && 'card--entering',
  ]
    .filter(Boolean)
    .join(' ');

  const handleContextMenu = (e) => {
    e.preventDefault();
    onRightClick?.(card);
  };

  return (
    <div
      className={classNames}
      onClick={() => onClick?.(card)}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => onMouseEnter?.(card)}
      onMouseLeave={() => onMouseLeave?.(card)}
    >
      {/* Mana Cost */}
      <div className="card__mana-cost">{card.manaCost}</div>

      {/* Shield indicator */}
      {card.shield > 0 && (
        <div className="card__shield">🛡{card.shield}</div>
      )}

      {/* Art */}
      <div className="card__art">{card.icon}</div>

      {/* Name */}
      <div className="card__name">{card.name}</div>

      {/* Keywords */}
      {card.keywords && card.keywords.length > 0 && (
        <div className="card__keywords">
          {card.keywords.map((kw) => (
            <span key={kw} className="card__keyword">
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Description (only in hand/preview) */}
      {size !== 'board' && (
        <div className="card__description">{card.description}</div>
      )}

      {/* Stats (only for minions) */}
      {!isSpell && (
        <div className="card__stats">
          <span
            className={`card__stat card__stat--attack ${
              card.currentAttack > card.baseAttack ? 'card__stat--buffed' : ''
            }`}
          >
            ⚔️ {card.currentAttack}
          </span>
          <span
            className={`card__stat card__stat--defense ${
              isDamaged
                ? 'card__stat--damaged'
                : card.currentDefense > card.baseDefense
                ? 'card__stat--buffed'
                : ''
            }`}
          >
            🛡️ {card.currentDefense}
          </span>
        </div>
      )}

      {/* Spell indicator */}
      {isSpell && (
        <div className="card__stats">
          <span className="card__stat" style={{ color: 'var(--accent-purple)', margin: '0 auto' }}>
            ✦ Spell
          </span>
        </div>
      )}
    </div>
  );
}
