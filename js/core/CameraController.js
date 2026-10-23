/**
 * CAMERA CONTROLLER (ARCADE VEHICLE CHASE & 360° FREE-LOOK ORBIT)
 * Mengendalikan kamera perspektif 3D dengan:
 * - Sudut Pandang Utama (Chase Cam): Berada di belakang mobil dengan ketinggian proporsional & pandangan jauh ke depan jalan.
 * - Orbit 360° Bebas: Klik/drag mouse atau usap layar sentuh untuk melihat seluruh sudut kota & baliho secara leluasa.
 * - Smart Auto-Recenter: Kamera otomatis menyelaraskan kembali ke belakang mobil saat mulai melaju.
 * - Dynamic Angular Tracking: Melacak sudut putaran mobil tanpa distorsi jarak (anti distance-pumping / anti mual).
 * - Dynamic FOV: Bidang pandang melebar dinamis saat melaju kencang untuk sensasi kecepatan arcade.
 * - Mode Kamera Lengkap: Chase (Default), Sinematik Luas, Isometrik Kota, dan Peta Top-Down.
 */

import { CONFIG } from "./Config.js";

export class CameraController {
  constructor(camera, targetObject) {
    this.camera = camera;
    this.target = targetObject;
    this.mode = CONFIG.CAMERA.DEFAULT_MODE || "chase";

    // Internal state positions
    this.currentPosition = new THREE.Vector3().copy(this.camera.position);
    this.currentTarget = new THREE.Vector3();

    // Smoothed angular heading behind car (prevent distance shrink during drift/turns)
    this.smoothedYaw = Math.PI; // Inisialisasi awal di belakang mobil (mobil menghadap +Z)
    this.smoothedDist = 11.8;
    this.smoothedHeight = 3.8;

    // Interactive Free-Look Orbit Drag States
    this.orbitYaw = 0;       // Sudut putaran horizontal manual (radian)
    this.orbitPitch = 0;     // Sudut elevasi vertikal manual (radian)
    this.zoomScale = 1.0;    // Skala zoom kamera
    this.isDragging = false;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.dragIdleTimer = 0;  // Waktu sejak pemain selesai menggeser kamera

    this.shakeIntensity = 0;

    this.bindPointerEvents();
  }

  setTarget(target) {
    this.target = target;
    if (this.target && this.target.rotation) {
      this.smoothedYaw = this.target.rotation.y + Math.PI;
    }
  }

  setMode(modeName) {
    if (CONFIG.CAMERA.MODES[modeName]) {
      this.mode = modeName;
      this.camera.fov = CONFIG.CAMERA.MODES[modeName].fov;
      this.camera.updateProjectionMatrix();
      this.resetOrbit();
    }
  }

