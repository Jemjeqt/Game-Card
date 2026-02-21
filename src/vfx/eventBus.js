/**
 * EventBus — Lightweight pub/sub singleton for decoupling game logic from VFX.
 *
 * Design principles:
 *   - Pure JavaScript, zero React dependency
 *   - Synchronous emit (listeners run in the same tick)
 *   - Stable references: subscribe returns an unsubscribe function
 *   - No game state mutation: listeners should only trigger visuals
 */

class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} callback
   * @returns {() => void} unsubscribe function
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);

    // Return stable unsubscribe
    return () => {
      const set = this._listeners.get(event);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this._listeners.delete(event);
      }
    };
  }

  /**
   * Emit an event with a payload.
   * @param {string} event
   * @param {*} payload
   */
  emit(event, payload) {
    const set = this._listeners.get(event);
    if (!set) return;
    for (const cb of set) {
      try {
        cb(payload);
      } catch (err) {
        console.error(`[EventBus] Error in listener for "${event}":`, err);
      }
    }
  }

  /** Remove all listeners (useful for hot-reload / cleanup). */
  clear() {
    this._listeners.clear();
  }
}

// Singleton
const vfxBus = new EventBus();
export default vfxBus;
