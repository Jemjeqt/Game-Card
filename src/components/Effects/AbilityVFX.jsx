import React, { useEffect, useState } from 'react';
import useUIStore from '../../stores/useUIStore';

/**
 * AbilityVFX — Full-screen visual effect overlay for card abilities.
 * 
 * VFX types:
 *   legendary_play  — Dark overlay + golden burst + card icon
 *   aoe_damage      — Red shockwave across the board
 *   damage_hero     — Red flash
 *   heal            — Green glow particles
 *   buff            — Golden shimmer
 *   shield          — Blue barrier pulse
 *   summon          — Purple portal swirl
 *   destroy         — Dark void implode
 *   self_damage     — Blood red pulse
 *   draw            — Cyan card glow
 *   steal           — Purple drain
 *   spell_cast      — Arcane burst (generic spell)
 */

const VFX_DURATIONS = {
  legendary_play: 2200,
  aoe_damage: 1000,
  damage_hero: 700,
  heal: 900,
  buff: 800,
  shield: 800,
  summon: 900,
  destroy: 900,
  self_damage: 700,
  draw: 600,
  steal: 800,
  spell_cast: 800,
};

export default function AbilityVFX() {
  const activeVFX = useUIStore((s) => s.activeVFX);
  const clearVFX = useUIStore((s) => s.clearVFX);
  const [phase, setPhase] = useState('enter'); // enter → active → exit

  useEffect(() => {
    if (!activeVFX) {
      setPhase('enter');
      return;
    }

    const duration = VFX_DURATIONS[activeVFX.type] || 800;

    // Start active phase after a brief delay
    const t1 = setTimeout(() => setPhase('active'), 50);
    // Start exit phase
    const t2 = setTimeout(() => setPhase('exit'), duration - 300);
    // Clear VFX
    const t3 = setTimeout(() => {
      clearVFX();
      setPhase('enter');
    }, duration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeVFX, clearVFX]);

  if (!activeVFX) return null;

  const { type, cardName, cardIcon, isLegendary } = activeVFX;

  // ===== LEGENDARY PLAY =====
  if (type === 'legendary_play') {
    return (
      <div className={`vfx-overlay vfx-legendary vfx-legendary--${phase}`}>
        <div className="vfx-legendary__darkener" />
        <div className="vfx-legendary__burst" />
        <div className="vfx-legendary__content">
          <div className="vfx-legendary__icon">{cardIcon}</div>
          <div className="vfx-legendary__name">{cardName}</div>
          <div className="vfx-legendary__label">⭐ LEGENDARY</div>
        </div>
        <div className="vfx-legendary__particles">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="vfx-particle vfx-particle--gold" style={{
              '--angle': `${i * 30}deg`,
              '--delay': `${i * 0.08}s`,
              '--distance': `${100 + Math.random() * 80}px`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  // ===== AOE DAMAGE =====
  if (type === 'aoe_damage') {
    return (
      <div className={`vfx-overlay vfx-aoe vfx-aoe--${phase}`}>
        <div className="vfx-aoe__ring" />
        <div className="vfx-aoe__ring vfx-aoe__ring--2" />
        <div className="vfx-aoe__flash" />
        <div className="vfx-aoe__icon">{cardIcon || '💥'}</div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="vfx-particle vfx-particle--fire" style={{
            '--angle': `${i * 45}deg`,
            '--delay': `${i * 0.05}s`,
            '--distance': `${120 + Math.random() * 60}px`,
          }} />
        ))}
      </div>
    );
  }

  // ===== DAMAGE HERO =====
  if (type === 'damage_hero') {
    return (
      <div className={`vfx-overlay vfx-damage-hero vfx-damage-hero--${phase}`}>
        <div className="vfx-damage-hero__flash" />
        <div className="vfx-damage-hero__cracks" />
      </div>
    );
  }

  // ===== HEAL =====
  if (type === 'heal') {
    return (
      <div className={`vfx-overlay vfx-heal vfx-heal--${phase}`}>
        <div className="vfx-heal__glow" />
        <div className="vfx-heal__icon">{cardIcon || '💚'}</div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="vfx-particle vfx-particle--heal" style={{
            '--angle': `${i * 45 + 22}deg`,
            '--delay': `${i * 0.06}s`,
            '--distance': `${80 + Math.random() * 50}px`,
          }} />
        ))}
      </div>
    );
  }

  // ===== BUFF =====
  if (type === 'buff') {
    return (
      <div className={`vfx-overlay vfx-buff vfx-buff--${phase}`}>
        <div className="vfx-buff__glow" />
        <div className="vfx-buff__icon">{cardIcon || '⚔️'}</div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="vfx-particle vfx-particle--gold" style={{
            '--angle': `${i * 60}deg`,
            '--delay': `${i * 0.07}s`,
            '--distance': `${70 + Math.random() * 40}px`,
          }} />
        ))}
      </div>
    );
  }

  // ===== SHIELD =====
  if (type === 'shield') {
    return (
      <div className={`vfx-overlay vfx-shield vfx-shield--${phase}`}>
        <div className="vfx-shield__dome" />
        <div className="vfx-shield__icon">🛡️</div>
      </div>
    );
  }

  // ===== SUMMON =====
  if (type === 'summon') {
    return (
      <div className={`vfx-overlay vfx-summon vfx-summon--${phase}`}>
        <div className="vfx-summon__portal" />
        <div className="vfx-summon__icon">{cardIcon || '👻'}</div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="vfx-particle vfx-particle--purple" style={{
            '--angle': `${i * 60}deg`,
            '--delay': `${i * 0.08}s`,
            '--distance': `${60 + Math.random() * 40}px`,
          }} />
        ))}
      </div>
    );
  }

  // ===== DESTROY =====
  if (type === 'destroy') {
    return (
      <div className={`vfx-overlay vfx-destroy vfx-destroy--${phase}`}>
        <div className="vfx-destroy__void" />
        <div className="vfx-destroy__icon">💀</div>
      </div>
    );
  }

  // ===== SELF DAMAGE =====
  if (type === 'self_damage') {
    return (
      <div className={`vfx-overlay vfx-self-damage vfx-self-damage--${phase}`}>
        <div className="vfx-self-damage__flash" />
      </div>
    );
  }

  // ===== DRAW =====
  if (type === 'draw') {
    return (
      <div className={`vfx-overlay vfx-draw vfx-draw--${phase}`}>
        <div className="vfx-draw__glow" />
        <div className="vfx-draw__icon">🃏</div>
      </div>
    );
  }

  // ===== STEAL =====
  if (type === 'steal') {
    return (
      <div className={`vfx-overlay vfx-steal vfx-steal--${phase}`}>
        <div className="vfx-steal__drain" />
        <div className="vfx-steal__icon">{cardIcon || '👁️'}</div>
      </div>
    );
  }

  // ===== SPELL CAST (generic) =====
  if (type === 'spell_cast') {
    return (
      <div className={`vfx-overlay vfx-spell vfx-spell--${phase}`}>
        <div className="vfx-spell__burst" />
        <div className="vfx-spell__icon">{cardIcon || '✨'}</div>
      </div>
    );
  }

  return null;
}
