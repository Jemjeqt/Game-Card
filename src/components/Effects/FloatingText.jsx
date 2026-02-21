import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * FloatingText — Keyed component that renders a floating number/text,
 * then auto-unmounts after the animation completes.
 *
 * Uses CSS `animation` (no setState during animation = no re-render loop).
 * The parent removes it via onComplete callback tied to animationend.
 */
export default function FloatingText({ id, text, color, position, duration, onComplete }) {
  const elRef = useRef(null);

  // Fire onComplete after the CSS animation ends
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const handle = () => onComplete(id);
    el.addEventListener('animationend', handle);

    // Safety fallback in case animationend doesn't fire
    const fallback = setTimeout(handle, duration + 200);

    return () => {
      el.removeEventListener('animationend', handle);
      clearTimeout(fallback);
    };
    // Stable deps: id, duration, onComplete are stable per mount
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const positionStyle = getPositionStyle(position);

  return (
    <div
      ref={elRef}
      className="vfx-floating-text"
      style={{
        ...positionStyle,
        color,
        animationDuration: `${duration}ms`,
      }}
    >
      {text}
    </div>
  );
}

function getPositionStyle(position) {
  switch (position) {
    case 'player-hero':
      return { bottom: '12%', left: '50%', transform: 'translateX(-50%)' };
    case 'opponent-hero':
      return { top: '8%', left: '50%', transform: 'translateX(-50%)' };
    case 'center':
    default:
      return { top: '45%', left: '50%', transform: 'translateX(-50%)' };
  }
}