  cycleMode() {
    const modes = ["chase", "cinematic", "isometric", "topdown"];
    const currentIndex = modes.indexOf(this.mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    this.setMode(nextMode);
    return nextMode;
  }

  resetOrbit() {
    this.orbitYaw = 0;
    this.orbitPitch = 0;
    this.dragIdleTimer = 0;
  }

  triggerShake(intensity = 0.5) {
    this.shakeIntensity = Math.min(1.2, this.shakeIntensity + intensity);
  }

  bindPointerEvents() {
    // 0. Cegah menu konteks klik kanan browser di area canvas 3D
    window.addEventListener("contextmenu", (e) => {
      const el = e.target?.closest ? e.target : e.target?.parentElement;
      if (el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.closest("input") || el?.closest("textarea")) {
        return;
      }
      e.preventDefault();
      return false;
    });

    // 1. Mouse Drag (Klik Kiri, Klik Tengah, maupun Klik Kanan untuk Melihat Sekitar)
    window.addEventListener("mousedown", (e) => {
      const el = e.target?.closest ? e.target : e.target?.parentElement;
      if (
        el?.closest("button") ||
        el?.closest(".hud-pill") ||
        el?.closest(".project-modal-backdrop") ||
        el?.closest(".top-hud") ||
        el?.closest(".zone-announcer") ||
        el?.closest(".touch-controls-layer") ||
        el?.tagName === "INPUT" ||
        el?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Middle click: Reset orbit ke belakang mobil langsung
      if (e.button === 1) {
        e.preventDefault();
        this.resetOrbit();
        return;
      }

      if (e.button === 2) {
        e.preventDefault();
      }

      this.isDragging = true;
      this.dragIdleTimer = 0;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.lastPointerX;
      const deltaY = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      // Geser kamera secara intuitif & presisi
      this.orbitYaw -= deltaX * 0.0075;
      this.orbitPitch -= deltaY * 0.0065;

      // Batasi sudut elevasi pitch (-0.95 radian ~ -55° memungkinkan mendongak penuh ke langit dan gedung tinggi)
      this.orbitPitch = Math.max(-0.95, Math.min(0.70, this.orbitPitch));
    });

    window.addEventListener("mouseup", (e) => {
      this.isDragging = false;
      this.dragIdleTimer = 0;
    });

    // Double Click: Reset sudut kamera langsung ke tengah
    window.addEventListener("dblclick", (e) => {
      const el = e.target?.closest ? e.target : e.target?.parentElement;
      if (el?.closest("button") || el?.closest(".project-modal-backdrop")) return;
      this.resetOrbit();
    });

    // 2. Touch Drag (Usap layar smartphone / tablet untuk melihat sekeliling)
    window.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          const el = touch.target?.closest ? touch.target : touch.target?.parentElement;
          if (
            el?.closest("button") ||
            el?.closest(".touch-btn") ||
            el?.closest(".hud-pill") ||
            el?.closest(".project-modal-backdrop")
          ) {
            return;
          }
          this.isDragging = true;
          this.dragIdleTimer = 0;
          this.lastPointerX = touch.clientX;
          this.lastPointerY = touch.clientY;
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      (e) => {
        if (!this.isDragging || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.lastPointerX;
        const deltaY = touch.clientY - this.lastPointerY;
        this.lastPointerX = touch.clientX;
        this.lastPointerY = touch.clientY;

        this.orbitYaw -= deltaX * 0.0085;
        this.orbitPitch -= deltaY * 0.0075;
        this.orbitPitch = Math.max(-0.95, Math.min(0.70, this.orbitPitch));
      },
      { passive: true }
    );

    window.addEventListener("touchend", () => {
      this.isDragging = false;
      this.dragIdleTimer = 0;
    });

    // 3. Mouse Wheel Zoom In / Out
    window.addEventListener(
      "wheel",
      (e) => {
        if (document.getElementById("projectModalBackdrop")?.classList.contains("visible")) return;
        this.zoomScale += e.deltaY * 0.001;
        this.zoomScale = Math.max(0.75, Math.min(1.45, this.zoomScale));
      },
      { passive: true }
    );
  }

  update(deltaTime, currentSpeed = 0) {
    if (!this.target) return;

    const modeConfig = CONFIG.CAMERA.MODES[this.mode] || CONFIG.CAMERA.MODES.chase;
    const targetPos = this.target.position;
    const targetRotY = this.target.rotation ? this.target.rotation.y : 0;
    const absSpeed = Math.abs(currentSpeed);

    // =========================================================================
    // SMART AUTO-RECENTER
    // =========================================================================
    // Jika pemain tidak sedang menggeser mouse:
    // a. Saat mobil melaju kencang (> 2.5 m/s): perlahan selaraskan kamera kembali ke belakang
    // b. Saat mobil berhenti: berikan jeda 3 detik agar pemain bebas mengamati baliho/gedung
    if (!this.isDragging) {
      this.dragIdleTimer += deltaTime;
      if (absSpeed > 2.5) {
        const recenterSpeed = Math.min(1.0, (2.8 + absSpeed * 0.05) * deltaTime);
        this.orbitYaw += (0 - this.orbitYaw) * recenterSpeed;
        this.orbitPitch += (0 - this.orbitPitch) * recenterSpeed;
      } else if (this.dragIdleTimer > 3.0) {
        const gentleRecenter = Math.min(1.0, 1.2 * deltaTime);
        this.orbitYaw += (0 - this.orbitYaw) * gentleRecenter;
        this.orbitPitch += (0 - this.orbitPitch) * gentleRecenter;
      }
    }

    let desiredPos = new THREE.Vector3();
    let lookAtPos = new THREE.Vector3();

    // =========================================================================
    // MODE 1 & 2: CHASE (DEFAULT) & CINEMATIC DRIVING
    // =========================================================================
    if (this.mode === "chase" || this.mode === "cinematic") {
      const isCinematic = this.mode === "cinematic";
      const baseDist = (modeConfig.dist || (isCinematic ? 17.5 : 11.8)) * this.zoomScale;
      const baseHeight = (modeConfig.height || (isCinematic ? 6.5 : 3.8)) * this.zoomScale;
      const lookAheadDist = modeConfig.lookAhead || (isCinematic ? 20.0 : 14.0);

      // Target angle di belakang mobil (mobil menghadap +Z saat rotasi 0)
      const targetAngle = targetRotY + Math.PI;

      // Smooth Angular Follow menggunakan busur terpendek (Mencegah chord-cutting / mual)
      let angleDiff = targetAngle - this.smoothedYaw;
      angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

      // Respon kamera lebih dinamis saat berbelok atau melaju kencang
      const followRate = absSpeed > 1.0 ? 8.5 : 5.0;
      this.smoothedYaw += angleDiff * Math.min(1.0, followRate * deltaTime);

      // Gabungkan dengan Free-Look Orbit
      const effectiveYaw = this.smoothedYaw + this.orbitYaw;
      const effectivePitch = this.orbitPitch;

      // Vehicle target center (~0.95m above ground)
      const targetCenterY = targetPos.y + 0.95;
      const minCamHeight = 0.42; // Batas aman di atas aspal (0.02) dan trotoar (0.25)

      // Dynamic Speed Distance & FOV
      const speedRatio = Math.min(absSpeed / 42.0, 1.0);
      const dynamicDist = baseDist + (isCinematic ? speedRatio * 3.0 : speedRatio * 2.0);

      // =======================================================================
      // GROUND CLAMP & PROXIMITY COMPRESSION
      // Saat pemain mendongak ke atas langit (effectivePitch < 0):
      // Kamera semakin mendekat ke mobil dan tertahan aman di atas aspal tanpa menembus jalan!
      // =======================================================================
      let compressionFactor = 1.0;
      if (effectivePitch < 0) {
        const pitchRatio = Math.min(1.0, -effectivePitch / 0.95);
        // Menekan jarak dari 100% turun hingga ~30% saat mendongak maksimal
        compressionFactor = Math.max(0.28, 1.0 - pitchRatio * 0.72);
      }

      const finalDist = dynamicDist * compressionFactor;
      const groundDist = finalDist * Math.cos(Math.max(-0.35, effectivePitch));

      // Hitung ketinggian kamera di dunia 3D (terjaga presisi di atas minCamHeight)
      const rawYOffset = (baseHeight - 0.95) + effectivePitch * 5.8;
      const camY = Math.max(minCamHeight, targetCenterY + rawYOffset * compressionFactor);

      desiredPos.set(
        targetPos.x + Math.sin(effectiveYaw) * groundDist,
        camY,
        targetPos.z + Math.cos(effectiveYaw) * groundDist
      );

      // Titik bidik (Look-At):
      // Melihat jauh ke depan di jalan raya dan terangkat tinggi ke langit saat mendongakkan kamera
      const lookDirYaw = effectiveYaw + Math.PI;
      const lookY = targetCenterY + 0.45 - effectivePitch * 24.0;

      lookAtPos.set(
        desiredPos.x + Math.sin(lookDirYaw) * (finalDist + lookAheadDist),
        lookY,
        desiredPos.z + Math.cos(lookDirYaw) * (finalDist + lookAheadDist)
      );

      // Dynamic FOV saat melaju kencang
      const targetFov = modeConfig.fov + speedRatio * 10;
      this.camera.fov += (targetFov - this.camera.fov) * Math.min(1.0, 6.0 * deltaTime);
      this.camera.updateProjectionMatrix();

    } else if (this.mode === "isometric") {
      // =========================================================================
      // MODE 3: ISOMETRIC (KOTA 3D PERSPEKTIF BIRD'S EYE)
      // =========================================================================
      const baseDistXZ = Math.hypot(modeConfig.offset.x, modeConfig.offset.z) * this.zoomScale;
      const baseHeight = modeConfig.offset.y * this.zoomScale;
      const defaultAngle = Math.atan2(modeConfig.offset.x, modeConfig.offset.z);

      const totalYaw = defaultAngle + this.orbitYaw;
      const cosPitch = Math.cos(this.orbitPitch);
      const sinPitch = Math.sin(this.orbitPitch);

      desiredPos.set(
        targetPos.x + Math.sin(totalYaw) * (baseDistXZ * cosPitch),
        targetPos.y + Math.max(8.0, baseHeight + baseDistXZ * sinPitch),
        targetPos.z + Math.cos(totalYaw) * (baseDistXZ * cosPitch)
      );

      lookAtPos.set(
        targetPos.x + modeConfig.lookOffset.x,
        targetPos.y + modeConfig.lookOffset.y,
        targetPos.z + modeConfig.lookOffset.z
      );

      if (Math.abs(this.camera.fov - modeConfig.fov) > 0.1) {
        this.camera.fov += (modeConfig.fov - this.camera.fov) * 0.1;
        this.camera.updateProjectionMatrix();
      }

    } else if (this.mode === "topdown") {
      // =========================================================================
      // MODE 4: TOP-DOWN (PETA NAVIGASI KOTA DARI ATAS)
      // =========================================================================
      const height = modeConfig.offset.y * this.zoomScale;
      desiredPos.set(
        targetPos.x + Math.sin(this.orbitYaw) * 10,
        targetPos.y + height,
        targetPos.z + Math.cos(this.orbitYaw) * 10
      );
      lookAtPos.set(targetPos.x, targetPos.y, targetPos.z);

      if (Math.abs(this.camera.fov - modeConfig.fov) > 0.1) {
        this.camera.fov += (modeConfig.fov - this.camera.fov) * 0.1;
        this.camera.updateProjectionMatrix();
      }
    }

    // Smooth Lerp Camera Position & Target Focus
    const damping = modeConfig.damping || 0.12;
    const lerpFactor = Math.min(1.0, damping * (deltaTime / 0.016));
    this.currentPosition.lerp(desiredPos, lerpFactor);
    this.currentTarget.lerp(lookAtPos, lerpFactor);

    // Apply Camera Shake saat benturan batas kota
    if (this.shakeIntensity > 0.01) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      const shakeZ = (Math.random() - 0.5) * this.shakeIntensity;
      this.currentPosition.add(new THREE.Vector3(shakeX, shakeY, shakeZ));
      this.shakeIntensity *= 0.88;
    } else {
      this.shakeIntensity = 0;
    }

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentTarget);
  }
}
