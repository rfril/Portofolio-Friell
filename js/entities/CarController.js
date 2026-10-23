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
    this.isDrifting = false;
    this.driftDirection = 0;
    this.driftStraightTimer = 0;
    this.handbrakeTapTimer = 0;
    this.wasHandbrakePressed = false;
    this.velocity = new THREE.Vector3(0, 0, 0);

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

    // Collision boundary radius (accurately fitted to Koenigsegg Jesko body width)
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
    // KOENIGSEGG JESKO ATTACK MATERIALS (ARCTIC WHITE PEARL & EXPOSED CARBON)
    // =========================================================================
    // 1. Arctic White Pearl Bodywork
    const jeskoWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.35,
      roughness: 0.15
    });

    // 2. High-Downforce Twill Weave Carbon Fiber
    const carbonDarkMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.25
    });

    // 3. Ultra-Gloss Aero Carbon
    const carbonGlossMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.9,
      roughness: 0.12
    });

    // 4. Iconic Koenigsegg Apex Acid Lime Racing Accent
    const apexLimeMat = new THREE.MeshStandardMaterial({
      color: 0x84cc16,
      emissive: 0x4d7c0f,
      emissiveIntensity: 0.4,
      roughness: 0.25
    });

    // 5. Koenigsegg Swedish Ängelholm Ghost Gold Crest
    const ghostGoldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15
    });

    // 6. Jet-Fighter Wraparound Visor Glass Canopy
    const glassVisorMat = new THREE.MeshStandardMaterial({
      color: 0x070c18,
      metalness: 0.95,
      roughness: 0.05,
      transparent: true,
      opacity: 0.84
    });

    // 7. Matrix LED Headlights
    const ledHeadlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const drlIceBlueMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6
    });

    // 8. Jesko Slim Blade LED Taillights (Brake Reactive)
    this.tailLightMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      emissive: 0xef4444,
      emissiveIntensity: 1.8
    });

    // 9. Titanium Apex Exhaust Materials
    const titaniumExhaustMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.95,
      roughness: 0.2
    });
    const titaniumBurnMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.65
    });

    // 10. Wheels & Carbon Ceramic Calipers
    const tireRubberMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.92 });
    const carbonRimMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9, roughness: 0.2 });
    const brakeRotorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.3 });
    const limeCaliperMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.2 });

    // =========================================================================
    // 1. CARBON FIBER MONOCOQUE TUB & LOWER CHASSIS
    // =========================================================================
    const chassisFloor = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.18, 4.2), carbonDarkMat);
    chassisFloor.position.set(0, 0.28, 0.0);
    this.bodyGroup.add(chassisFloor);

    // Main Cockpit & Waist Tub
    const centralTub = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.34, 2.5), jeskoWhiteMat);
    centralTub.position.set(0, 0.50, 0.05);
    centralTub.castShadow = true;
    centralTub.receiveShadow = true;
    this.bodyGroup.add(centralTub);

    // =========================================================================
    // 2. SLOPING WEDGE NOSE, HOOD AERO EXTRACTOR & GHOST CREST
    // =========================================================================
    // Sloping Front Hood (Arctic White)
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.24, 1.65), jeskoWhiteMat);
    hood.position.set(0, 0.54, 1.15);
    hood.castShadow = true;
    hood.receiveShadow = true;
    this.bodyGroup.add(hood);

    // Recessed Carbon Aero Extraction Vent (Tunnel through the nose over the windshield)
    const hoodAeroVent = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.06, 0.88), carbonDarkMat);
    hoodAeroVent.position.set(0, 0.65, 1.22);
    this.bodyGroup.add(hoodAeroVent);

    // Apex Lime Center Racing Pinstripe along Hood
    const hoodStripe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 1.60), apexLimeMat);
    hoodStripe.position.set(0, 0.67, 1.15);
    this.bodyGroup.add(hoodStripe);

    // Low Nose Apex Cone
    const noseCone = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.20, 0.48), jeskoWhiteMat);
    noseCone.position.set(0, 0.40, 2.02);
    noseCone.castShadow = true;
    this.bodyGroup.add(noseCone);

    // Koenigsegg Swedish Ängelholm Ghost Squadron Gold Shield Crest
    const ghostCrest = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.14), ghostGoldMat);
    ghostCrest.position.set(0, 0.51, 2.12);
    this.bodyGroup.add(ghostCrest);

    // =========================================================================
    // 3. FRONT HIGH-DOWNFORCE AERO: DEEP SPLITTER & DUAL DIVE CANARDS
    // =========================================================================
    // Deep Front Carbon Splitter Tray
    const frontSplitter = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.05, 0.56), carbonGlossMat);
    frontSplitter.position.set(0, 0.22, 2.18);
    frontSplitter.castShadow = true;
    this.bodyGroup.add(frontSplitter);

    // Splitter Leading Apex Lime Accent Lip
    const splitterLimeLip = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.03, 0.05), apexLimeMat);
    splitterLimeLip.position.set(0, 0.22, 2.46);
    this.bodyGroup.add(splitterLimeLip);

    // Splitter Vertical Endplate Winglets (Left & Right)
    [-1.09, 1.09].forEach(sx => {
      const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.20, 0.40), carbonGlossMat);
      winglet.position.set(sx, 0.31, 2.22);
      this.bodyGroup.add(winglet);

      const wingletLime = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.40), apexLimeMat);
      wingletLime.position.set(sx, 0.41, 2.22);
      this.bodyGroup.add(wingletLime);
    });

    // Dual Aerodynamic Carbon Dive Canards (Attack Edition)
    [-1.02, 1.02].forEach(cx => {
      const isRight = cx > 0;
      // Upper Dive Canard
      const upperCanard = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.18), carbonDarkMat);
      upperCanard.position.set(cx, 0.55, 1.88);
      upperCanard.rotation.z = isRight ? -0.22 : 0.22;
      upperCanard.rotation.y = isRight ? -0.15 : 0.15;
      this.bodyGroup.add(upperCanard);

      // Lower Dive Canard
      const lowerCanard = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.20), carbonDarkMat);
      lowerCanard.position.set(cx * 1.02, 0.42, 2.02);
      lowerCanard.rotation.z = isRight ? -0.22 : 0.22;
      lowerCanard.rotation.y = isRight ? -0.15 : 0.15;
      this.bodyGroup.add(lowerCanard);
    });

    // =========================================================================
    // 4. MATRIX LED BLADE HEADLIGHTS & ICE-BLUE DRL EYEBROWS
    // =========================================================================
    [-0.72, 0.72].forEach(hx => {
      const isRight = hx > 0;
      const headGroup = new THREE.Group();
      headGroup.position.set(hx, 0.58, 1.94);
      headGroup.rotation.y = isRight ? 0.12 : -0.12;

      // Triple LED Matrix projector crystals
      for (let i = 0; i < 3; i++) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.08), ledHeadlightMat);
        led.position.set((i - 1) * 0.11, 0, 0);
        headGroup.add(led);
      }

      // Upper Ice-Blue DRL Eyebrow Blade
      const drl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.10), drlIceBlueMat);
      drl.position.set(0, 0.05, 0.02);
      headGroup.add(drl);

      this.bodyGroup.add(headGroup);
    });

    // Forward Illuminating High-Beam Projector Lights
    const spotLeft = new THREE.SpotLight(0xfffbeb, 0.9, 28, Math.PI / 5.5, 0.4, 1.2);
    spotLeft.position.set(-0.7, 0.60, 2.05);
    spotLeft.target.position.set(-0.7, 0, 16);
    this.bodyGroup.add(spotLeft);
    this.bodyGroup.add(spotLeft.target);

    const spotRight = spotLeft.clone();
    spotRight.position.x = 0.7;
    spotRight.target.position.x = 0.7;
    this.bodyGroup.add(spotRight);
    this.bodyGroup.add(spotRight.target);

    // =========================================================================
    // 5. FIGHTER-JET WRAPAROUND VISOR COCKPIT & ROOF RAM-AIR SCOOP
    // =========================================================================
    // Teardrop Wraparound Glass Visor Dome
    const visorDome = new THREE.Mesh(new THREE.BoxGeometry(1.50, 0.46, 1.80), glassVisorMat);
    visorDome.position.set(0, 0.94, 0.05);
    visorDome.castShadow = true;
    this.bodyGroup.add(visorDome);

    // Arctic White Visor Roof Deck
    const visorRoof = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.07, 1.46), jeskoWhiteMat);
    visorRoof.position.set(0, 1.18, 0.05);
    this.bodyGroup.add(visorRoof);

    // Roof Center Lime Accent Stripe
    const roofStripe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 1.46), apexLimeMat);
    roofStripe.position.set(0, 1.22, 0.05);
    this.bodyGroup.add(roofStripe);

    // Roof Ram-Air Intake Scoop (Feeding Twin-Turbo V8)
    const roofScoop = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.65), carbonDarkMat);
    roofScoop.position.set(0, 1.25, -0.32);
    this.bodyGroup.add(roofScoop);

    const scoopIntakeHole = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.10, 0.06), carbonGlossMat);
    scoopIntakeHole.position.set(0, 1.25, -0.01);
    this.bodyGroup.add(scoopIntakeHole);

    // Central Longitudinal Spine Dorsal Fin (Aero Stabilizer)
    const dorsalFin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 1.60), carbonDarkMat);
    dorsalFin.position.set(0, 1.14, -0.85);
    this.bodyGroup.add(dorsalFin);

    // =========================================================================
    // 6. SCULPTED FLANKS, SIDE AIR SCOOPS & AERO SIDE SKIRTS
    // =========================================================================
    [-1.02, 1.02].forEach(sx => {
      const isRight = sx > 0;
      // Carbon Side Skirt Runner
      const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 2.48), carbonDarkMat);
      skirt.position.set(sx, 0.24, 0.0);
      this.bodyGroup.add(skirt);

      // Apex Lime Pinstripe along Skirt
      const limeSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 2.48), apexLimeMat);
      limeSkirt.position.set(sx + (isRight ? 0.06 : -0.06), 0.24, 0.0);
      this.bodyGroup.add(limeSkirt);

      // Aero Bargeboard / Vertical Winglet ahead of Rear Wheel
      const rearBarge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.32), carbonGlossMat);
      rearBarge.position.set(sx + (isRight ? 0.05 : -0.05), 0.35, -0.92);
      this.bodyGroup.add(rearBarge);

      // Deep Intercooler Side Air Radiator Scoop
      const sideScoop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.30, 0.85), carbonDarkMat);
      sideScoop.position.set(sx * 0.90, 0.54, -0.48);
      this.bodyGroup.add(sideScoop);

      // Aerodynamic Carbon Side Mirror on Twin Stalk
      const mirrorStalk = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.06), carbonDarkMat);
      mirrorStalk.position.set(sx * 0.88, 0.86, 0.52);
      mirrorStalk.rotation.z = isRight ? -0.25 : 0.25;
      this.bodyGroup.add(mirrorStalk);

      const mirrorHousing = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.10, 0.14), carbonDarkMat);
      mirrorHousing.position.set(sx * 1.02, 0.89, 0.52);
      this.bodyGroup.add(mirrorHousing);
    });

    // =========================================================================
    // 7. MUSCULAR REAR DECK & ENGINE BAY HEAT EXTRACTION LOUVERS
    // =========================================================================
    const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.44, 1.95), jeskoWhiteMat);
    rearDeck.position.set(0, 0.58, -1.10);
    rearDeck.castShadow = true;
    rearDeck.receiveShadow = true;
    this.bodyGroup.add(rearDeck);

    // Rear Engine Cover Glass Bay with Cooling Louvers
    const engineBay = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.08, 1.25), carbonDarkMat);
    engineBay.position.set(0, 0.78, -1.05);
    this.bodyGroup.add(engineBay);

    // Cooling Louvers
    for (let i = 0; i < 5; i++) {
      const louver = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.03, 0.10), carbonGlossMat);
      louver.position.set(0, 0.83, -0.75 - i * 0.18);
      louver.rotation.x = 0.25;
      this.bodyGroup.add(louver);
    }

    // =========================================================================
    // 8. SIGNATURE TOP-MOUNTED INVERTED SWAN-NECK BOOMERANG WING (ATTACK)
    // =========================================================================
    // Twin Inverted Swan-Neck Carbon Pylons (Mounting from ABOVE the wing)
    [-0.42, 0.42].forEach(px => {
      const pylonGroup = new THREE.Group();
      pylonGroup.position.set(px, 0, 0);

      // Vertical Upward Strut
      const verticalStrut = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.50, 0.16), carbonGlossMat);
      verticalStrut.position.set(0, 0.98, -1.60);
      verticalStrut.rotation.x = -0.15;
      pylonGroup.add(verticalStrut);

      // Forward Arching Swan-Neck Hook (Curving OVER top of wing)
      const swanNeckHook = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.38), carbonGlossMat);
      swanNeckHook.position.set(0, 1.28, -1.74);
      pylonGroup.add(swanNeckHook);

      this.bodyGroup.add(pylonGroup);
    });

    // Boomerang Dual-Element Carbon Wing Blade (Suspended from Swan-Necks)
    const wingGroup = new THREE.Group();
    wingGroup.position.set(0, 1.21, -1.82);

    // Center Wing Blade Section
    const wingCenter = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.06, 0.46), carbonGlossMat);
    wingCenter.castShadow = true;
    wingGroup.add(wingCenter);

    // Left Swept Boomerang Blade
    const wingLeft = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.06, 0.42), carbonGlossMat);
    wingLeft.position.set(-0.72, 0.02, -0.08);
    wingLeft.rotation.y = -0.14;
    wingLeft.rotation.z = -0.04;
    wingLeft.castShadow = true;
    wingGroup.add(wingLeft);

    // Right Swept Boomerang Blade
    const wingRight = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.06, 0.42), carbonGlossMat);
    wingRight.position.set(0.72, 0.02, -0.08);
    wingRight.rotation.y = 0.14;
    wingRight.rotation.z = 0.04;
    wingRight.castShadow = true;
    wingGroup.add(wingRight);

    // Wing Trailing Edge Active Gurney Flap
    const gurneyFlap = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.03, 0.04), carbonDarkMat);
    gurneyFlap.position.set(0, 0.04, -0.24);
    wingGroup.add(gurneyFlap);

    // Colossal Vertical Endplates with Neon Apex Lime Outer Racing Stripes
    [-1.02, 1.02].forEach(ex => {
      const isRight = ex > 0;
      // Carbon Endplate
      const endplate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.58), carbonGlossMat);
      endplate.position.set(ex, 0.02, -0.06);
      wingGroup.add(endplate);

      // Apex Lime Vertical Perimeter Trim
      const endplateLime = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.05), apexLimeMat);
      endplateLime.position.set(ex + (isRight ? 0.01 : -0.01), 0.02, 0.22);
      wingGroup.add(endplateLime);
    });

    this.bodyGroup.add(wingGroup);

    // =========================================================================
    // 9. REAR FASCIA, SLIM LED TAILLIGHT BLADE & APEX TITANIUM EXHAUST
    // =========================================================================
    // Full-Width Koenigsegg Slim Horizontal LED Taillight Blade
    const taillightBlade = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.06, 0.10), this.tailLightMat);
    taillightBlade.position.set(0, 0.72, -2.08);
    this.bodyGroup.add(taillightBlade);

    // Central Titanium Apex Exhaust Bezel
    const exhaustBezel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.22, 16),
      titaniumExhaustMat
    );
    exhaustBezel.rotation.x = Math.PI / 2;
    exhaustBezel.position.set(0, 0.48, -2.15);
    this.bodyGroup.add(exhaustBezel);

    // Internal Heat-Treated Blue/Purple Burnished Titanium Lip
    const exhaustBurnLip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.24, 16),
      titaniumBurnMat
    );
    exhaustBurnLip.rotation.x = Math.PI / 2;
    exhaustBurnLip.position.set(0, 0.48, -2.16);
    this.bodyGroup.add(exhaustBurnLip);

    // Colossal Rear Carbon Venturi Diffuser
    const diffuserTray = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.12, 0.54), carbonGlossMat);
    diffuserTray.position.set(0, 0.24, -2.10);
    this.bodyGroup.add(diffuserTray);

    // 4 Underbody Vertical Diffuser Strakes
    [-0.68, -0.23, 0.23, 0.68].forEach(dx => {
      const strake = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.48), carbonGlossMat);
      strake.position.set(dx, 0.20, -2.10);
      this.bodyGroup.add(strake);
    });

    // =========================================================================
    // 10. AIRCORE CARBON WHEELS & APEX LIME MONOBLOC CALIPERS
    // =========================================================================
    const createJeskoWheel = () => {
      const wheelGroup = new THREE.Group();

      // Low-Profile Michelin Pilot Sport Cup 2 R Performance Tire
      const tireGeo = new THREE.CylinderGeometry(0.40, 0.40, 0.34, 20);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, tireRubberMat);
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Koenigsegg Aircore Hollow Carbon Rim
      const rimGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.36, 18);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, carbonRimMat);
      wheelGroup.add(rim);

      // Lightweight 5-Spoke Pattern
      for (let s = 0; s < 5; s++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.05, 0.24), carbonRimMat);
        spoke.rotation.x = (s * Math.PI * 2) / 5;
        wheelGroup.add(spoke);
      }

      // Center-Lock Wheel Nut (Anodized Aluminum)
      const nutGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.38, 12);
      nutGeo.rotateZ(Math.PI / 2);
      const nut = new THREE.Mesh(nutGeo, ghostGoldMat);
      wheelGroup.add(nut);

      // Giant Cross-Drilled Carbon Ceramic Rotor
      const rotorGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.30, 16);
      rotorGeo.rotateZ(Math.PI / 2);
      const rotor = new THREE.Mesh(rotorGeo, brakeRotorMat);
      wheelGroup.add(rotor);

      // High-Performance Monobloc Caliper in Koenigsegg Apex Lime
      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.17, 0.12), limeCaliperMat);
      caliper.position.set(0, 0.15, 0.14);
      wheelGroup.add(caliper);

      return wheelGroup;
    };

    // Front Wheels on Steering Pivots
    this.frontLeftPivot = new THREE.Group();
    this.frontLeftPivot.position.set(-1.12, 0.40, 1.25);
    this.frontLeftWheel = createJeskoWheel();
    this.frontLeftPivot.add(this.frontLeftWheel);
    this.mesh.add(this.frontLeftPivot);

    this.frontRightPivot = new THREE.Group();
    this.frontRightPivot.position.set(1.12, 0.40, 1.25);
    this.frontRightWheel = createJeskoWheel();
    this.frontRightPivot.add(this.frontRightWheel);
    this.mesh.add(this.frontRightPivot);

    // Rear Wheels (Muscular wide track)
    this.rearLeftWheel = createJeskoWheel();
    this.rearLeftWheel.position.set(-1.14, 0.40, -1.25);
    this.mesh.add(this.rearLeftWheel);

    this.rearRightWheel = createJeskoWheel();
    this.rearRightWheel.position.set(1.14, 0.40, -1.25);
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
    this.isDrifting = false;
    this.driftDirection = 0;
    this.driftStraightTimer = 0;
    this.handbrakeTapTimer = 0;
    this.wasHandbrakePressed = false;
    this.velocity.set(0, 0, 0);
    if (this.audio && this.audio.updateDriftSound) {
      this.audio.updateDriftSound(false, 0);
    }
    if (playSound && this.audio) {
      this.audio.playResetSound();
    }
  }

  update(deltaTime) {
    const throttle = this.input.getThrottle();
    const steerInput = this.input.getSteering();
    const handbrake = this.input.isBraking();

    // Deteksi ketukan rem tangan
    const handbrakeJustPressed = handbrake && !this.wasHandbrakePressed;
    this.wasHandbrakePressed = handbrake;

    // Buffer rem tangan: sekali tekan/klik langsung tersimpan aktif selama 550ms
    if (handbrakeJustPressed || handbrake) {
      this.handbrakeTapTimer = 0.55;
    } else if (this.handbrakeTapTimer > 0) {
      this.handbrakeTapTimer -= deltaTime;
    }

    const minDriftSpeed = CONFIG.CAR.DRIFT_MIN_SPEED || 12.0;
    const isMovingForward = this.speed > minDriftSpeed;
    const isSteering = Math.abs(steerInput) > 0.05 || Math.abs(this.steerAngle) > 0.05;

    // 1. STATE MACHINE DRIFT (MENCET DOANG LANGSUNG DRIFT, TANPA HARUS HOLD)
    if (!this.isDrifting) {
      // Cukup mencet tombol rem tangan (Space / Shift / Sentuh) saat mobil melaju & mengarahkan setir:
      // Langsung 100% instan mengunci mode drift!
      if (this.handbrakeTapTimer > 0 && isMovingForward && isSteering) {
        this.isDrifting = true;
        this.driftDirection = Math.sign(steerInput) || (this.steerAngle > 0 ? 1 : -1) || 1;
        this.driftStraightTimer = 0;
        this.handbrakeTapTimer = 0; // consumed!
      }
    } else {
      // Kondisi keluar dari drift secara alami & mulus:
      // a. Kecepatan mobil turun di bawah ambang minimal drift
      if (this.speed < (CONFIG.CAR.DRIFT_EXIT_SPEED || 8.0)) {
        this.isDrifting = false;
      }
      // b. Pemain menekan rem mundur (S / Down)
      else if (throttle < -0.1) {
        this.isDrifting = false;
      }
      // c. Setir diluruskan setelah menyelesaikan belokan
      else if (Math.abs(steerInput) < 0.06 || (Math.sign(steerInput) !== 0 && Math.sign(steerInput) !== this.driftDirection)) {
        this.driftStraightTimer += deltaTime;
        if (this.driftStraightTimer > 0.30) {
          this.isDrifting = false;
        }
      } else {
        this.driftStraightTimer = 0;
      }

      // d. Tap rem tangan lagi saat lurus membatalkan drift
      if (handbrakeJustPressed && !isSteering) {
        this.isDrifting = false;
        this.handbrakeTapTimer = 0;
      }
    }

    // 2. LOGIKA PENGEREMAN BIASA
    // Saat kecepatan rendah / tidak sedang drift: rem tangan berfungsi murni sebagai rem kuat (menghentikan mobil)
    if (handbrake && !this.isDrifting && !isMovingForward) {
      const brakeDecel = (CONFIG.CAR.BRAKE_FORCE || 36.0) * deltaTime;
      if (this.speed > 0) this.speed = Math.max(0, this.speed - brakeDecel);
      else if (this.speed < 0) this.speed = Math.min(0, this.speed + brakeDecel);
    }

    this.isBraking = (handbrake && !this.isDrifting) || (this.speed > 0.5 && throttle < -0.1) || (this.speed < -0.5 && throttle > 0.1);

    // 3. STEERING DYNAMICS
    const targetSteerAngle = -steerInput * CONFIG.CAR.STEER_MAX_ANGLE;
    this.steerAngle += (targetSteerAngle - this.steerAngle) * Math.min(1.0, CONFIG.CAR.STEER_SPEED * deltaTime * 6);

    // Front wheels visual steer rotation
    if (this.frontLeftPivot && this.frontRightPivot) {
      this.frontLeftPivot.rotation.y = this.steerAngle;
      this.frontRightPivot.rotation.y = this.steerAngle;
    }

    // 4. ACCELERATION / COASTING
    if (throttle > 0) {
      // Forward gas (bisa menekan gas untuk powerslide mempertahankan laju drift)
      const accelRate = this.isDrifting ? CONFIG.CAR.ACCELERATION * 0.8 : CONFIG.CAR.ACCELERATION;
      this.speed += throttle * accelRate * deltaTime;
      if (this.speed > CONFIG.CAR.MAX_SPEED_FORWARD) {
        this.speed = CONFIG.CAR.MAX_SPEED_FORWARD;
      }
      // Emit exhaust smoke when accelerating forward
      if (this.particles && Math.random() < 0.4) {
        const exhaustPos = this.mesh.position.clone();
        exhaustPos.y += 0.48;
        const forwardDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
        this.particles.emitExhaust(exhaustPos, forwardDir);
      }
    } else if (throttle < 0) {
      // Reverse / Foot Brake
      if (this.speed > 1.0) {
        this.speed -= CONFIG.CAR.BRAKE_FORCE * deltaTime;
      } else {
        this.speed += throttle * CONFIG.CAR.ACCELERATION * 0.65 * deltaTime;
        if (this.speed < -CONFIG.CAR.MAX_SPEED_REVERSE) {
          this.speed = -CONFIG.CAR.MAX_SPEED_REVERSE;
        }
      }
    } else {
      // Natural rolling friction coasting
      const frictionRate = this.isDrifting ? (CONFIG.CAR.HANDBRAKE_DECEL || 8.0) : CONFIG.CAR.NATURAL_FRICTION;
      if (Math.abs(this.speed) > 0.1) {
        const decel = frictionRate * deltaTime;
        if (this.speed > 0) {
          this.speed = Math.max(0, this.speed - decel);
        } else {
          this.speed = Math.min(0, this.speed + decel);
        }
      } else {
        this.speed = 0;
      }
    }

    // Taillights brake glow effect
    if (this.tailLightMat) {
      if (this.isBraking || this.isDrifting) {
        this.tailLightMat.emissive.setHex(0xef4444);
        this.tailLightMat.emissiveIntensity = this.isDrifting ? 1.8 : 2.5;
      } else {
        this.tailLightMat.emissive.setHex(0x991b1b);
        this.tailLightMat.emissiveIntensity = 0.4;
      }
    }

    // 5. VEHICLE TURNING & YAW ROTATION (HALUS & TERKONTROL SAAT DRIFT)
    if (Math.abs(this.speed) > 0.15) {
      const turnDirection = Math.sign(this.speed);
      const speedRatio = Math.min(1.0, Math.max(0.35, Math.abs(this.speed) / 16.0));

      let deltaYaw;
      if (this.isDrifting) {
        // Belok saat drift: halus dan stabil (multiplier 1.35x, tidak ngebut/blender)
        const steerAmt = steerInput !== 0 ? -steerInput : -this.driftDirection * 0.5;
        deltaYaw = steerAmt * turnDirection * speedRatio * 2.2 * (CONFIG.CAR.DRIFT_STEER_BOOST || 1.35) * deltaTime;
      } else {
        deltaYaw = this.steerAngle * turnDirection * speedRatio * 2.2 * deltaTime;
      }
      this.mesh.rotation.y += deltaYaw;
    }

    // 6. VELOCITY VECTOR & LATERAL DRIFT PHYSICS
    const carHeading = new THREE.Vector3(0, 0, 1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.mesh.rotation.y
    );
    const carRight = new THREE.Vector3(1, 0, 0).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.mesh.rotation.y
    );

    const targetHeadingVel = carHeading.clone().multiplyScalar(this.speed);

    if (this.isDrifting) {
      // Meluncur mulus mengikuti momentum kurva (Ridge Racer feel)
      const driftRetention = Math.max(0, 1.0 - 0.25 * deltaTime);
      this.velocity.multiplyScalar(driftRetention);

      // Menekan gas mendorong laju powerslide
      if (throttle > 0) {
        this.velocity.add(carHeading.clone().multiplyScalar(this.speed * 0.35 * deltaTime));
      }
      // Dorongan lateral terkontrol ke arah luar kurva
      const lateralForce = -this.driftDirection * Math.abs(this.speed) * 0.35 * deltaTime;
      this.velocity.add(carRight.clone().multiplyScalar(lateralForce));

      this.speed = Math.max(this.speed * 0.994, this.velocity.length());
    } else {
      // Normal grip: pemulihan cengkeraman cepat setelah lurus
      const gripRate = Math.min(1.0, (CONFIG.CAR.DRIFT_GRIP_RECOVERY || 5.0) * deltaTime * 2.5);
      this.velocity.lerp(targetHeadingVel, gripRate);
    }

    // Hitung lateral slip
    this.lateralSlip = carRight.dot(this.velocity);

    // Apply displacement & pastikan roda selalu menempel presisi di jalan
    const displacement = this.velocity.clone().multiplyScalar(deltaTime);
    this.mesh.position.add(displacement);
    this.mesh.position.y = CONFIG.CAR.RESPAWN_POSITION.y;

    // 6. World Bounds Check (Bounce gently off boundaries, anti-spam)
    const boundLimit = (CONFIG.WORLD.WIDTH / 2) - CONFIG.WORLD.BOUND_PADDING;
    const now = performance.now();

    if (Math.abs(this.mesh.position.x) > boundLimit) {
      this.mesh.position.x = Math.sign(this.mesh.position.x) * boundLimit;
      if (Math.abs(this.speed) > 2.5 && (now - this.lastBoundaryImpact > 350)) {
        this.lastBoundaryImpact = now;
        this.speed *= -0.3; // Clean recoil
        this.velocity.x *= -0.3;
        this.audio.playBumpSound();
        if (this.particles) this.particles.emitImpact(this.mesh.position);
      } else {
        this.speed = 0;
        this.velocity.x = 0;
      }
    }

    if (Math.abs(this.mesh.position.z) > boundLimit) {
      this.mesh.position.z = Math.sign(this.mesh.position.z) * boundLimit;
      if (Math.abs(this.speed) > 2.5 && (now - this.lastBoundaryImpact > 350)) {
        this.lastBoundaryImpact = now;
        this.speed *= -0.3;
        this.velocity.z *= -0.3;
        this.audio.playBumpSound();
        if (this.particles) this.particles.emitImpact(this.mesh.position);
      } else {
        this.speed = 0;
        this.velocity.z = 0;
      }
    }

    // 7. Drift Particles & Tire Screech Audio
    if (this.particles && (this.isDrifting || Math.abs(this.lateralSlip) > 3.0)) {
      if (Math.random() < 0.75) {
        const leftRear = this.mesh.position.clone().add(
          new THREE.Vector3(-0.95, 0.05, -1.25).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y)
        );
        const rightRear = this.mesh.position.clone().add(
          new THREE.Vector3(0.95, 0.05, -1.25).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y)
        );
        this.particles.emitSkidDust(leftRear);
        this.particles.emitSkidDust(rightRear);
      }
    }

    const driftIntensity = Math.min(1.0, (Math.abs(this.lateralSlip) + (this.isDrifting ? 4.5 : 0)) / 10.0);
    if (this.audio && this.audio.updateDriftSound) {
      this.audio.updateDriftSound(
        (this.isDrifting || Math.abs(this.lateralSlip) > 3.5) && Math.abs(this.speed) > 4.0,
        driftIntensity
      );
    }

    // 8. Wheel Spin Rotation
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

    // 9. Suspension Body Roll & Pitch
    const speedRatio = this.speed / CONFIG.CAR.MAX_SPEED_FORWARD;
    const driftRollAdd = this.isDrifting ? -this.steerAngle * 0.08 : 0;
    const targetRoll = (-this.steerAngle * speedRatio * CONFIG.CAR.BODY_ROLL_FACTOR * 4.5) + driftRollAdd;
    const targetPitch = throttle * CONFIG.CAR.BODY_PITCH_FACTOR * 2.5;

    this.bodyGroup.rotation.z += (targetRoll - this.bodyGroup.rotation.z) * 0.15;
    this.bodyGroup.rotation.x += (targetPitch - this.bodyGroup.rotation.x) * 0.15;

    // 10. Update Engine Audio
    this.audio.updateEngine(this.speed, CONFIG.CAR.MAX_SPEED_FORWARD);
  }

  getPosition() {
    return this.mesh.position;
  }

  getSpeedKmh() {
    return Math.round(Math.abs(this.speed) * 2.2);
  }
}
