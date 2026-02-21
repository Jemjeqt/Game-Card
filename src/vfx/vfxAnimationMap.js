/**
 * VFX Animation Map — 3-Phase Architecture
 *
 * Every VFX animation has three sequential phases:
 *   1. WINDUP  — anticipation (scale-up, charge glow, darkener)
 *   2. IMPACT  — main visual hit (burst, flash, particles, shockwave)
 *   3. RESOLVE — dissipation (fade-out, particles settle)
 *
 * Rarity configurations (hard cap: 600ms total, darken ≤200ms):
 *   Common:    ×1.0 (200–300ms), 4 particles, no screen/shake
 *   Rare:      ×1.1, 6 particles, soft glow at impact
 *   Epic:      ×1.25 (max 450ms), 10 particles, light burst + micro shake
 *   Legendary: ×1.4 (max 550–600ms), 14–18 particles, darken + shockwave + shake
 *
 * All configs are scaled by performanceDetector before rendering.
 */

import { VFX_EVENTS } from './vfxEvents';
import { applyAdaptiveScaling } from './performanceDetector';

// ── Hard caps ────────────────────────────────────────────────
const MAX_TOTAL_DURATION = 600;
const MAX_DARKEN_DURATION = 200;
const MAX_LEGENDARY_DURATION = 600;

// ── Rarity scaling parameters ────────────────────────────────
const RARITY_CONFIG = {
  common: {
    durationMul: 1.0,     // base 200–300ms
    particles:   4,
    glow:        false,
    burst:       false,
    darken:      false,
    shake:       false,
    shakeIntensity: 0,
  },
  rare: {
    durationMul: 1.1,
    particles:   6,
    glow:        true,    // soft glow at impact
    burst:       false,
    darken:      false,
    shake:       false,
    shakeIntensity: 0,
  },
  epic: {
    durationMul: 1.25,    // max 450ms
    particles:   10,
    glow:        true,
    burst:       true,    // light burst at impact
    darken:      false,
    shake:       true,    // micro shake
    shakeIntensity: 2,    // px
  },
  legendary: {
    durationMul: 1.4,     // max 550–600ms
    particles:   16,
    glow:        true,
    burst:       true,
    darken:      true,    // screen darken during windup (150–200ms)
    shake:       true,    // controlled shake
    shakeIntensity: 4,    // px
  },
};

function getRarity(rarity) {
  return RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
}

// ── Helper: generate unique ID ───────────────────────────────
let _counter = 0;
function uid(prefix) {
  return `${prefix}_${++_counter}_${Date.now().toString(36)}`;
}

// ── Helper: clamp total duration ─────────────────────────────
function clampDuration(base, mul, max = MAX_TOTAL_DURATION) {
  return Math.min(Math.round(base * mul), max);
}

// ── Helper: compute 3-phase timing ───────────────────────────
function computePhases(totalDuration, rarityConfig) {
  // Phase distribution: windup 25%, impact 35%, resolve 40%
  const windup  = Math.round(totalDuration * 0.25);
  const impact  = Math.round(totalDuration * 0.35);
  const resolve = totalDuration - windup - impact;
  return { windup, impact, resolve };
}

// ═══════════════════════════════════════════════════════════
//   ANIMATION MAP — each event → config factory
// ═══════════════════════════════════════════════════════════

