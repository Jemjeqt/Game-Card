import React, { useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import ReactDOM from 'react-dom';
import vfxBus from '../../vfx/eventBus';
import { VFX_EVENTS } from '../../vfx/vfxEvents';
import { resolveVFXConfig } from '../../vfx/vfxAnimationMap';
import FloatingText from './FloatingText';
import ScreenEffect from './ScreenEffect';
import ParticleBurst from './ParticleBurst';
import OverlayEffect from './OverlayEffect';

/**
 * VFXLayer — Portal-based overlay that listens to the VFX event bus
 * and renders transient animation components.
 *
 * Architecture guarantees:
 *   1. VFX state is LOCAL to this component — never touches game stores.
 *   2. Event bus subscription uses a stable ref callback — no re-sub on render.
 *   3. Each animation is a keyed component that self-destructs on animationend.
 *   4. Uses useSyncExternalStore so the "external store" is our own anim queue,
 *      avoiding stale-closure issues with useEffect + setState.
 */

// ── External animation store (outside React) ─────────────────
let _animations = [];
let _listeners = new Set();

function getSnapshot() {
  return _animations;
}

function subscribe(listener) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function pushAnimation(anim) {
  _animations = [..._animations, anim];
  _listeners.forEach((l) => l());
}

function removeAnimation(id) {
  _animations = _animations.filter((a) => a.id !== id);
  _listeners.forEach((l) => l());
}

function clearAllAnimations() {
  _animations = [];
  _listeners.forEach((l) => l());
}

// ── Component ────────────────────────────────────────────────
export default function VFXLayer() {
  const animations = useSyncExternalStore(subscribe, getSnapshot);
  const portalRef = useRef(null);

  // Create portal container once
  useEffect(() => {
    let el = document.getElementById('vfx-portal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'vfx-portal';
      el.style.cssText = 'position:fixed;inset:0;z-index:9000;pointer-events:none;overflow:hidden;';
      document.body.appendChild(el);
    }
    portalRef.current = el;

    return () => {
      clearAllAnimations();
    };
  }, []);

  // Subscribe to ALL VFX events on the bus
  useEffect(() => {
    const allEvents = Object.values(VFX_EVENTS);
    const unsubs = allEvents.map((eventName) =>
      vfxBus.on(eventName, (payload) => {
        const config = resolveVFXConfig(eventName, payload);
        if (config) {
          pushAnimation(config);

          // Auto-cleanup after totalDuration
          setTimeout(() => removeAnimation(config.id), config.totalDuration + 300);
        }
      })
    );

    return () => unsubs.forEach((u) => u());
  }, []);  // Stable — runs once

  // Stable remove callback for child components
  const handleComplete = useCallback((id) => {
    removeAnimation(id);
  }, []);

  if (!portalRef.current) return null;

  return ReactDOM.createPortal(
    <>
      {animations.map((anim) => (
        <React.Fragment key={anim.id}>
          {/* Screen-level effect (flash / darken) */}
          {anim.screen && (
            <ScreenEffect
              id={`${anim.id}_screen`}
              type={anim.screen.type}
              duration={anim.screen.duration}
              color={anim.screen.color}
              intensity={anim.screen.intensity}
              onComplete={handleComplete}
            />
          )}

          {/* Center overlay effect */}
          {anim.overlay && (
            <OverlayEffect
              id={`${anim.id}_overlay`}
              type={anim.overlay.type}
              icon={anim.overlay.icon}
              name={anim.overlay.name}
              duration={anim.overlay.duration}
              onComplete={handleComplete}
            />
          )}

          {/* Floating text */}
          {anim.floatingText && (
            <FloatingText
              id={`${anim.id}_text`}
              text={anim.floatingText.text}
              color={anim.floatingText.color}
              position={anim.floatingText.position}
              duration={anim.floatingText.duration}
              onComplete={handleComplete}
            />
          )}

          {/* Particles */}
          {anim.particles && (
            <ParticleBurst
              id={`${anim.id}_particles`}
              color={anim.particles.color}
              count={anim.particles.count}
              spread={anim.particles.spread}
              duration={anim.particles.duration}
              onComplete={handleComplete}
            />
          )}
        </React.Fragment>
      ))}
    </>,
    portalRef.current
  );
}
