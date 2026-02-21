import React, { useEffect, useRef } from 'react';

/**
 * ScreenEffect — Transient fullscreen flash / darken / shake.
 * Uses CSS class toggling via ref (no setState during animation).
 * Auto-removes itself via onComplete after duration.
 */
export default function ScreenEffect({ id, type, duration, color, intensity, onComplete }) {
  const elRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => onComplete(id), duration + 50);
    return () => clearTimeout(timer);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const className = `vfx-screen vfx-screen--${type} vfx-screen--${color || 'red'}`;
  const style = {
    animationDuration: `${duration}ms`,
  };

  if (type === 'darken' && intensity) {
    style['--darken-intensity'] = intensity;
  }

  return <div ref={elRef} className={className} style={style} />;
}
