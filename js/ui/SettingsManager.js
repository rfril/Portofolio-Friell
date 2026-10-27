/**
 * SETTINGS MANAGER
 * Mengelola dialog pengaturan game dalam antarmuka 3D:
 * - Sensitivitas putaran orbit kamera (slider, preset, dan invert Y)
 * - Tata kelola audio prosedural (volume master, toggle mute, tes suara klakson & chime)
 * - Persistensi pengaturan otomatis ke localStorage
 */

export class SettingsManager {
  constructor(cameraController, audioManager, stateManager) {
    this.cameraController = cameraController;
    this.audio = audioManager;
    this.state = stateManager;

    // DOM Elements
    this.backdrop = document.getElementById("settingsModalBackdrop");
    this.closeBtn = document.getElementById("settingsCloseBtn");
    this.saveBtn = document.getElementById("saveSettingsBtn");
    this.resetBtn = document.getElementById("resetSettingsBtn");

    this.camSensSlider = document.getElementById("camSensSlider");
    this.camSensValue = document.getElementById("camSensValue");
    this.invertYToggle = document.getElementById("invertYToggle");
    this.presetBtns = document.querySelectorAll(".btn-sens-preset");

    this.masterVolSlider = document.getElementById("masterVolSlider");
    this.masterVolValue = document.getElementById("masterVolValue");
    this.muteAudioToggle = document.getElementById("muteAudioToggle");
    this.testHornBtn = document.getElementById("testHornBtn");
    this.testChimeBtn = document.getElementById("testChimeBtn");

    this.openBtn = document.getElementById("settingsBtn");

    this.bindEvents();
    this.syncUIFromState();
  }

  bindEvents() {
    // Open modal button
    if (this.openBtn) {
      this.openBtn.addEventListener("click", () => this.open());
    }

    // Close buttons
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }
    if (this.saveBtn) {
      this.saveBtn.addEventListener("click", () => this.close());
    }

    // Click outside backdrop to close
    if (this.backdrop) {
      this.backdrop.addEventListener("click", (e) => {
        if (e.target === this.backdrop) this.close();
      });
    }

    // Camera Sensitivity Slider
    if (this.camSensSlider) {
      this.camSensSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        const factor = val / 100;
        if (this.cameraController) {
          this.cameraController.setSensitivity(factor);
        }
        if (this.camSensValue) {
          this.camSensValue.textContent = `${val}%`;
        }
        this.updatePresetButtons(factor);
      });
    }

    // Camera Invert Y Toggle
    if (this.invertYToggle) {
      this.invertYToggle.addEventListener("change", (e) => {
        if (this.cameraController) {
          this.cameraController.setInvertY(e.target.checked);
        }
      });
    }

    // Preset Buttons
    if (this.presetBtns) {
      this.presetBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const factor = parseFloat(btn.dataset.sens || "1.0");
          if (this.cameraController) {
            this.cameraController.setSensitivity(factor);
          }
          if (this.camSensSlider) {
            this.camSensSlider.value = Math.round(factor * 100);
          }
          if (this.camSensValue) {
            this.camSensValue.textContent = `${Math.round(factor * 100)}%`;
          }
          this.updatePresetButtons(factor);
        });
      });
    }

    // Audio Master Volume Slider
    if (this.masterVolSlider) {
      this.masterVolSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        const vol = val / 100;
        if (this.audio) {
          this.audio.setMasterVolume(vol);
          if (this.audio.isMuted && vol > 0) {
            this.audio.setMuted(false);
            if (this.muteAudioToggle) this.muteAudioToggle.checked = false;
          }
        }
        if (this.masterVolValue) {
          this.masterVolValue.textContent = `${val}%`;
        }
      });
    }

    // Mute Audio Toggle
    if (this.muteAudioToggle) {
      this.muteAudioToggle.addEventListener("change", (e) => {
        if (this.audio) {
          this.audio.setMuted(e.target.checked);
        }
      });
    }

    // Sound Test Buttons
    if (this.testHornBtn) {
      this.testHornBtn.addEventListener("click", () => {
        if (this.audio) {
          this.audio.ensureContext();
          this.audio.playHorn();
        }
      });
    }
    if (this.testChimeBtn) {
      this.testChimeBtn.addEventListener("click", () => {
        if (this.audio) {
          this.audio.ensureContext();
          this.audio.playDiamondCollectSound();
        }
      });
    }

    // Reset All Settings Button
    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => {
        this.resetToDefaults();
      });
    }

    // External Audio Event Sync
    window.addEventListener("muteChanged", (e) => {
      if (this.muteAudioToggle) {
        this.muteAudioToggle.checked = e.detail?.isMuted ?? false;
      }
    });

    window.addEventListener("volumeChanged", (e) => {
      const vol = e.detail?.volume ?? 0.85;
      if (this.masterVolSlider) this.masterVolSlider.value = Math.round(vol * 100);
      if (this.masterVolValue) this.masterVolValue.textContent = `${Math.round(vol * 100)}%`;
    });
  }

  syncUIFromState() {
    // Sync Camera
    if (this.cameraController) {
      const sens = this.cameraController.getSensitivity();
      const sensPercent = Math.round(sens * 100);
      if (this.camSensSlider) this.camSensSlider.value = sensPercent;
      if (this.camSensValue) this.camSensValue.textContent = `${sensPercent}%`;
      if (this.invertYToggle) this.invertYToggle.checked = this.cameraController.getInvertY();
      this.updatePresetButtons(sens);
    }

    // Sync Audio
    if (this.audio) {
      const vol = this.audio.getMasterVolume();
      const volPercent = Math.round(vol * 100);
      if (this.masterVolSlider) this.masterVolSlider.value = volPercent;
      if (this.masterVolValue) this.masterVolValue.textContent = `${volPercent}%`;
      if (this.muteAudioToggle) this.muteAudioToggle.checked = this.audio.isMuted;
    }
  }

  updatePresetButtons(factor) {
    if (!this.presetBtns) return;
    this.presetBtns.forEach((btn) => {
      const btnSens = parseFloat(btn.dataset.sens || "1.0");
      if (Math.abs(btnSens - factor) < 0.05) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  resetToDefaults() {
    if (this.cameraController) {
      this.cameraController.setSensitivity(1.0);
      this.cameraController.setInvertY(false);
    }
    if (this.audio) {
      this.audio.setMasterVolume(0.85);
      this.audio.setMuted(false);
    }
    this.syncUIFromState();
    if (this.audio) {
      this.audio.playResetSound();
    }
  }

  isOpen() {
    return this.backdrop?.classList.contains("visible") ?? false;
  }

  open() {
    this.syncUIFromState();
    if (this.backdrop) {
      this.backdrop.classList.add("visible");
    }
    if (this.audio) {
      this.audio.playInteractSound();
    }
  }

  close() {
    if (this.backdrop) {
      this.backdrop.classList.remove("visible");
    }
  }

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }
}
