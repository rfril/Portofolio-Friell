/**
 * CAMERA CONTROLLER
 * Mengendalikan kamera perspektif 3D dengan 3 mode (Isometrik, Chase, Top-Down),
 * peredaman dinamis (smooth lerp), dan penyesuaian FOV berbasis kecepatan.
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
    
    this.shakeIntensity = 0;
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

  update(deltaTime, currentSpeed = 0) {
    if (!this.target) return;

    const modeConfig = CONFIG.CAMERA.MODES[this.mode];
    const targetPos = this.target.position;
    const targetRotY = this.target.rotation ? this.target.rotation.y : 0;

    let desiredPos = new THREE.Vector3();
    let lookAtPos = new THREE.Vector3();

    if (this.mode === "isometric") {
      desiredPos.set(
        targetPos.x + modeConfig.offset.x,
        targetPos.y + modeConfig.offset.y,
        targetPos.z + modeConfig.offset.z
      );
      lookAtPos.set(
        targetPos.x + modeConfig.lookOffset.x,
        targetPos.y + modeConfig.lookOffset.y,
        targetPos.z + modeConfig.lookOffset.z
      );
    } else if (this.mode === "chase") {
      // Offset relatif terhadap rotasi yaw mobil
      const angle = targetRotY + Math.PI; // Belakang mobil
      const dist = 16;
      const height = 7.5;

      desiredPos.set(
        targetPos.x + Math.sin(angle) * dist,
        targetPos.y + height,
        targetPos.z + Math.cos(angle) * dist
      );

      lookAtPos.set(
        targetPos.x - Math.sin(angle) * 5,
        targetPos.y + 1.8,
        targetPos.z - Math.cos(angle) * 5
      );
    } else if (this.mode === "topdown") {
      desiredPos.set(
        targetPos.x,
        targetPos.y + modeConfig.offset.y,
        targetPos.z + modeConfig.offset.z
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

    // Smooth Lerp Camera Position
    const damping = modeConfig.damping;
    this.currentPosition.lerp(desiredPos, damping);
    this.currentTarget.lerp(lookAtPos, damping);

    // Apply Camera Shake jika ada tumbukan
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