const ANIMATION_MAP = {

  // ── CARD PLAYED ────────────────────────────────────────────
  [VFX_EVENTS.CARD_PLAYED]: (payload) => {
    const rc = getRarity(payload.rarity);
    const isLegendary = payload.rarity === 'legendary';
    const isSpell = payload.cardType === 'spell';

    const baseDuration = isLegendary ? 550 : 300;
    const total = clampDuration(baseDuration, rc.durationMul, isLegendary ? MAX_LEGENDARY_DURATION : MAX_TOTAL_DURATION);
    const phases = computePhases(total, rc);

    return applyAdaptiveScaling({
      id: uid('play'),
      phases,

      // Screen darken (legendary) or flash (epic burst)
      screen: isLegendary
        ? { type: 'darken', duration: Math.min(phases.windup + 50, MAX_DARKEN_DURATION), intensity: 0.65 }
        : rc.burst
          ? { type: 'flash', duration: phases.impact, color: isSpell ? 'purple' : 'gold' }
          : null,

      // Camera shake
      cameraShake: rc.shake
        ? { intensity: rc.shakeIntensity, duration: phases.impact }
        : null,

      // Center overlay
      overlay: isLegendary
        ? { type: 'legendary_entrance', icon: payload.icon, name: payload.name, duration: total }
        : isSpell
          ? { type: 'spell_cast', icon: payload.icon, name: payload.name, duration: total }
          : null,

      floatingText: null,

      // Particles at impact phase
      particles: (rc.glow || isLegendary)
        ? {
            color: isLegendary ? 'gold' : isSpell ? 'purple' : 'gold',
            count: rc.particles,
            spread: isLegendary ? 140 : 80,
            duration: phases.impact + phases.resolve,
            delay: phases.windup,
            noGlow: false,
          }
        : null,

      totalDuration: total,
    });
  },

  // ── DAMAGE APPLIED ─────────────────────────────────────────
  [VFX_EVENTS.DAMAGE_APPLIED]: (payload) => {
    const rc = getRarity(payload.rarity);
    const total = clampDuration(250, rc.durationMul);
    const phases = computePhases(total, rc);

    return applyAdaptiveScaling({
      id: uid('dmg'),
      phases,

      screen: { type: 'flash', duration: phases.impact, color: 'red' },

      cameraShake: rc.shake
        ? { intensity: rc.shakeIntensity, duration: phases.impact }
        : null,

      overlay: null,

      floatingText: {
        text: `-${payload.value}`,
        color: '#ff4444',
        position: payload.owner === 'player' ? 'opponent-hero' : 'player-hero',
        duration: total + 200,
        delay: phases.windup,
      },

      particles: rc.burst
        ? { color: 'fire', count: rc.particles, spread: 100, duration: phases.impact + phases.resolve, delay: phases.windup }
        : null,

      totalDuration: total + 200,
    });
  },

  // ── AOE DAMAGE ─────────────────────────────────────────────
  [VFX_EVENTS.AOE_DAMAGE]: (payload) => {
    const rc = getRarity(payload.rarity);
    const total = clampDuration(400, rc.durationMul);
    const phases = computePhases(total, rc);

    return applyAdaptiveScaling({
      id: uid('aoe'),
      phases,

      screen: { type: 'flash', duration: phases.impact, color: 'red' },

      cameraShake: rc.shake
        ? { intensity: rc.shakeIntensity + 1, duration: phases.impact + 50 }
        : null,

      overlay: { type: 'aoe_ring', duration: total },

      floatingText: {
        text: `AOE -${payload.value}`,
        color: '#ff6644',
        position: 'center',
        duration: total + 200,
        delay: phases.windup,
      },

      particles: {
        color: 'fire', count: rc.particles, spread: 150,
        duration: phases.impact + phases.resolve,
        delay: phases.windup,
      },

      totalDuration: total + 200,
    });
  },

  // ── HEAL APPLIED ───────────────────────────────────────────
  [VFX_EVENTS.HEAL_APPLIED]: (payload) => {
    const rc = getRarity(payload.rarity);
    const total = clampDuration(300, rc.durationMul);
    const phases = computePhases(total, rc);

    return applyAdaptiveScaling({
      id: uid('heal'),
      phases,
      screen: null,
      cameraShake: null,

      overlay: { type: 'heal_glow', duration: total },

      floatingText: {
        text: `+${payload.value}`,
        color: '#44ff88',
        position: payload.owner === 'player' ? 'player-hero' : 'opponent-hero',
        duration: total + 200,
        delay: phases.windup,
      },

      particles: {
        color: 'heal', count: rc.particles, spread: 80,
        duration: phases.impact + phases.resolve,
        delay: phases.windup,
      },

      totalDuration: total + 200,
    });
  },

  // ── MINION DIED ────────────────────────────────────────────
  [VFX_EVENTS.MINION_DIED]: (payload) => {
    const rc = getRarity(payload.rarity);
    const total = clampDuration(350, rc.durationMul);
    const phases = computePhases(total, rc);

    return applyAdaptiveScaling({
      id: uid('death'),
      phases,

      screen: rc.darken
        ? { type: 'darken', duration: Math.min(phases.windup, MAX_DARKEN_DURATION), intensity: 0.35 }
        : null,

      cameraShake: rc.shake
        ? { intensity: rc.shakeIntensity, duration: phases.impact }
        : null,

      overlay: { type: 'void_implode', icon: '💀', duration: total },

      floatingText: null,

      particles: {
        color: 'dark', count: rc.particles, spread: 90,
        duration: phases.impact + phases.resolve,
        delay: phases.windup,
      },

      totalDuration: total,
    });
  },

  // ── MINION SUMMONED ────────────────────────────────────────
  [VFX_EVENTS.MINION_SUMMONED]: (payload) => {
    const rc = getRarity(payload.rarity);
    const total = clampDuration(300, rc.durationMul);
    const phases = computePhases(total, rc);

    return applyAdaptiveScaling({
      id: uid('summon'),
      phases,
      screen: null,
      cameraShake: null,

      overlay: { type: 'portal_summon', icon: payload.icon || '👻', duration: total },

      floatingText: null,

      particles: {
        color: 'purple', count: rc.particles, spread: 70,
        duration: phases.impact + phases.resolve,
        delay: phases.windup,
      },

      totalDuration: total,
    });
  },

  // ── BUFF APPLIED ───────────────────────────────────────────
  [VFX_EVENTS.BUFF_APPLIED]: (payload) => {
    const rc = getRarity(payload.rarity);
    const total = clampDuration(250, rc.durationMul);
    const phases = computePhases(total, rc);

    return applyAdaptiveScaling({
      id: uid('buff'),
      phases,
      screen: null,
      cameraShake: null,

      overlay: { type: 'buff_glow', duration: total },

      floatingText: {
        text: `+${payload.value}`,
        color: '#ffd700',
        position: 'center',
        duration: total + 150,
        delay: phases.windup,
      },

      particles: rc.glow
        ? { color: 'gold', count: rc.particles, spread: 60, duration: phases.impact + phases.resolve, delay: phases.windup }
        : null,

      totalDuration: total + 150,
    });
  },

  // ── SHIELD APPLIED ─────────────────────────────────────────
  [VFX_EVENTS.SHIELD_APPLIED]: (payload) => {
    const rc = getRarity(payload.rarity);
    const total = clampDuration(280, rc.durationMul);
    const phases = computePhases(total, rc);

    return applyAdaptiveScaling({
      id: uid('shield'),
      phases,
      screen: null,
      cameraShake: null,

      overlay: { type: 'shield_barrier', duration: total },

      floatingText: {
        text: `🛡️ +${payload.value}`,
        color: '#64b4ff',
        position: 'center',
        duration: total + 150,
        delay: phases.windup,
      },

      particles: {
        color: 'cyan', count: rc.particles, spread: 70,
        duration: phases.impact + phases.resolve,
        delay: phases.windup,
      },

      totalDuration: total + 150,
    });
  },

  // ── DRAW CARDS ─────────────────────────────────────────────
  [VFX_EVENTS.DRAW_CARDS]: (payload) => {
    const rc = getRarity(payload.rarity);
    const total = clampDuration(200, rc.durationMul);
    const phases = computePhases(total, rc);

    return applyAdaptiveScaling({
      id: uid('draw'),
      phases,
      screen: null,
      cameraShake: null,

      overlay: { type: 'draw_glow', duration: total },

      floatingText: {
        text: `Draw ${payload.value}`,
        color: '#00c8ff',
        position: 'center',
        duration: total + 100,
        delay: phases.windup,
      },

      particles: null,
      totalDuration: total + 100,
    });
  },

  // ── STEAL EFFECT ───────────────────────────────────────────
  [VFX_EVENTS.STEAL_EFFECT]: (payload) => {
    const rc = getRarity(payload.rarity);
    const total = clampDuration(300, rc.durationMul);
    const phases = computePhases(total, rc);

    return applyAdaptiveScaling({
      id: uid('steal'),
      phases,
      screen: null,
      cameraShake: null,

      overlay: { type: 'drain_spiral', icon: payload.icon || '👁️', duration: total },

      floatingText: {
        text: `Steal ${payload.value}`,
        color: '#c832ff',
        position: 'center',
        duration: total + 150,
        delay: phases.windup,
      },

      particles: {
        color: 'purple', count: rc.particles, spread: 80,
        duration: phases.impact + phases.resolve,
        delay: phases.windup,
      },

      totalDuration: total + 150,
    });
  },

  // ── SELF DAMAGE ────────────────────────────────────────────
  [VFX_EVENTS.SELF_DAMAGE]: (payload) => {
    const total = 250;
    const phases = computePhases(total, RARITY_CONFIG.common);

    return applyAdaptiveScaling({
      id: uid('selfdmg'),
      phases,

      screen: { type: 'flash', duration: phases.impact, color: 'dark-red' },
      cameraShake: null,
      overlay: null,

      floatingText: {
        text: `-${payload.value}`,
        color: '#cc3333',
        position: payload.owner === 'player' ? 'player-hero' : 'opponent-hero',
        duration: total + 150,
        delay: phases.windup,
      },

      particles: null,
      totalDuration: total + 150,
    });
  },

  // ── POISON TICK ────────────────────────────────────────────
  [VFX_EVENTS.POISON_TICK]: (payload) => {
    const total = 300;
    const phases = computePhases(total, RARITY_CONFIG.common);

    return applyAdaptiveScaling({
      id: uid('poison'),
      phases,
      screen: null,
      cameraShake: null,

      overlay: { type: 'poison_aura', duration: total },

      floatingText: {
        text: `☠ -${payload.value}`,
        color: '#44cc44',
        position: 'center',
        duration: total + 150,
        delay: phases.windup,
      },

      particles: {
        color: 'poison', count: 4, spread: 50,
        duration: phases.impact + phases.resolve,
        delay: phases.windup,
      },

      totalDuration: total + 150,
    });
  },
};

/**
 * Resolve an event name + payload into a VFX animation config.
 * Returns null if no mapping exists.
 * Config is already adaptively scaled.
 */
export function resolveVFXConfig(eventName, payload) {
  const resolver = ANIMATION_MAP[eventName];
  if (!resolver) return null;
  return resolver(payload);
}
