import React, { useEffect, useRef } from 'react';

/**
 * CameraShake — Applies a CSS-based shake to the VFX portal container.
 * Uses CSS custom properties for intensity control.
 * Self-destructs after duration via onComplete.
 */
export default function CameraShake({ id, intensity, duration, onComplete }) {
  const elRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => onComplete(id), duration + 50);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={elRef}
      className="vfx-camera-shake"
      style={{
        '--shake-intensity': `${intensity}px`,
        animationDuration: `${duration}ms`,
      }}
    />
  );
}
