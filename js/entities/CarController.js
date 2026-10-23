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

    // Collision boundary radius (accurately fitted to Bugatti Chiron body width)
    this.colliderRadius = 1.05;
    this.lastBoundaryImpact = 0;

    this.buildCarModel();
    this.scene.add(this.mesh);

    // Initial position
    this.reset(false);
  }

  buildCarModel() {
    this.mesh.add(this.bodyGroup);

    // =========================================================================
    // BUGATTI CHIRON HYPERCAR MATERIALS (DUAL-TONE FRENCH RACING BLUE & CARBON)
    // =========================================================================
    const chironBlueMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9, // Iconic Bugatti French Racing Blue
      metalness: 0.55,
      roughness: 0.2
    });

    const carbonDarkMat = new THREE.MeshStandardMaterial({
      color: 0x060b18, // Deep Midnight Carbon Fiber Finish
      metalness: 0.85,
      roughness: 0.25
    });

    const chromeTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // Polished Aluminum Chrome (C-Bar & Horseshoe)
      metalness: 0.95,
      roughness: 0.1
    });

    const horseshoeMeshMat = new THREE.MeshStandardMaterial({
      color: 0x090d16, // Honeycomb grille mesh
      roughness: 0.85
    });

    const glassCanopyMat = new THREE.MeshStandardMaterial({
      color: 0x090f1d, // Aerodynamic dark tinted cockpit
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.82
    });

    const quadLedMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const bugattiRedMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }); // Red Brembo & Logo

    this.tailLightMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      emissive: 0xef4444,
      emissiveIntensity: 1.8
    });

    const wheelRubberMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 });
    const caliperMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });

    // =========================================================================
    // 1. FRONT HOOD & NOSE (FRENCH RACING BLUE)
    // =========================================================================
    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.32, 2.0), chironBlueMat);
    hood.position.set(0, 0.55, 0.95);
    hood.castShadow = true;
    hood.receiveShadow = true;
    this.bodyGroup.add(hood);

    // Center longitudinal Bugatti spine crease along hood
    const hoodSpine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 1.7), chironBlueMat);
    hoodSpine.position.set(0, 0.72, 0.95);
    this.bodyGroup.add(hoodSpine);

    // Front low aerodynamic carbon splitter lip
    const frontSplitter = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.08, 0.4), carbonDarkMat);
    frontSplitter.position.set(0, 0.28, 2.05);
    frontSplitter.castShadow = true;
    this.bodyGroup.add(frontSplitter);

    // =========================================================================
    // 2. ICONIC BUGATTI HORSESHOE GRILLE & SIDE INTAKES
    // =========================================================================
    const grilleGroup = new THREE.Group();
    grilleGroup.position.set(0, 0.48, 1.96);

    // Chrome Horseshoe Arch Rim
    const horseshoeRim = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.44, 0.12), chromeTrimMat);
    grilleGroup.add(horseshoeRim);

    // Honeycomb Mesh Insert
    const horseshoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.36, 0.14), horseshoeMeshMat);
    grilleGroup.add(horseshoeMesh);

    // Bugatti Red Oval Badge
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.16), bugattiRedMat);
    badge.position.set(0, 0.12, 0);
    grilleGroup.add(badge);

    // Left and Right Front Air Dam Intakes
    [-0.72, 0.72].forEach(ix => {
      const intake = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.26, 0.12), carbonDarkMat);
      intake.position.set(ix, -0.05, 0);
      grilleGroup.add(intake);
    });

    this.bodyGroup.add(grilleGroup);

    // =========================================================================
    // 3. CHIRON SIGNATURE QUAD-LED HEADLIGHTS (8-EYE STARE)
    // =========================================================================
    [-0.72, 0.72].forEach(hx => {
      const pod = new THREE.Group();
      pod.position.set(hx, 0.65, 1.88);

      // 4 horizontal jewel LED cubes in a row
      for (let i = 0; i < 4; i++) {
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.08), quadLedMat);
        eye.position.set((i - 1.5) * 0.09 * (hx > 0 ? 1 : -1), 0, 0);
        pod.add(eye);
      }
      this.bodyGroup.add(pod);
    });

    // Forward Projecting Headlight Beams
    const spotLeft = new THREE.SpotLight(0xfffaed, 0.9, 26, Math.PI / 6, 0.4, 1.2);
    spotLeft.position.set(-0.7, 0.65, 1.95);
    spotLeft.target.position.set(-0.7, 0, 14);
    this.bodyGroup.add(spotLeft);
    this.bodyGroup.add(spotLeft.target);

    const spotRight = spotLeft.clone();
    spotRight.position.x = 0.7;
    spotRight.target.position.x = 0.7;
    this.bodyGroup.add(spotRight);
    this.bodyGroup.add(spotRight.target);

    // =========================================================================
    // 4. TEARDROP COCKPIT, DORSAL FIN & W16 AIR SCOOPS
    // =========================================================================
    const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.52, 1.85), glassCanopyMat);
    cockpit.position.set(0, 0.98, -0.15);
    cockpit.castShadow = true;
    this.bodyGroup.add(cockpit);

    // Central Longitudinal Spine Dorsal Fin (Aero Stabilizer)
    const dorsalFin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 1.8), carbonDarkMat);
    dorsalFin.position.set(0, 1.15, -0.6);
    this.bodyGroup.add(dorsalFin);

    // Dual Roof-Mounted W16 Engine Intake Scoops
    [-0.42, 0.42].forEach(sx => {
      const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.6), carbonDarkMat);
      scoop.position.set(sx, 1.05, -0.9);
      this.bodyGroup.add(scoop);
    });

    // =========================================================================
    // 5. THE LEGENDARY CHIRON "C-BAR" (BUGATTI C-LINE)
    // =========================================================================
    [-1.04, 1.04].forEach(cx => {
      const cLine = new THREE.Group();
      cLine.position.set(cx, 0, 0);

      // Top roof sweeping trim
      const cTop = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1.4), chromeTrimMat);
      cTop.position.set(0, 1.06, -0.2);
      cLine.add(cTop);

      // Sloping front A-pillar plunge
      const cFront = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 0.08), chromeTrimMat);
      cFront.position.set(0, 0.82, 0.48);
      cFront.rotation.x = -0.55;
      cLine.add(cFront);

      // Curving rear flank loop behind door
      const cRear = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.58, 0.08), chromeTrimMat);
      cRear.position.set(0, 0.78, -0.88);
      cRear.rotation.x = 0.55;
      cLine.add(cRear);

      // Bottom rocker runner
      const cBottom = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1.4), chromeTrimMat);
      cBottom.position.set(0, 0.42, -0.2);
      cLine.add(cBottom);

      this.bodyGroup.add(cLine);
    });

    // =========================================================================
    // 6. MUSCULAR REAR HAUNCHES & CARBON REAR ENGINE DECK
    // =========================================================================
    const rearBody = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.48, 2.05), carbonDarkMat);
    rearBody.position.set(0, 0.58, -1.05);
    rearBody.castShadow = true;
    rearBody.receiveShadow = true;
    this.bodyGroup.add(rearBody);

    // =========================================================================
    // 7. CONTINUOUS 1.8M FULL-WIDTH REAR LED LIGHT BAR (CHIRON SIGNATURE)
    // =========================================================================
    const lightBar = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.08, 0.12), this.tailLightMat);
    lightBar.position.set(0, 0.72, -2.08);
    this.bodyGroup.add(lightBar);

    // =========================================================================
    // 8. ACTIVE HYPERCAR REAR WING / AERO SPOILER
    // =========================================================================
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.06, 0.42), carbonDarkMat);
    wing.position.set(0, 1.12, -1.82);
    wing.castShadow = true;
    this.bodyGroup.add(wing);

    [-0.52, 0.52].forEach(px => {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.18), chromeTrimMat);
      pylon.position.set(px, 0.92, -1.82);
      this.bodyGroup.add(pylon);
    });

    // =========================================================================
    // 9. AGGRESSIVE REAR CARBON DIFFUSER & QUAD TITANIUM EXHAUSTS
    // =========================================================================
    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.14, 0.4), carbonDarkMat);
    diffuser.position.set(0, 0.28, -2.05);
    this.bodyGroup.add(diffuser);

    // Quad Central Exhaust Pipes
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.95, roughness: 0.25 });
    [-0.18, -0.06, 0.06, 0.18].forEach(ex => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 12), exhaustMat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(ex, 0.44, -2.12);
      this.bodyGroup.add(pipe);
    });

    // =========================================================================
    // 10. HIGH-PERFORMANCE DIAMOND-CUT WHEELS & BREMBO BRAKE CALIPERS
    // =========================================================================
    const createChironWheel = () => {
      const wheelGroup = new THREE.Group();

      // Wide low-profile performance tire
      const tireGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.36, 18);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, wheelRubberMat);
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Diamond-cut two-tone alloy rim
      const rimGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.38, 16);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheelGroup.add(rim);

      // Center Bugatti wheel cap
      const capGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12);
      capGeo.rotateZ(Math.PI / 2);
      const cap = new THREE.Mesh(capGeo, chironBlueMat);
      wheelGroup.add(cap);

      // Red Brembo Brake Caliper
      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.12), caliperMat);
      caliper.position.set(0, 0.16, 0.15);
      wheelGroup.add(caliper);

      return wheelGroup;
    };

    // Front Wheels on Steering Pivots
    this.frontLeftPivot = new THREE.Group();
    this.frontLeftPivot.position.set(-1.14, 0.42, 1.18);
    this.frontLeftWheel = createChironWheel();
    this.frontLeftPivot.add(this.frontLeftWheel);
    this.mesh.add(this.frontLeftPivot);

    this.frontRightPivot = new THREE.Group();
    this.frontRightPivot.position.set(1.14, 0.42, 1.18);
    this.frontRightWheel = createChironWheel();
    this.frontRightPivot.add(this.frontRightWheel);
    this.mesh.add(this.frontRightPivot);

    // Rear Wheels (Muscular wide track)
    this.rearLeftWheel = createChironWheel();
    this.rearLeftWheel.position.set(-1.16, 0.42, -1.18);
    this.mesh.add(this.rearLeftWheel);

    this.rearRightWheel = createChironWheel();
    this.rearRightWheel.position.set(1.16, 0.42, -1.18);
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
    // Berputar HANYA ketika mobil bergerak (bukan berputar di tempat seperti gasing saat diam)
    // Menggunakan arah bertanda (turnDirection = Math.sign(this.speed)) sehingga:
    // - Maju + Kiri (W+A): mobil melengkung ke kiri
    // - Mundur + Kiri (S+A): buritan mobil mundur ke kiri (konsisten & intuitif)
    if (Math.abs(this.speed) > 0.15) {
      const turnDirection = Math.sign(this.speed);
      const speedRatio = Math.min(1.0, Math.max(0.35, Math.abs(this.speed) / 14.0));
      const deltaYaw = this.steerAngle * turnDirection * speedRatio * 2.2 * deltaTime;
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

    // 5. World Bounds Check (Bounce gently off boundaries, anti-spam)
    const boundLimit = (CONFIG.WORLD.WIDTH / 2) - CONFIG.WORLD.BOUND_PADDING;
    const now = performance.now();

    if (Math.abs(this.mesh.position.x) > boundLimit) {
      this.mesh.position.x = Math.sign(this.mesh.position.x) * boundLimit;
      if (Math.abs(this.speed) > 2.5 && (now - this.lastBoundaryImpact > 350)) {
        this.lastBoundaryImpact = now;
        this.speed *= -0.3; // Clean recoil
        this.audio.playBumpSound();
        if (this.particles) this.particles.emitImpact(this.mesh.position);
      } else {
        this.speed = 0; // Hentikan gerakan masuk batas, cegah getar / nyepam
      }
    }

    if (Math.abs(this.mesh.position.z) > boundLimit) {
      this.mesh.position.z = Math.sign(this.mesh.position.z) * boundLimit;
      if (Math.abs(this.speed) > 2.5 && (now - this.lastBoundaryImpact > 350)) {
        this.lastBoundaryImpact = now;
        this.speed *= -0.3;
        this.audio.playBumpSound();
        if (this.particles) this.particles.emitImpact(this.mesh.position);
      } else {
        this.speed = 0;
      }
    }

    // 6. Wheel Spin Rotation
    // Jika mobil melaju, roda berputar sesuai kecepatan fisik.
    // Jika mobil menempel rintangan dan pemain tetap menekan gas, roda tetap berputar (wheel slip)
    // agar roda tidak membeku/diam saat menempel dinding.
    let effectiveSpinSpeed = this.speed;
    if (Math.abs(effectiveSpinSpeed) < 1.0 && Math.abs(throttle) > 0.1) {
      effectiveSpinSpeed = throttle * 8.0;
      if (this.particles && Math.random() < 0.2) {
        const rearPos = this.mesh.position.clone();
        this.particles.emitSkidDust(rearPos);
      }
    }
    const wheelRotDelta = (effectiveSpinSpeed * deltaTime) / CONFIG.CAR.WHEEL_RADIUS;
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
