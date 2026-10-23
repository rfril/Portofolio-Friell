/**
 * MOBILE / TOUCHSCREEN CONTROLS MANAGER
 * Menangani tombol kemudi sentuh (Belok Kiri, Belok Kanan, Gas, Rem, Klakson, Interaksi)
 * pada layar smartphone dan tablet.
 */

export class MobileControls {
  constructor(inputManager, game) {
    this.input = inputManager;
    this.game = game;

    this.touchLeft = document.getElementById("touchLeft");
    this.touchRight = document.getElementById("touchRight");
    this.touchGas = document.getElementById("touchGas");
    this.touchBrake = document.getElementById("touchBrake");
    this.touchHorn = document.getElementById("touchHorn");
    this.touchInteract = document.getElementById("touchInteract");

    this.initButtons();
  }

  initButtons() {
    const bindTouchBtn = (element, onStart, onEnd) => {
      if (!element) return;
      
      const start = (e) => {
        e.preventDefault();
        onStart();
      };

      const end = (e) => {
        e.preventDefault();
        onEnd();
      };

      element.addEventListener("touchstart", start, { passive: false });
      element.addEventListener("touchend", end, { passive: false });
      element.addEventListener("touchcancel", end, { passive: false });
      element.addEventListener("mousedown", start);
      element.addEventListener("mouseup", end);
      element.addEventListener("mouseleave", end);
    };

    // Steering
    bindTouchBtn(
      this.touchLeft,
      () => this.input.setTouchLeft(true),
      () => this.input.setTouchLeft(false)
    );

    bindTouchBtn(
      this.touchRight,
      () => this.input.setTouchRight(true),
      () => this.input.setTouchRight(false)
    );

    // Throttle / Brake
    bindTouchBtn(
      this.touchGas,
      () => this.input.setTouchForward(true),
      () => this.input.setTouchForward(false)
    );

    bindTouchBtn(
      this.touchBrake,
      () => this.input.setTouchBackward(true),
      () => this.input.setTouchBackward(false)
    );

    // Horn
    if (this.touchHorn) {
      this.touchHorn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.game.audio.playHorn();
      });
      this.touchHorn.addEventListener("click", () => {
        this.game.audio.playHorn();
      });
    }

    // Interact [E]
    if (this.touchInteract) {
      this.touchInteract.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.game.triggerInteraction();
      });
      this.touchInteract.addEventListener("click", () => {
        this.game.triggerInteraction();
      });
    }
  }
}
