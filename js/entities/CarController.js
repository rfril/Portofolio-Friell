/**
 * TOY CAR VEHICLE CONTROLLER
 * Kinematika kendaraan mainan fisika ala Bruno Simon:
 * Akselerasi, pengereman, kemudi responsif dengan peredaman, suspensi body roll & pitch,
 * rotasi 4 roda, lampu depan bercahaya, dan penanganan pantulan batas dunia.
 */

import { CONFIG } from "../core/Config.js";

export class CarController {
  constructor(scene, inputManager, audioManager, particleSystem) {
    this.scene = scene;
    this.input = inputManager;
    this.audio = audioManager;
    this.particles = particleSystem;

    // Kinematic states
    this.speed = 0;
    this.steerAngle = 0;
    this.lateralSlip = 0;
    this.isBraking = false;

    // Visual references
    this.mesh = new THREE.Group();
    this.bodyGroup = new THREE.Group();
    this.frontLeftWheel = null;
    this.frontRightWheel = null;
    this.rearLeftWheel = null;
    this.rearRightWheel = null;
    this.tailLightMat = null;
    this.headLightLeft = null;
    this.headLightRight = null;

    // Collision boundary radius
    this.colliderRadius = 1.6;

    this.buildCarModel();
    this.scene.add(this.mesh);

    // Initial position
    this.reset(false);
  }

