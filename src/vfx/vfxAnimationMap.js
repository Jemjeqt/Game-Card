/**
 * VFX Animation Map
 *
 * Maps VFX event types → animation configuration objects.
 * Each config describes what the VFXLayer should render (animation class,
 * duration, intensity by rarity, overlay type, particles, floating text, etc.).
 *
 * Rarity intensities:
 *   common    – subtle, fast (<300ms)
 *   rare      – additional glow
 *   epic      – light burst + slight screen emphasis
 *   legendary – shockwave + short screen darken (max 200ms)
 */

import { VFX_EVENTS } from './vfxEvents';

// ── Rarity duration multipliers ──────────────────────────────
const RARITY_SCALE = {
  common:    { duration: 1.0, intensity: 0.6, particles: 4,  glow: false, burst: false, darken: false },
  rare:      { duration: 1.1, intensity: 0.8, particles: 6,  glow: true,  burst: false, darken: false },
  epic:      { duration: 1.2, intensity: 1.0, particles: 10, glow: true,  burst: true,  darken: false },
  legendary: { duration: 1.0, intensity: 1.0, particles: 14, glow: true,  burst: true,  darken: true  },
};

export function getRarityScale(rarity) {
  return RARITY_SCALE[rarity] || RARITY_SCALE.common;
}

// ── Animation configs per event ──────────────────────────────

