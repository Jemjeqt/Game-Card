import React, { useEffect, useRef, useMemo } from 'react';

/**
 * ParticleBurst — Renders N CSS particles that radiate outward, then auto-unmounts.
 * All layout via CSS custom properties + keyframes = 0 reflows.
 * Uses useMemo so particle config is stable across renders.
 *
 * Props:
 *   delay  — ms delay before particles appear (for 3-phase windup)
 *   noGlow — if true, strips box-shadow for low-end performance
 */
export default function ParticleBurst({ id, color, count, spread, duration, delay = 0, noGlow = false, onComplete }) {
  const elRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => onComplete(id), duration + delay + 100);
    return () => clearTimeout(timer);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-compute particle angles/delays once per mount
  const particles = useMemo(() => {
    const arr = [];
    const step = 360 / count;
    for (let i = 0; i < count; i++) {
      arr.push({
        key: i,
        angle: `${step * i}deg`,
        // Stagger individual particles + respect phase delay
        staggerDelay: `${(delay / 1000) + i * 0.04}s`,
        distance: `${spread + Math.random() * (spread * 0.5)}px`,
      });
    }
    return arr;
  }, [count, spread, delay]);

  return (
    <div ref={elRef} className="vfx-particles">
      {particles.map((p) => (
        <div
          key={p.key}
          className={`vfx-particle vfx-particle--${color}${noGlow ? ' vfx-particle--no-glow' : ''}`}
          style={{
            '--angle': p.angle,
            '--delay': p.staggerDelay,
            '--distance': p.distance,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
}
