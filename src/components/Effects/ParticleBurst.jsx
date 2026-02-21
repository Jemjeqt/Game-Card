import React, { useEffect, useRef, useMemo } from 'react';

/**
 * ParticleBurst — Renders N CSS particles that radiate outward, then auto-unmounts.
 * All layout via CSS custom properties + keyframes = 0 reflows.
 * Uses useMemo so particle config is stable across renders.
 */
export default function ParticleBurst({ id, color, count, spread, duration, onComplete }) {
  const elRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => onComplete(id), duration + 100);
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
        delay: `${i * 0.04}s`,
        distance: `${spread + Math.random() * (spread * 0.5)}px`,
      });
    }
    return arr;
  }, [count, spread]);

  return (
    <div ref={elRef} className="vfx-particles">
      {particles.map((p) => (
        <div
          key={p.key}
          className={`vfx-particle vfx-particle--${color}`}
          style={{
            '--angle': p.angle,
            '--delay': p.delay,
            '--distance': p.distance,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
}