const ANIMATION_MAP = {
  // ── Card Played ────────────────────────────────────────────
  [VFX_EVENTS.CARD_PLAYED]: (payload) => {
    const rs = getRarityScale(payload.rarity);
    const isLegendary = payload.rarity === 'legendary';
    const isSpell = payload.cardType === 'spell';

    return {
      id: `play_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      // Screen-level effect
      screen: isLegendary
        ? { type: 'darken', duration: 200, intensity: 0.7 }
        : rs.burst
          ? { type: 'flash', duration: 180, color: isSpell ? 'purple' : 'gold' }
          : null,
      // Center overlay
      overlay: isLegendary
        ? {
            type: 'legendary_entrance',
            icon: payload.icon,
            name: payload.name,
            duration: 1800,
          }
        : isSpell
          ? {
              type: 'spell_cast',
              icon: payload.icon,
              name: payload.name,
              duration: Math.round(600 * rs.duration),
            }
          : null,
      // Floating text
      floatingText: null,
      // Particles
      particles: isLegendary
        ? { color: 'gold', count: rs.particles, spread: 140, duration: 1200 }
        : rs.glow
          ? { color: isSpell ? 'purple' : 'gold', count: rs.particles, spread: 80, duration: Math.round(500 * rs.duration) }
          : null,
      // Total duration (auto-cleanup)
      totalDuration: isLegendary ? 2000 : Math.round(700 * rs.duration),
    };
  },

  // ── Damage Applied ─────────────────────────────────────────
  [VFX_EVENTS.DAMAGE_APPLIED]: (payload) => {
    const rs = getRarityScale(payload.rarity);
    return {
      id: `dmg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      screen: { type: 'flash', duration: Math.round(150 * rs.duration), color: 'red' },
      overlay: null,
      floatingText: {
        text: `-${payload.value}`,
        color: '#ff4444',
        position: payload.owner === 'player' ? 'opponent-hero' : 'player-hero',
        duration: 800,
      },
      particles: rs.burst
        ? { color: 'fire', count: rs.particles, spread: 100, duration: 500 }
        : null,
      totalDuration: Math.round(600 * rs.duration),
    };
  },

  // ── AOE Damage ─────────────────────────────────────────────
  [VFX_EVENTS.AOE_DAMAGE]: (payload) => {
    const rs = getRarityScale(payload.rarity);
    return {
      id: `aoe_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      screen: { type: 'flash', duration: Math.round(200 * rs.duration), color: 'red' },
      overlay: {
        type: 'aoe_ring',
        duration: Math.round(800 * rs.duration),
      },
      floatingText: {
        text: `AOE -${payload.value}`,
        color: '#ff6644',
        position: 'center',
        duration: 900,
      },
      particles: { color: 'fire', count: rs.particles, spread: 150, duration: Math.round(700 * rs.duration) },
      totalDuration: Math.round(900 * rs.duration),
    };
  },

  // ── Heal Applied ───────────────────────────────────────────
  [VFX_EVENTS.HEAL_APPLIED]: (payload) => {
    const rs = getRarityScale(payload.rarity);
    return {
      id: `heal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      screen: null,
      overlay: {
        type: 'heal_glow',
        duration: Math.round(700 * rs.duration),
      },
      floatingText: {
        text: `+${payload.value}`,
        color: '#44ff88',
        position: payload.owner === 'player' ? 'player-hero' : 'opponent-hero',
        duration: 800,
      },
      particles: { color: 'heal', count: rs.particles, spread: 80, duration: Math.round(600 * rs.duration) },
      totalDuration: Math.round(800 * rs.duration),
    };
  },

  // ── Minion Died ────────────────────────────────────────────
  [VFX_EVENTS.MINION_DIED]: (payload) => {
    const rs = getRarityScale(payload.rarity);
    return {
      id: `death_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      screen: rs.darken ? { type: 'darken', duration: 200, intensity: 0.4 } : null,
      overlay: {
        type: 'void_implode',
        icon: '💀',
        duration: Math.round(700 * rs.duration),
      },
      floatingText: null,
      particles: { color: 'dark', count: rs.particles, spread: 90, duration: 600 },
      totalDuration: Math.round(800 * rs.duration),
    };
  },

  // ── Minion Summoned ────────────────────────────────────────
  [VFX_EVENTS.MINION_SUMMONED]: (payload) => {
    const rs = getRarityScale(payload.rarity);
    return {
      id: `summon_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      screen: null,
      overlay: {
        type: 'portal_summon',
        icon: payload.icon || '👻',
        duration: Math.round(700 * rs.duration),
      },
      floatingText: null,
      particles: { color: 'purple', count: rs.particles, spread: 70, duration: Math.round(600 * rs.duration) },
      totalDuration: Math.round(800 * rs.duration),
    };
  },

  // ── Buff Applied ───────────────────────────────────────────
  [VFX_EVENTS.BUFF_APPLIED]: (payload) => {
    const rs = getRarityScale(payload.rarity);
    return {
      id: `buff_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      screen: null,
      overlay: {
        type: 'buff_glow',
        duration: Math.round(500 * rs.duration),
      },
      floatingText: {
        text: `+${payload.value}`,
        color: '#ffd700',
        position: 'center',
        duration: 700,
      },
      particles: rs.glow
        ? { color: 'gold', count: rs.particles, spread: 60, duration: Math.round(400 * rs.duration) }
        : null,
      totalDuration: Math.round(600 * rs.duration),
    };
  },

  // ── Shield Applied ─────────────────────────────────────────
  [VFX_EVENTS.SHIELD_APPLIED]: (payload) => {
    const rs = getRarityScale(payload.rarity);
    return {
      id: `shield_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      screen: null,
      overlay: {
        type: 'shield_barrier',
        duration: Math.round(600 * rs.duration),
      },
      floatingText: {
        text: `🛡️ +${payload.value}`,
        color: '#64b4ff',
        position: 'center',
        duration: 700,
      },
      particles: { color: 'cyan', count: rs.particles, spread: 70, duration: Math.round(500 * rs.duration) },
      totalDuration: Math.round(700 * rs.duration),
    };
  },

  // ── Draw Cards ─────────────────────────────────────────────
  [VFX_EVENTS.DRAW_CARDS]: (payload) => {
    const rs = getRarityScale(payload.rarity);
    return {
      id: `draw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      screen: null,
      overlay: {
        type: 'draw_glow',
        duration: Math.round(400 * rs.duration),
      },
      floatingText: {
        text: `Draw ${payload.value}`,
        color: '#00c8ff',
        position: 'center',
        duration: 600,
      },
      particles: null,
      totalDuration: Math.round(500 * rs.duration),
    };
  },

  // ── Steal Effect ───────────────────────────────────────────
  [VFX_EVENTS.STEAL_EFFECT]: (payload) => {
    const rs = getRarityScale(payload.rarity);
    return {
      id: `steal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      screen: null,
      overlay: {
        type: 'drain_spiral',
        icon: payload.icon || '👁️',
        duration: Math.round(600 * rs.duration),
      },
      floatingText: {
        text: `Steal ${payload.value}`,
        color: '#c832ff',
        position: 'center',
        duration: 700,
      },
      particles: { color: 'purple', count: rs.particles, spread: 80, duration: 500 },
      totalDuration: Math.round(700 * rs.duration),
    };
  },

  // ── Self Damage ────────────────────────────────────────────
  [VFX_EVENTS.SELF_DAMAGE]: (payload) => {
    return {
      id: `selfdmg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      screen: { type: 'flash', duration: 150, color: 'dark-red' },
      overlay: null,
      floatingText: {
        text: `-${payload.value}`,
        color: '#cc3333',
        position: payload.owner === 'player' ? 'player-hero' : 'opponent-hero',
        duration: 700,
      },
      particles: null,
      totalDuration: 500,
    };
  },

  // ── Poison Tick ────────────────────────────────────────────
  [VFX_EVENTS.POISON_TICK]: (payload) => {
    return {
      id: `poison_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      screen: null,
      overlay: {
        type: 'poison_aura',
        duration: 600,
      },
      floatingText: {
        text: `☠ -${payload.value}`,
        color: '#44cc44',
        position: 'center',
        duration: 700,
      },
      particles: { color: 'poison', count: 6, spread: 50, duration: 500 },
      totalDuration: 700,
    };
  },
};

/**
 * Resolve an event name + payload into a VFX animation config.
 * Returns null if no mapping exists.
 */
export function resolveVFXConfig(eventName, payload) {
  const resolver = ANIMATION_MAP[eventName];
  if (!resolver) return null;
  return resolver(payload);
}
