/**
 * INPUT MANAGER
 * Menangani input keyboard desktop, mouse, dan kontrol sentuh mobile
 * dengan abstraksi aksi independen dari perangkat keras.
 */

export class InputManager {
  constructor(stateManager) {
    this.stateManager = stateManager;

    // Raw key states
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false,
      interact: false,
      reset: false,
      camera: false,
      horn: false,
      portfolio: false,
      escape: false
    };

    // Virtual mobile/touch overrides
    this.touchInputs = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      steerAxis: 0, // -1 (left) to 1 (right)
      throttleAxis: 0 // -1 (brake/rev) to 1 (gas)
    };

    // Key event callbacks (one-shot actions)
    this.actionListeners = new Map();

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener("keydown", (e) => this.onKeyDown(e));
    window.addEventListener("keyup", (e) => this.onKeyUp(e));
  }

  onKeyDown(e) {
    // Abaikan jika fokus pada input form/textarea
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    const key = e.key.toLowerCase();

    // Prevent default browser scrolling on arrow keys and spacebar
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
      e.preventDefault();
    }

    // Movement keys
    if (key === "w" || key === "arrowup") this.keys.forward = true;
    if (key === "s" || key === "arrowdown") this.keys.backward = true;
    if (key === "a" || key === "arrowleft") this.keys.left = true;
    if (key === "d" || key === "arrowright") this.keys.right = true;
    if (key === " ") this.keys.brake = true;

    // One-shot triggers
    if (key === "e") this.triggerAction("interact");
    if (key === "r") this.triggerAction("reset");
    if (key === "c") this.triggerAction("camera");
    if (key === "h") this.triggerAction("horn");
    if (key === "p") this.triggerAction("portfolio");
    if (key === "escape") this.triggerAction("escape");
  }

  onKeyUp(e) {
    const key = e.key.toLowerCase();

    if (key === "w" || key === "arrowup") this.keys.forward = false;
    if (key === "s" || key === "arrowdown") this.keys.backward = false;
    if (key === "a" || key === "arrowleft") this.keys.left = false;
    if (key === "d" || key === "arrowright") this.keys.right = false;
    if (key === " ") this.keys.brake = false;
  }

  onAction(action, callback) {
    if (!this.actionListeners.has(action)) {
      this.actionListeners.set(action, new Set());
    }
    this.actionListeners.get(action).add(callback);
    return () => this.actionListeners.get(action)?.delete(callback);
  }

  triggerAction(action) {
    if (this.actionListeners.has(action)) {
      this.actionListeners.get(action).forEach(cb => cb());
    }
  }

  // Get active steering input [-1, 1]
  getSteering() {
    if (!this.stateManager.canDrive()) return 0;

    let steer = 0;
    if (this.keys.left) steer -= 1;
    if (this.keys.right) steer += 1;

    // Gabungkan dengan touch axis jika ada
    if (Math.abs(this.touchInputs.steerAxis) > 0.05) {
      steer = this.touchInputs.steerAxis;
    } else {
      if (this.touchInputs.left) steer -= 1;
      if (this.touchInputs.right) steer += 1;
    }

    return Math.max(-1, Math.min(1, steer));
  }

  // Get active throttle/brake input [-1, 1]
  getThrottle() {
    if (!this.stateManager.canDrive()) return 0;

    let throttle = 0;
    if (this.keys.forward) throttle += 1;
    if (this.keys.backward) throttle -= 1;

    if (Math.abs(this.touchInputs.throttleAxis) > 0.05) {
      throttle = this.touchInputs.throttleAxis;
    } else {
      if (this.touchInputs.forward) throttle += 1;
      if (this.touchInputs.backward) throttle -= 1;
    }

    return Math.max(-1, Math.min(1, throttle));
  }

  isBraking() {
    if (!this.stateManager.canDrive()) return true;
    return this.keys.brake;
  }

  // Mobile virtual controls setters
  setTouchForward(val) { this.touchInputs.forward = !!val; }
  setTouchBackward(val) { this.touchInputs.backward = !!val; }
  setTouchLeft(val) { this.touchInputs.left = !!val; }
  setTouchRight(val) { this.touchInputs.right = !!val; }
  setTouchAxes(steer, throttle) {
    this.touchInputs.steerAxis = steer;
    this.touchInputs.throttleAxis = throttle;
  }
}
