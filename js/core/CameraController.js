/**
 * CAMERA CONTROLLER (INTERACTIVE DRAGGABLE ORBIT & AUTO-FOLLOW)
 * Mengendalikan kamera perspektif 3D dengan:
 * - Dukungan geser/putar kamera bebas (Orbit Mouse & Touch Drag 360 Derajat).
 * - Zoom in / Zoom out halus dengan mouse wheel atau gesture cubit.
 * - 3 Mode Sudut Pandang (Isometrik, Chase Cam, Top-Down).
 * - Peredaman dinamis (smooth lerp follow) mengikuti mobil ke mana pun melaju.
 * - Efek goyangan kamera (camera impact shake) saat benturan.
 */

import { CONFIG } from "./Config.js";

export class CameraController {
  constructor(camera, targetObject) {
    this.camera = camera;
    this.target = targetObject;
    this.mode = CONFIG.CAMERA.DEFAULT_MODE; // "isometric" | "chase" | "topdown"

    // Internal state positions
    this.currentPosition = new THREE.Vector3().copy(this.camera.position);
    this.currentTarget = new THREE.Vector3();

    // Interactive Orbit Drag States (Bisa digeser-geser oleh user!)
    this.orbitYaw = 0;      // Sudut putaran horizontal (radian)
    this.orbitPitch = 0;    // Sudut elevasi vertikal (radian)
    this.zoomScale = 1.0;   // Skala zoom kamera
    this.isDragging = false;
    this.lastPointerX = 0;
    this.lastPointerY = 0;

    this.shakeIntensity = 0;

    this.bindPointerEvents();
  }

  setTarget(target) {
    this.target = target;
  }

  setMode(modeName) {
    if (CONFIG.CAMERA.MODES[modeName]) {
      this.mode = modeName;
      this.camera.fov = CONFIG.CAMERA.MODES[modeName].fov;
      this.camera.updateProjectionMatrix();
    }
  }

  cycleMode() {
    const modes = ["isometric", "chase", "topdown"];
    const currentIndex = modes.indexOf(this.mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    this.setMode(nextMode);
    return nextMode;
  }

  triggerShake(intensity = 0.5) {
    this.shakeIntensity = Math.min(1.2, this.shakeIntensity + intensity);
  }

  bindPointerEvents() {
    // 1. Mouse Drag (Klik & Geser Layar untuk Mengubah Sudut Pandang)
    window.addEventListener("mousedown", (e) => {
      // Abaikan jika klik tombol UI, modal dialog, dsb
      const el = e.target?.closest ? e.target : e.target?.parentElement;
      if (
        el?.closest("button") ||
        el?.closest(".hud-pill") ||
        el?.closest(".project-modal-backdrop") ||
        el?.closest(".top-hud") ||
        el?.closest(".zone-announcer")
      ) {
        return;
      }
      this.isDragging = true;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.lastPointerX;
      const deltaY = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      this.orbitYaw -= deltaX * 0.007;
      this.orbitPitch -= deltaY * 0.005;

      // Batasi elevasi vertikal agar kamera tidak tembus ke bawah tanah atau terbalik
      this.orbitPitch = Math.max(-0.4, Math.min(0.8, this.orbitPitch));
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    // 2. Touch Drag (Usap layar smartphone / tablet untuk menggeser kamera)
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

        this.orbitYaw -= deltaX * 0.008;
        this.orbitPitch -= deltaY * 0.006;
        this.orbitPitch = Math.max(-0.4, Math.min(0.8, this.orbitPitch));
      },
      { passive: true }
    );

    window.addEventListener("touchend", () => {
      this.isDragging = false;
    });

    // 3. Mouse Wheel Zoom In / Out
    window.addEventListener(
      "wheel",
      (e) => {
        if (document.getElementById("projectModalBackdrop")?.classList.contains("visible")) return;
        this.zoomScale += e.deltaY * 0.001;
        this.zoomScale = Math.max(0.65, Math.min(1.65, this.zoomScale));
      },
      { passive: true }
    );
  }

  update(deltaTime, currentSpeed = 0) {
    if (!this.target) return;

    const modeConfig = CONFIG.CAMERA.MODES[this.mode];
    const targetPos = this.target.position;
    const targetRotY = this.target.rotation ? this.target.rotation.y : 0;

    let desiredPos = new THREE.Vector3();
    let lookAtPos = new THREE.Vector3();

    if (this.mode === "isometric") {
      // Jarak dasar isometrik dikalikan zoomScale
      const baseDistXZ = Math.hypot(modeConfig.offset.x, modeConfig.offset.z) * this.zoomScale;
      const baseHeight = modeConfig.offset.y * this.zoomScale;
      const defaultAngle = Math.atan2(modeConfig.offset.x, modeConfig.offset.z);

      // Gabungkan rotasi orbit manual pengguna (orbitYaw & orbitPitch)
      const totalYaw = defaultAngle + this.orbitYaw;
      const totalPitch = this.orbitPitch;
      const cosPitch = Math.cos(totalPitch);
      const sinPitch = Math.sin(totalPitch);

      desiredPos.set(
        targetPos.x + Math.sin(totalYaw) * (baseDistXZ * cosPitch),
        targetPos.y + baseHeight + (baseDistXZ * sinPitch),
        targetPos.z + Math.cos(totalYaw) * (baseDistXZ * cosPitch)
      );

      lookAtPos.set(
        targetPos.x + modeConfig.lookOffset.x,
        targetPos.y + modeConfig.lookOffset.y,
        targetPos.z + modeConfig.lookOffset.z
      );
    } else if (this.mode === "chase") {
      // Mode Chase: Belakang mobil dengan tambahan orbitYaw jika digeser
      const angle = targetRotY + Math.PI + this.orbitYaw;
      const dist = 16 * this.zoomScale;
      const height = (7.5 + this.orbitPitch * 8) * this.zoomScale;

      desiredPos.set(
        targetPos.x + Math.sin(angle) * dist,
        targetPos.y + Math.max(2.0, height),
        targetPos.z + Math.cos(angle) * dist
      );

      lookAtPos.set(
        targetPos.x - Math.sin(angle) * 5,
        targetPos.y + 1.8,
        targetPos.z - Math.cos(angle) * 5
      );
    } else if (this.mode === "topdown") {
      const height = modeConfig.offset.y * this.zoomScale;
      desiredPos.set(
        targetPos.x + Math.sin(this.orbitYaw) * 15,
        targetPos.y + height,
        targetPos.z + Math.cos(this.orbitYaw) * 15
      );
      lookAtPos.set(targetPos.x, targetPos.y, targetPos.z);
    }

    // Dynamic FOV berdasarkan kecepatan di chase mode
    if (this.mode === "chase") {
      const speedRatio = Math.min(Math.abs(currentSpeed) / 38.0, 1.0);
      const targetFov = 50 + speedRatio * 14;
      this.camera.fov += (targetFov - this.camera.fov) * 0.08;
      this.camera.updateProjectionMatrix();
    } else if (Math.abs(this.camera.fov - modeConfig.fov) > 0.1) {
      this.camera.fov += (modeConfig.fov - this.camera.fov) * 0.1;
      this.camera.updateProjectionMatrix();
    }

    // Smooth Lerp Camera Follow
    const damping = modeConfig.damping;
    this.currentPosition.lerp(desiredPos, damping);
    this.currentTarget.lerp(lookAtPos, damping);

    // Apply Camera Shake jika ada benturan
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