  buildCarModel() {
    this.mesh.add(this.bodyGroup);

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant Cyan Blue
      metalness: 0.35,
      roughness: 0.25
    });

    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Dark Obsidian
      metalness: 0.8,
      roughness: 0.15
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Gold/Amber accent
      metalness: 0.5,
      roughness: 0.3
    });

    const wheelRubberMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.2
    });

    const lightGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.tailLightMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      emissive: 0x991b1b,
      emissiveIntensity: 0.5
    });

    // 1. Lower Chassis
    const chassisGeo = new THREE.BoxGeometry(2.1, 0.45, 3.8);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.55;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    this.bodyGroup.add(chassis);

    // 2. Cabin / Windshield
    const cabinGeo = new THREE.BoxGeometry(1.65, 0.65, 1.9);
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.05, -0.2);
    cabin.castShadow = true;
    this.bodyGroup.add(cabin);

    // 3. Racing Spoiler Wing (Rear)
    const spoilerGeo = new THREE.BoxGeometry(1.8, 0.08, 0.45);
    const spoiler = new THREE.Mesh(spoilerGeo, accentMat);
    spoiler.position.set(0, 1.15, -1.65);
    spoiler.castShadow = true;
    this.bodyGroup.add(spoiler);

    const pillarLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.1), accentMat);
    pillarLeft.position.set(-0.65, 0.95, -1.65);
    this.bodyGroup.add(pillarLeft);

    const pillarRight = pillarLeft.clone();
    pillarRight.position.x = 0.65;
    this.bodyGroup.add(pillarRight);

    // 4. Headlights & Spotlights
    const headGeo = new THREE.BoxGeometry(0.35, 0.18, 0.1);
    const headLeft = new THREE.Mesh(headGeo, lightGlowMat);
    headLeft.position.set(-0.7, 0.6, 1.92);
    this.bodyGroup.add(headLeft);

    const headRight = headLeft.clone();
    headRight.position.x = 0.7;
    this.bodyGroup.add(headRight);

    // Front Light Cones
    const spotLeft = new THREE.SpotLight(0xfffaed, 0.85, 24, Math.PI / 6, 0.4, 1.2);
    spotLeft.position.set(-0.7, 0.6, 1.95);
    spotLeft.target.position.set(-0.7, 0, 12);
    this.bodyGroup.add(spotLeft);
    this.bodyGroup.add(spotLeft.target);

    const spotRight = spotLeft.clone();
    spotRight.position.x = 0.7;
    spotRight.target.position.x = 0.7;
    this.bodyGroup.add(spotRight);
    this.bodyGroup.add(spotRight.target);

    // 5. Taillights (Glow red when braking)
    const tailGeo = new THREE.BoxGeometry(0.4, 0.15, 0.08);
    const tailLeft = new THREE.Mesh(tailGeo, this.tailLightMat);
    tailLeft.position.set(-0.7, 0.6, -1.92);
    this.bodyGroup.add(tailLeft);

    const tailRight = tailLeft.clone();
    tailRight.position.x = 0.7;
    this.bodyGroup.add(tailRight);

    // 6. Wheels Factory Helper
    const createWheel = () => {
      const wheelGroup = new THREE.Group();
      const tireGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 16);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, wheelRubberMat);
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.34, 12);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheelGroup.add(rim);

      return wheelGroup;
    };

    // Front Wheels
    this.frontLeftPivot = new THREE.Group();
    this.frontLeftPivot.position.set(-1.12, 0.42, 1.15);
    this.frontLeftWheel = createWheel();
    this.frontLeftPivot.add(this.frontLeftWheel);
    this.mesh.add(this.frontLeftPivot);

    this.frontRightPivot = new THREE.Group();
    this.frontRightPivot.position.set(1.12, 0.42, 1.15);
    this.frontRightWheel = createWheel();
    this.frontRightPivot.add(this.frontRightWheel);
    this.mesh.add(this.frontRightPivot);

    // Rear Wheels
    this.rearLeftWheel = createWheel();
    this.rearLeftWheel.position.set(-1.12, 0.42, -1.15);
    this.mesh.add(this.rearLeftWheel);

    this.rearRightWheel = createWheel();
    this.rearRightWheel.position.set(1.12, 0.42, -1.15);
    this.mesh.add(this.rearRightWheel);
  }

  reset(playSound = true) {
    this.mesh.position.set(
      CONFIG.CAR.RESPAWN_POSITION.x,
      CONFIG.CAR.RESPAWN_POSITION.y,
      CONFIG.CAR.RESPAWN_POSITION.z
    );
    this.mesh.rotation.set(0, CONFIG.CAR.RESPAWN_ROTATION, 0);
    this.speed = 0;
    this.steerAngle = 0;
    this.lateralSlip = 0;
    if (playSound && this.audio) {
      this.audio.playResetSound();
    }
  }

  update(deltaTime) {
    const throttle = this.input.getThrottle();
    const steerInput = this.input.getSteering();
    const handbrake = this.input.isBraking();

    // 1. Steering Dynamics
    const targetSteerAngle = -steerInput * CONFIG.CAR.STEER_MAX_ANGLE;
    this.steerAngle += (targetSteerAngle - this.steerAngle) * Math.min(1.0, CONFIG.CAR.STEER_SPEED * deltaTime * 6);

    // Front wheels visual steer rotation
    if (this.frontLeftPivot && this.frontRightPivot) {
      this.frontLeftPivot.rotation.y = this.steerAngle;
      this.frontRightPivot.rotation.y = this.steerAngle;
    }

    // 2. Acceleration / Deceleration
    this.isBraking = handbrake || (this.speed > 0.5 && throttle < -0.1) || (this.speed < -0.5 && throttle > 0.1);

    if (throttle > 0) {
      // Forward gas
      this.speed += throttle * CONFIG.CAR.ACCELERATION * deltaTime;
      if (this.speed > CONFIG.CAR.MAX_SPEED_FORWARD) {
        this.speed = CONFIG.CAR.MAX_SPEED_FORWARD;
      }
      // Emit exhaust smoke when accelerating forward
      if (this.particles && Math.random() < 0.4) {
        const exhaustPos = this.mesh.position.clone();
        exhaustPos.y += 0.35;
        const forwardDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
        this.particles.emitExhaust(exhaustPos, forwardDir);
      }
    } else if (throttle < 0) {
      // Reverse / Brake
      this.speed += throttle * CONFIG.CAR.ACCELERATION * 0.7 * deltaTime;
      if (this.speed < -CONFIG.CAR.MAX_SPEED_REVERSE) {
        this.speed = -CONFIG.CAR.MAX_SPEED_REVERSE;
      }
    } else {
      // Natural rolling friction coasting
      if (Math.abs(this.speed) > 0.1) {
        const decel = CONFIG.CAR.NATURAL_FRICTION * deltaTime;
        if (this.speed > 0) {
          this.speed = Math.max(0, this.speed - decel);
        } else {
          this.speed = Math.min(0, this.speed + decel);
        }
      } else {
        this.speed = 0;
      }
    }

    // Handbrake application
    if (handbrake) {
      const brakeDecel = CONFIG.CAR.BRAKE_FORCE * deltaTime;
      if (this.speed > 0) this.speed = Math.max(0, this.speed - brakeDecel);
      else if (this.speed < 0) this.speed = Math.min(0, this.speed + brakeDecel);
    }

    // Taillights brake glow effect
    if (this.tailLightMat) {
      if (this.isBraking) {
        this.tailLightMat.emissive.setHex(0xef4444);
        this.tailLightMat.emissiveIntensity = 2.2;
      } else {
        this.tailLightMat.emissive.setHex(0x991b1b);
        this.tailLightMat.emissiveIntensity = 0.4;
      }
    }

    // 3. Vehicle Turning & Yaw Rotation
    if (Math.abs(this.speed) > 0.2) {
      const turnMultiplier = 1.35;
      const speedRatio = Math.abs(this.speed) / CONFIG.CAR.MAX_SPEED_FORWARD;
      
      // Saat mundur (speed < 0), balik arah putaran yaw agar belok kiri tetap bergerak ke kiri (arcade / intuitive reverse)
      const reverseFactor = this.speed > 0 ? 1 : -1;
      const deltaYaw = this.steerAngle * speedRatio * turnMultiplier * reverseFactor * deltaTime;
      this.mesh.rotation.y += deltaYaw;

      // Tire skid particles when turning sharply at high speed
      if (this.particles && Math.abs(this.steerAngle) > 0.25 && Math.abs(this.speed) > 18) {
        if (Math.random() < 0.5) {
          const rearPos = this.mesh.position.clone();
          this.particles.emitSkidDust(rearPos);
        }
      }
    }

    // 4. Velocity Vector Displacement
    const forwardVector = new THREE.Vector3(0, 0, 1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.mesh.rotation.y
    );

    const displacement = forwardVector.multiplyScalar(this.speed * deltaTime);
    this.mesh.position.add(displacement);

    // 5. World Bounds Check (Bounce gently off boundaries)
    const boundLimit = (CONFIG.WORLD.WIDTH / 2) - CONFIG.WORLD.BOUND_PADDING;
    if (Math.abs(this.mesh.position.x) > boundLimit) {
      this.mesh.position.x = Math.sign(this.mesh.position.x) * boundLimit;
      this.speed *= -0.35; // Gentle bounce
      this.audio.playBumpSound();
      if (this.particles) this.particles.emitImpact(this.mesh.position);
    }
    if (Math.abs(this.mesh.position.z) > boundLimit) {
      this.mesh.position.z = Math.sign(this.mesh.position.z) * boundLimit;
      this.speed *= -0.35;
      this.audio.playBumpSound();
      if (this.particles) this.particles.emitImpact(this.mesh.position);
    }

    // 6. Wheel Spin Rotation
    const wheelRotDelta = (this.speed * deltaTime) / CONFIG.CAR.WHEEL_RADIUS;
    if (this.frontLeftWheel) this.frontLeftWheel.rotation.x += wheelRotDelta;
    if (this.frontRightWheel) this.frontRightWheel.rotation.x += wheelRotDelta;
    if (this.rearLeftWheel) this.rearLeftWheel.rotation.x += wheelRotDelta;
    if (this.rearRightWheel) this.rearRightWheel.rotation.x += wheelRotDelta;

    // 7. Suspension Body Roll & Pitch
    const speedRatio = this.speed / CONFIG.CAR.MAX_SPEED_FORWARD;
    const targetRoll = -this.steerAngle * speedRatio * CONFIG.CAR.BODY_ROLL_FACTOR * 4.5;
    const targetPitch = throttle * CONFIG.CAR.BODY_PITCH_FACTOR * 2.5;

    this.bodyGroup.rotation.z += (targetRoll - this.bodyGroup.rotation.z) * 0.15;
    this.bodyGroup.rotation.x += (targetPitch - this.bodyGroup.rotation.x) * 0.15;

    // 8. Update Engine Audio
    this.audio.updateEngine(this.speed, CONFIG.CAR.MAX_SPEED_FORWARD);
  }

  getPosition() {
    return this.mesh.position;
  }

  getSpeedKmh() {
    return Math.round(Math.abs(this.speed) * 2.2);
  }
}
