/**
 * HUD & UI MANAGER
 * Menangani elemen HUD antarmuka permainan:
 * Speedometer, Counter Diamond, Pengumuman Zona (Zone Announcer),
 * Tombol navigasi kamera, klakson, reset, dan toggle suara.
 */

export class UIManager {
  constructor(game) {
    this.game = game;

    // Cache DOM Elements
    this.speedoVal = document.getElementById("speedoVal");
    this.diamondCount = document.getElementById("diamondCount");
    this.zoneAnnouncer = document.getElementById("zoneAnnouncer");
    this.zoneAnnouncerText = document.getElementById("zoneAnnouncerText");
    this.zoneAnnouncerCat = document.getElementById("zoneAnnouncerCat");
    
    this.camViewBtn = document.getElementById("camViewBtn");
    this.soundToggleBtn = document.getElementById("soundToggleBtn");
    this.resetBtn = document.getElementById("resetCarBtn");
    this.hornBtn = document.getElementById("hornBtn");
    this.portfolioMenuBtn = document.getElementById("portfolioMenuBtn");

    this.bindEvents();
  }

  bindEvents() {
    // 1. Zone Change Event
    window.addEventListener("zoneChanged", (e) => {
      const zone = e.detail.zone;
      this.updateZoneAnnouncer(zone);
    });

    // 2. Diamond Collected Event
    window.addEventListener("diamondCollected", (e) => {
      if (this.diamondCount) {
        this.diamondCount.textContent = e.detail.count;
      }
    });

    // 3. Camera Button Click
    if (this.camViewBtn) {
      this.camViewBtn.addEventListener("click", () => {
        const nextMode = this.game.cameraController.cycleMode();
        this.updateCameraBtnText(nextMode);
      });
    }

    // 4. Sound Toggle Click
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener("click", () => {
        const isMuted = this.game.audio.toggleMute();
        this.updateSoundBtn(isMuted);
      });
      // Initial state
      this.updateSoundBtn(this.game.audio.isMuted);
    }

    // 5. Reset Button Click
    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => {
        this.game.car.reset();
      });
    }

    // 6. Horn Button Click
    if (this.hornBtn) {
      this.hornBtn.addEventListener("click", () => {
        this.game.audio.playHorn();
      });
    }

    // 7. Zone Announcer Click to Interact
    if (this.zoneAnnouncer) {
      this.zoneAnnouncer.addEventListener("click", () => {
        this.game.triggerInteraction();
      });
    }
  }

  updateSpeedometer(speedKmh) {
    if (this.speedoVal) {
      this.speedoVal.textContent = speedKmh;
    }
  }

  updateZoneAnnouncer(zone) {
    if (!this.zoneAnnouncer) return;

    if (zone) {
      this.zoneAnnouncer.classList.add("visible");
      if (this.zoneAnnouncerText) this.zoneAnnouncerText.textContent = zone.name;
      if (this.zoneAnnouncerCat) this.zoneAnnouncerCat.textContent = zone.category;
    } else {
      this.zoneAnnouncer.classList.remove("visible");
    }
  }

  updateCameraBtnText(mode) {
    if (!this.camViewBtn) return;
    const labels = {
      isometric: "Kamera: Isometrik",
      chase: "Kamera: Belakang (Chase)",
      topdown: "Kamera: Atas (Top-Down)"
    };
    const span = this.camViewBtn.querySelector("span");
    if (span) span.textContent = labels[mode] || "Kamera";
  }

  updateSoundBtn(isMuted) {
    if (!this.soundToggleBtn) return;
    const icon = this.soundToggleBtn.querySelector("i");
    if (icon) {
      icon.className = isMuted ? "fa-solid fa-volume-xmark text-rose" : "fa-solid fa-volume-high text-cyan";
    }
  }
}
