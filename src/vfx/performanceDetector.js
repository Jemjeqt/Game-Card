/**
 * VFX Performance Detector — Adaptive scaling for device capabilities.
 *
 * Runs once at import time (no React dependency). Exports a frozen config
 * that VFXLayer and vfxAnimationMap consume for adaptive scaling.
 *
 * Detection based on:
 *   - Screen size (mobile / tablet / desktop)
 *   - Device pixel ratio
 *   - prefers-reduced-motion media query
 *   - Estimated performance tier (low / medium / high)
 *
 * Scaling rules:
 *   low-end / mobile:  particles ×0.4, no darken/shake, duration ×0.75
 *   medium / tablet:   particles ×0.7, no shake, duration ×0.9
 *   high-end / desktop: full particles, full shake, full duration
 */

// ── Detect screen class ──────────────────────────────────────
function detectScreenClass() {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

// ── Detect device pixel ratio ────────────────────────────────
function detectDPR() {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
}

// ── Detect reduced motion preference ─────────────────────────
function detectReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

// ── Estimate performance tier ────────────────────────────────
function estimatePerformanceTier() {
  if (typeof navigator === 'undefined') return 'medium';

  const cores = navigator.hardwareConcurrency || 2;
  const dpr = detectDPR();
  const screenClass = detectScreenClass();
  const memory = navigator.deviceMemory || 4; // GB, Chrome only

  // Scoring system
  let score = 0;

  // CPU cores
  if (cores >= 8) score += 3;
  else if (cores >= 4) score += 2;
  else score += 1;

  // Memory
  if (memory >= 8) score += 3;
  else if (memory >= 4) score += 2;
  else score += 1;

  // Screen class bonus (desktop usually more capable)
  if (screenClass === 'desktop') score += 2;
  else if (screenClass === 'tablet') score += 1;

  // High DPR on small screen = more GPU load
  if (dpr > 2 && screenClass === 'mobile') score -= 1;

  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

// ── Build config ─────────────────────────────────────────────
function buildPerformanceConfig() {
  const screenClass = detectScreenClass();
  const dpr = detectDPR();
  const reducedMotion = detectReducedMotion();
  const tier = estimatePerformanceTier();

  // If user prefers reduced motion, use minimal settings
  if (reducedMotion) {
    return Object.freeze({
      tier: 'low',
      screenClass,
      dpr,
      reducedMotion: true,
      particleScale: 0.2,
      durationScale: 0.5,
      allowScreenDarken: false,
      allowCameraShake: false,
      allowGlow: false,
      allowBurst: false,
      allowBlur: false,
      maxParticles: 3,
    });
  }

  // Tier-based scaling
  const configs = {
    low: {
      particleScale: 0.4,     // 40% of base particles
      durationScale: 0.75,    // 25% shorter
      allowScreenDarken: false,
      allowCameraShake: false,
      allowGlow: false,
      allowBurst: false,
      allowBlur: false,
      maxParticles: 6,
    },
    medium: {
      particleScale: 0.7,     // 70% of base particles
      durationScale: 0.9,     // 10% shorter
      allowScreenDarken: true,
      allowCameraShake: false,
      allowGlow: true,
      allowBurst: true,
      allowBlur: false,
      maxParticles: 10,
    },
    high: {
      particleScale: 1.0,     // Full particles
      durationScale: 1.0,     // Full duration
      allowScreenDarken: true,
      allowCameraShake: true,
      allowGlow: true,
      allowBurst: true,
      allowBlur: true,
      maxParticles: 18,
    },
  };

  const tierConfig = configs[tier] || configs.medium;

  // Mobile override: even on "high" tier, reduce if mobile
  if (screenClass === 'mobile') {
    tierConfig.particleScale = Math.min(tierConfig.particleScale, 0.6);
    tierConfig.allowCameraShake = false;
    tierConfig.durationScale = Math.min(tierConfig.durationScale, 0.85);
    tierConfig.maxParticles = Math.min(tierConfig.maxParticles, 8);
  }

  return Object.freeze({
    tier,
    screenClass,
    dpr,
    reducedMotion,
    ...tierConfig,
  });
}

// ── Singleton export ─────────────────────────────────────────
const perfConfig = buildPerformanceConfig();

export default perfConfig;

/**
 * Apply adaptive scaling to a VFX animation config.
 * Called by vfxAnimationMap after building the base config.
 * Mutates the config in place (it's a fresh object each time).
 */
export function applyAdaptiveScaling(config) {
  if (!config) return config;

  // Duration scaling
  if (config.totalDuration) {
    config.totalDuration = Math.round(config.totalDuration * perfConfig.durationScale);
  }

  // Screen effect gating
  if (config.screen) {
    if (config.screen.type === 'darken' && !perfConfig.allowScreenDarken) {
      config.screen = null;
    }
  }

  // Camera shake gating
  if (config.cameraShake && !perfConfig.allowCameraShake) {
    config.cameraShake = null;
  }

  // Particle scaling
  if (config.particles) {
    const scaled = Math.round(config.particles.count * perfConfig.particleScale);
    config.particles.count = Math.min(scaled, perfConfig.maxParticles);
    config.particles.duration = Math.round(config.particles.duration * perfConfig.durationScale);

    // On low tier, remove box-shadow (glow) by signaling CSS class
    if (!perfConfig.allowGlow) {
      config.particles.noGlow = true;
    }
  }

  // Overlay duration scaling
  if (config.overlay) {
    config.overlay.duration = Math.round(config.overlay.duration * perfConfig.durationScale);
  }

  // Floating text duration scaling
  if (config.floatingText) {
    config.floatingText.duration = Math.round(config.floatingText.duration * perfConfig.durationScale);
  }

  // Phase timing scaling
  if (config.phases) {
    config.phases.windup = Math.round(config.phases.windup * perfConfig.durationScale);
    config.phases.impact = Math.round(config.phases.impact * perfConfig.durationScale);
    config.phases.resolve = Math.round(config.phases.resolve * perfConfig.durationScale);
  }

  return config;
}
