/**
 * GAME STATE MANAGER
 * Mengelola siklus status game dan mencegah konflik input antarkondisi
 */

export const GameStates = {
  LOADING: "LOADING",
  MENU: "MENU",
  PLAYING: "PLAYING",
  INTERACTING: "INTERACTING", // Saat membuka panel proyek / timeline
  PAUSED: "PAUSED",
  FALLBACK: "FALLBACK" // Mode Web Dokumen Biasa jika WebGL tidak aktif
};

export class StateManager {
  constructor(initialState = GameStates.LOADING) {
    this.currentState = initialState;
    this.previousState = null;
    this.listeners = new Map();
  }

  getState() {
    return this.currentState;
  }

  is(state) {
    return this.currentState === state;
  }

  isPlaying() {
    return this.currentState === GameStates.PLAYING;
  }

  canDrive() {
    return this.currentState === GameStates.PLAYING;
  }

  setState(newState, payload = null) {
    if (this.currentState === newState) return;
    
    this.previousState = this.currentState;
    this.currentState = newState;

    const eventData = {
      from: this.previousState,
      to: this.currentState,
      payload
    };

    // Emit to specific state listeners
    if (this.listeners.has(newState)) {
      this.listeners.get(newState).forEach(cb => cb(eventData));
    }

    // Emit to global change listeners
    if (this.listeners.has("*")) {
      this.listeners.get("*").forEach(cb => cb(eventData));
    }
  }

  on(state, callback) {
    if (!this.listeners.has(state)) {
      this.listeners.set(state, new Set());
    }
    this.listeners.get(state).add(callback);

    // Return unsubscriber function
    return () => {
      this.listeners.get(state)?.delete(callback);
    };
  }
}
