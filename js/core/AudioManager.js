/**
 * PROCEDURAL AUDIO SYNTHESIZER (WEB AUDIO API)
 * Menghasilkan efek suara mobil, klakson, diamond chime, dan UI secara prosedural
 * tanpa ketergantungan file audio eksternal yang rawan gagal dimuat.
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem("rafriel_portfolio_muted") === "true";
    this.masterGain = null;
    this.engineGain = null;
    this.engineOsc = null;
    this.engineFilter = null;
    this.isEngineRunning = false;
    this.isInitialized = false;

    // Drift / Tire Screech Audio Nodes
    this.driftOsc = null;
    this.driftGain = null;
    this.driftFilter = null;
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  }

  ensureContext() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("rafriel_portfolio_muted", String(this.isMuted));

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.85;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }

    return this.isMuted;
  }

  startEngine() {
    if (!this.ctx || this.isEngineRunning) return;
    try {
      // Create Engine Oscillator (Sawtooth modulated)
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = "sawtooth";
      this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime); // Base idle RPM

      // Lowpass filter to muffle harsh harmonics
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = "lowpass";
      this.engineFilter.frequency.setValueAtTime(260, this.ctx.currentTime);
      this.engineFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.engineOsc.start();
      this.isEngineRunning = true;
    } catch (e) {
      console.warn("startEngine error:", e);
    }
  }

  updateEngine(speed, maxSpeed) {
    if (!this.ctx || !this.isEngineRunning || !this.engineOsc || !this.engineFilter) return;

    const ratio = Math.min(Math.abs(speed) / maxSpeed, 1.0);
    const targetFreq = 48 + ratio * 95; // 48Hz idle up to 143Hz full throttle
    const filterFreq = 260 + ratio * 580;
    const targetVol = 0.08 + ratio * 0.12;

    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.08);
    this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.08);
  }

  // Efek suara decitan ban saat mobil drifting
  updateDriftSound(isDrifting, intensity = 0.5) {
    if (!this.ctx || !this.isInitialized || this.isMuted) return;

    if (isDrifting) {
      if (!this.driftOsc) {
        try {
          this.driftOsc = this.ctx.createOscillator();
          this.driftOsc.type = "sawtooth";
          this.driftOsc.frequency.setValueAtTime(540, this.ctx.currentTime);

          this.driftFilter = this.ctx.createBiquadFilter();
          this.driftFilter.type = "bandpass";
          this.driftFilter.frequency.setValueAtTime(850, this.ctx.currentTime);
          this.driftFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

          this.driftGain = this.ctx.createGain();
          this.driftGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

          this.driftOsc.connect(this.driftFilter);
          this.driftFilter.connect(this.driftGain);
          this.driftGain.connect(this.masterGain);
          this.driftOsc.start();
        } catch (e) {}
      }

      if (this.driftGain && this.ctx) {
        const targetVol = Math.min(0.14, 0.04 + intensity * 0.10);
        this.driftGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);
        if (this.driftOsc) {
          this.driftOsc.frequency.setTargetAtTime(520 + intensity * 260, this.ctx.currentTime, 0.08);
        }
      }
    } else {
      if (this.driftGain && this.ctx) {
        this.driftGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.06);
      }
    }
  }

  stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      }
      setTimeout(() => {
        if (this.engineOsc) {
          this.engineOsc.stop();
          this.engineOsc.disconnect();
          this.engineOsc = null;
        }
        this.isEngineRunning = false;
      }, 60);
    } catch (e) {}
  }

  // Dual-tone cheerful car horn (Beep-Beep!)
  playHorn() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const hornGain = this.ctx.createGain();

      osc1.type = "triangle";
      osc2.type = "sawtooth";

      // F chord harmonics (F4 ~ 349Hz, A4 ~ 440Hz)
      osc1.frequency.setValueAtTime(349.2, now);
      osc2.frequency.setValueAtTime(440.0, now);

      hornGain.gain.setValueAtTime(0.28, now);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc1.connect(hornGain);
      osc2.connect(hornGain);
      hornGain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch (e) {}
  }

  // Discovery Fanfare Sound (When finding a new zone for the first time)
  playDiscoverySound() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime(0.28, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.32);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.35);
      });
    } catch (e) {}
  }

  // Sparkling Diamond Collectible Chime
  playDiamondCollect(index = 0) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const baseNote = notes[index % notes.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(baseNote, now);
      osc.frequency.exponentialRampToValueAtTime(baseNote * 1.5, now + 0.35);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch (e) {}
  }

  // Interaction prompt open sound
  playInteractSound() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.08); // A5

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  // Reset / Respawn whoosh sound
  playResetSound() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch (e) {}
  }

  // Collision bump sound
  playBumpSound() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }
}
