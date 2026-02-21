import React, { useEffect, useRef } from 'react';

/**
 * OverlayEffect — Center-screen overlay for abilities (heal glow, portal, AoE ring, etc.).
 * Renders a CSS-animated element and auto-unmounts via onComplete.
 */
export default function OverlayEffect({ id, type, icon, name, duration, onComplete }) {
  const elRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => onComplete(id), duration + 100);
    return () => clearTimeout(timer);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={elRef}
      className={`vfx-overlay-effect vfx-oe--${type}`}
      style={{ animationDuration: `${duration}ms` }}
    >
      {renderOverlayContent(type, icon, name, duration)}
    </div>
  );
}

function renderOverlayContent(type, icon, name, duration) {
  switch (type) {
    case 'legendary_entrance':
      return (
        <>
          <div className="vfx-le__darkener" />
          <div className="vfx-le__burst" style={{ animationDuration: `${duration}ms` }} />
          <div className="vfx-le__content" style={{ animationDuration: `${duration}ms` }}>
            <div className="vfx-le__icon">{icon}</div>
            <div className="vfx-le__name">{name}</div>
            <div className="vfx-le__label">⭐ LEGENDARY</div>
          </div>
        </>
      );

    case 'aoe_ring':
      return (
        <>
          <div className="vfx-aoe-ring" style={{ animationDuration: `${duration}ms` }} />
          <div className="vfx-aoe-ring vfx-aoe-ring--delayed" style={{ animationDuration: `${duration}ms` }} />
          <div className="vfx-aoe-flash" style={{ animationDuration: `${Math.round(duration * 0.5)}ms` }} />
        </>
      );

    case 'heal_glow':
      return (
        <div className="vfx-heal-orb" style={{ animationDuration: `${duration}ms` }}>
          <span className="vfx-heal-orb__icon">{icon || '💚'}</span>
        </div>
      );

    case 'buff_glow':
      return (
        <div className="vfx-buff-orb" style={{ animationDuration: `${duration}ms` }}>
          <span className="vfx-buff-orb__icon">{icon || '⚔️'}</span>
        </div>
      );

    case 'shield_barrier':
      return (
        <div className="vfx-shield-dome" style={{ animationDuration: `${duration}ms` }}>
          <span className="vfx-shield-dome__icon">🛡️</span>
        </div>
      );

    case 'portal_summon':
      return (
        <div className="vfx-portal" style={{ animationDuration: `${duration}ms` }}>
          <span className="vfx-portal__icon">{icon || '👻'}</span>
        </div>
      );

    case 'void_implode':
      return (
        <div className="vfx-void" style={{ animationDuration: `${duration}ms` }}>
          <span className="vfx-void__icon">{icon || '💀'}</span>
        </div>
      );

    case 'draw_glow':
      return (
        <div className="vfx-draw-orb" style={{ animationDuration: `${duration}ms` }}>
          <span className="vfx-draw-orb__icon">🃏</span>
        </div>
      );

    case 'drain_spiral':
      return (
        <div className="vfx-drain" style={{ animationDuration: `${duration}ms` }}>
          <span className="vfx-drain__icon">{icon || '👁️'}</span>
        </div>
      );

    case 'spell_cast':
      return (
        <div className="vfx-spell-orb" style={{ animationDuration: `${duration}ms` }}>
          <span className="vfx-spell-orb__icon">{icon || '✨'}</span>
        </div>
      );

    case 'poison_aura':
      return (
        <div className="vfx-poison-aura" style={{ animationDuration: `${duration}ms` }}>
          <span className="vfx-poison-aura__icon">☠️</span>
        </div>
      );

    default:
      return null;
  }
}
