/**
 * ENVIRONMENT & MODERN METROPOLIS CITY ARCHITECTURE
 * Membangun kota metropolitan modern 3D yang megah, padat, dan sangat rapi:
 * - Blok-blok perkotaan teratur dengan 36+ gedung pencakar langit (skyscrapers), kantor korporat,
 *   pertokoan ritel, dan apartemen modern dengan jendela bertekstur cahaya.
 * - Jaringan jalan raya beraspal mulus, trotoar granit (sidewalks) dengan curb, zebra crosswalks,
 *   lampu lalu lintas (traffic lights), lampu jalan modern, dan rambu gantry jalan tol.
 * - Mobil-mobil kota yang terparkir rapi di bahu jalan (taksi kuning, sedan eksekutif, van kurir, mobil sport).
 * - Seluruh badan jalan 100% BERSIH DARI RINTANGAN, sehingga pengalaman mengemudi sangat mulus dan menyenangkan.
 * - Area profil ("Tentang Saya") dipindahkan secara rapi ke dalam komplek Developer HQ berhalaman luas,
 *   tidak lagi menghalangi jalan raya.
 * - Distrik tematik terintegrasi: Benteng Apexsions, Mall POS Kasir, Kafe PoRoRo Sakura, Arkade Skills,
 *   Museum Linimasa, Observatorium Satelit, dan Turbin Angin di bukit luar.
 */

import { CONFIG } from "../core/Config.js";

export class Environment {
  constructor(scene, collisionSystem) {
    this.scene = scene;
    this.collision = collisionSystem;
    this.clouds = [];
    this.windTurbines = [];

    // Helper Canvas Texture Generator for Road Signs & Billboards
    this.createSignTexture = (text, bgColor = "#047857", textColor = "#ffffff", subText = "") => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 160;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

      ctx.fillStyle = textColor;
      ctx.font = "bold 42px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, canvas.width / 2, subText ? 65 : 80);

      if (subText) {
        ctx.font = "600 24px sans-serif";
        ctx.fillStyle = "#fef08a";
        ctx.fillText(subText, canvas.width / 2, 115);
      }

      return new THREE.CanvasTexture(canvas);
    };

    // Helper Window Texture for Skyscrapers
    this.createWindowTexture = (baseColorHex = "#0f172a", litColorHex = "#38bdf8", rows = 8, cols = 4) => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = baseColorHex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const isLit = Math.random() < 0.65;
          ctx.fillStyle = isLit ? litColorHex : "#1e293b";
          ctx.fillRect(c * cellW + 6, r * cellH + 8, cellW - 12, cellH - 16);
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    };

    this.initCity();
  }

  initCity() {
    this.buildTerrain();
    this.buildWaterCanalAndBridges();
    this.buildRoadNetworkAndSidewalks();
    this.buildCityIntersectionsAndCrosswalks();
    this.buildCitySkyscrapersAndBlocks();
    this.buildParkedVehicles();
    this.buildStreetFurnitureAndLights();
    this.buildHighwayGantries();
    this.buildWelcomeArch();
    this.buildCastleArchitecture();
    this.buildCommercialPlaza();
    this.buildGelatoPlaza();
    this.buildTechArcade();
    this.buildTimelineAvenue();
    this.buildObservatoryAndSatellites();
    this.buildWindTurbines();
    this.buildPerimeterFence();
    this.buildClouds();
  }

  // 1. TERRAIN & HORIZON
  buildTerrain() {
    const groundGeo = new THREE.PlaneGeometry(CONFIG.WORLD.WIDTH, CONFIG.WORLD.DEPTH, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x86efac, // Vibrant pasture green
      roughness: 0.9,
      metalness: 0.05
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    ground.position.y = -0.05;
    this.scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(CONFIG.WORLD.WIDTH - 20, 46, 0x10b981, 0xbbf7d0);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // Mountain silhouettes in far corners
    const mountainMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.95 });
    const createMountain = (x, z, radius, height) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 7), mountainMat);
      cone.position.set(x, height / 2, z);
      cone.castShadow = true;
      cone.receiveShadow = true;
      this.scene.add(cone);
      this.collision.addCircle(x, z, radius * 0.85, "mountain");
    };

    const half = CONFIG.WORLD.WIDTH / 2 - 25;
    createMountain(-half + 30, -half + 30, 35, 48);
    createMountain(half - 30, -half + 30, 36, 50);
    createMountain(-half + 30, half - 30, 32, 44);
    createMountain(half - 30, half - 30, 35, 48);
  }

  // 2. WATER CANAL & ROAD BRIDGES
  buildWaterCanalAndBridges() {
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85
    });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });

    // Water channel at Z = -22 across the city
    const canalGeo = new THREE.PlaneGeometry(CONFIG.WORLD.WIDTH - 50, 16);
    canalGeo.rotateX(-Math.PI / 2);
    const canal = new THREE.Mesh(canalGeo, waterMat);
    canal.position.set(0, -0.02, -22);
    this.scene.add(canal);

    const createBridge = (x, z) => {
      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.set(x, 0, z);

      // Deck
      const deck = new THREE.Mesh(new THREE.BoxGeometry(16, 0.35, 20), stoneMat);
      deck.position.y = 0.18;
      deck.receiveShadow = true;
      deck.castShadow = true;
      bridgeGroup.add(deck);

      // Guardrails
      const railGeo = new THREE.BoxGeometry(0.8, 1.2, 20);
      const railL = new THREE.Mesh(railGeo, stoneMat);
      railL.position.set(-7.6, 0.8, 0);
      railL.castShadow = true;
      bridgeGroup.add(railL);

      const railR = railL.clone();
      railR.position.x = 7.6;
      bridgeGroup.add(railR);

      // Blue Beacon Lights
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      [-7.6, 7.6].forEach(bx => {
        [-9.5, 9.5].forEach(bz => {
          const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.5, 8), beaconMat);
          beacon.position.set(bx, 1.4, bz);
          bridgeGroup.add(beacon);
        });
      });

      this.scene.add(bridgeGroup);
      this.collision.addBox(x - 7.6, z, 1.0, 20, "bridge_rail_l");
      this.collision.addBox(x + 7.6, z, 1.0, 20, "bridge_rail_r");
    };

    createBridge(0, -22);    // Center North Main Ave
    createBridge(145, -22);  // East Outer Expressway
    createBridge(-145, -22); // West Outer Expressway
  }

  // 3. ROAD NETWORK & RAISED GRANITE SIDEWALKS (COMPLETELY UNOBSTRUCTED)
  buildRoadNetworkAndSidewalks() {
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 }); // Dark Asphalt
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 }); // Granite Sidewalk

    // Segment helper (Road + Sidewalks)
    const createRoadWithCurbs = (x, z, width, length, rotY = 0) => {
      const roadGroup = new THREE.Group();
      roadGroup.position.set(x, 0, z);
      roadGroup.rotation.y = rotY;

      // Road Surface
      const roadGeo = new THREE.PlaneGeometry(width, length);
      roadGeo.rotateX(-Math.PI / 2);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.y = 0.02;
      road.receiveShadow = true;
      roadGroup.add(road);

      // Dashed yellow center lines
      const lineCount = Math.floor(length / 7);
      const lineGeo = new THREE.PlaneGeometry(0.35, 3.2);
      lineGeo.rotateX(-Math.PI / 2);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });

      for (let i = 0; i < lineCount; i++) {
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(0, 0.03, -length / 2 + (i + 0.5) * 7);
        roadGroup.add(line);
      }

      // White Shoulder Edge Lines
      const edgeGeo = new THREE.PlaneGeometry(0.25, length);
      edgeGeo.rotateX(-Math.PI / 2);
      const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      const edgeL = new THREE.Mesh(edgeGeo, edgeMat);
      edgeL.position.set(-width / 2 + 0.35, 0.025, 0);
      roadGroup.add(edgeL);

      const edgeR = edgeL.clone();
      edgeR.position.x = width / 2 - 0.35;
      roadGroup.add(edgeR);

      // Elevated Sidewalks on both sides (3.2m wide, 0.15m high)
      const walkGeo = new THREE.BoxGeometry(3.2, 0.15, length);
      const walkL = new THREE.Mesh(walkGeo, curbMat);
      walkL.position.set(-width / 2 - 1.6, 0.075, 0);
      walkL.receiveShadow = true;
      roadGroup.add(walkL);

      const walkR = walkL.clone();
      walkR.position.x = width / 2 + 1.6;
      roadGroup.add(walkR);

      this.scene.add(roadGroup);
    };

    // Central Roundabout at Spawn (Radius 18)
    const circleGeo = new THREE.RingGeometry(0, 18, 36);
    circleGeo.rotateX(-Math.PI / 2);
    const roundAbout = new THREE.Mesh(circleGeo, roadMat);
    roundAbout.position.set(0, 0.02, 0);
    roundAbout.receiveShadow = true;
    this.scene.add(roundAbout);

    // Decorative inner spawn plaza ring
    const plazaRingGeo = new THREE.RingGeometry(6, 7.5, 32);
    plazaRingGeo.rotateX(-Math.PI / 2);
    const plazaRing = new THREE.Mesh(plazaRingGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 }));
    plazaRing.position.set(0, 0.03, 0);
    this.scene.add(plazaRing);

    // MAIN CITY AVENUES (Width: 14m, Completely Clear!):
    // 1. North-South Central Avenue (Main St / Dev Boulevard)
    createRoadWithCurbs(0, -95, 14, 160, 0);
    createRoadWithCurbs(0, 95, 14, 160, 0);

    // 2. East-West Central Boulevard (Tech & Commercial Boulevard)
    createRoadWithCurbs(95, 0, 14, 160, Math.PI / 2);
    createRoadWithCurbs(-95, 0, 14, 160, Math.PI / 2);

    // 3. Inner Cross Streets (Width: 11m)
    createRoadWithCurbs(0, -70, 11, 270, Math.PI / 2);
    createRoadWithCurbs(0, 70, 11, 270, Math.PI / 2);
    createRoadWithCurbs(70, 0, 11, 270, 0);
    createRoadWithCurbs(-70, 0, 11, 270, 0);

    // 4. Outer Perimeter Expressway (Width: 12m)
    createRoadWithCurbs(145, 0, 12, 300, 0);
    createRoadWithCurbs(-145, 0, 12, 300, 0);
    createRoadWithCurbs(0, -145, 12, 300, Math.PI / 2);
    createRoadWithCurbs(0, 145, 12, 300, Math.PI / 2);
  }

  // 4. CROSSWALKS & TRAFFIC LIGHT SIGNALS AT INTERSECTIONS
  buildCityIntersectionsAndCrosswalks() {
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });

    // Helper: Painted Zebra Crosswalk
    const createZebraCrossing = (x, z, width = 11, rotY = 0) => {
      const group = new THREE.Group();
      group.position.set(x, 0.03, z);
      group.rotation.y = rotY;

      const barCount = Math.floor(width / 1.2);
      const stripeGeo = new THREE.PlaneGeometry(0.6, 3.2);
      stripeGeo.rotateX(-Math.PI / 2);

      for (let i = 0; i < barCount; i++) {
        const stripe = new THREE.Mesh(stripeGeo, whiteMat);
        stripe.position.set(-width / 2 + (i + 0.5) * 1.2, 0, 0);
        group.add(stripe);
      }

      this.scene.add(group);
    };

    // Helper: Traffic Light Signal Post (placed safely on sidewalks)
    const createTrafficSignal = (x, z) => {
      const signal = new THREE.Group();
      signal.position.set(x, 0, z);

      // Mast Pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 5.2, 8), metalMat);
      pole.position.y = 2.6;
      pole.castShadow = true;
      signal.add(pole);

      // Signal Head Box
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.6, 0.5), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      box.position.set(0, 4.4, 0);
      signal.add(box);

      // Red, Yellow, Green Lens
      const red = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      red.position.set(0, 4.8, 0.26);
      signal.add(red);

      const yellow = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      yellow.position.set(0, 4.4, 0.26);
      signal.add(yellow);

      const green = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
      green.position.set(0, 4.0, 0.26);
      signal.add(green);

      this.scene.add(signal);
      this.collision.addCircle(x, z, 0.75, "traffic_signal");
    };

    // Zebra Crossings at Major Intersections (Spawn exits & Cross Streets)
    createZebraCrossing(0, -20, 14, 0);
    createZebraCrossing(0, 20, 14, 0);
    createZebraCrossing(-20, 0, 14, Math.PI / 2);
    createZebraCrossing(20, 0, 14, Math.PI / 2);

    createZebraCrossing(70, -70, 11, 0);
    createZebraCrossing(-70, -70, 11, 0);
    createZebraCrossing(70, 70, 11, 0);
    createZebraCrossing(-70, 70, 11, 0);

    // Traffic Light Poles placed on sidewalk corners
    createTrafficSignal(9.5, -20);
    createTrafficSignal(-9.5, -20);
    createTrafficSignal(9.5, 20);
    createTrafficSignal(-9.5, 20);

    createTrafficSignal(78, -62);
    createTrafficSignal(-78, -62);
    createTrafficSignal(78, 62);
    createTrafficSignal(-78, 62);
  }

  // 5. 36+ MODERN PROCEDURAL SKYSCRAPERS & URBAN CITY BLOCKS
  buildCitySkyscrapersAndBlocks() {
    const windowTexBlue = this.createWindowTexture("#0f172a", "#38bdf8", 12, 4);
    const windowTexGold = this.createWindowTexture("#1e293b", "#fde047", 10, 4);
    const windowTexCyan = this.createWindowTexture("#0b1120", "#22d3ee", 14, 5);

    const matColors = [
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.15, map: windowTexBlue }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.25, map: windowTexCyan }),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4, map: windowTexGold }),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }), // Clean white tower
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65 }), // Warm brick commercial
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.1, map: windowTexBlue }) // Titanium Glass
    ];

    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const acUnitMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 });

    // Helper: Create High-Rise Skyscraper / Commercial Block
    const createBuilding = (x, z, width, depth, height, matIndex = 0, name = "city_building") => {
      const bGroup = new THREE.Group();
      bGroup.position.set(x, 0, z);

      // Main Tower Body
      const bodyMat = matColors[matIndex % matColors.length];
      const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bodyMat);
      body.position.y = height / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      bGroup.add(body);

      // Rooftop Equipment / Parapet
      const parapet = new THREE.Mesh(new THREE.BoxGeometry(width - 0.4, 0.8, depth - 0.4), roofMat);
      parapet.position.y = height + 0.4;
      parapet.castShadow = true;
      bGroup.add(parapet);

      // AC Unit / Elevator Shaft on Roof
      const hvac = new THREE.Mesh(new THREE.BoxGeometry(width * 0.35, 1.8, depth * 0.35), acUnitMat);
      hvac.position.set(0, height + 1.2, 0);
      hvac.castShadow = true;
      bGroup.add(hvac);

      // Rooftop Antenna Spire (on taller towers)
      if (height > 20) {
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 6.5, 6), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 }));
        antenna.position.set(0, height + 4.5, 0);
        bGroup.add(antenna);

        const blinker = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 6), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        blinker.position.set(0, height + 7.8, 0);
        bGroup.add(blinker);
      }

      this.scene.add(bGroup);
      this.collision.addBox(x, z, width + 0.5, depth + 0.5, name);
    };

    // =========================================================================
    // DENSE, NEAT CITY BLOCKS (ORGANIZED SQUARE MATRIX IN ALL 4 QUADRANTS)
    // =========================================================================

    // BLOCK 1: NORTH-EAST METROPOLITAN QUADRANT (X: +24 to +125, Z: -24 to -125)
    createBuilding(38, -38, 14, 14, 28, 0, "tower_ne_1");
    createBuilding(38, -58, 12, 16, 22, 1, "tower_ne_2");
    createBuilding(58, -38, 16, 12, 34, 5, "tower_ne_3_apex_hq");
    createBuilding(58, -58, 14, 14, 18, 2, "tower_ne_4");
    createBuilding(105, -95, 16, 16, 36, 0, "tower_ne_5_skyline");
    createBuilding(105, -120, 14, 14, 24, 1, "tower_ne_6");
    createBuilding(125, -95, 12, 14, 20, 3, "tower_ne_7");
    createBuilding(125, -120, 14, 12, 16, 4, "tower_ne_8");

    // BLOCK 2: SOUTH-EAST COMMERCIAL & CIVIC QUADRANT (X: +24 to +125, Z: +24 to +125)
    createBuilding(38, 38, 14, 14, 26, 5, "tower_se_1_fintech");
    createBuilding(38, 58, 16, 12, 20, 2, "tower_se_2");
    createBuilding(58, 38, 12, 16, 32, 0, "tower_se_3_glass");
    createBuilding(58, 58, 14, 14, 16, 4, "tower_se_4");
    // (Note: AboutZone Developer HQ is cleanly housed at X: 95, Z: 105 in this quadrant!)
    createBuilding(125, 38, 16, 14, 38, 5, "tower_se_skyline");
    createBuilding(125, 58, 14, 14, 22, 1, "tower_se_6");
    createBuilding(125, 95, 14, 14, 18, 3, "tower_se_7");

    // BLOCK 3: NORTH-WEST ARTISAN & GELATO QUADRANT (X: -24 to -125, Z: -24 to -125)
    createBuilding(-38, -38, 14, 14, 24, 1, "tower_nw_1");
    createBuilding(-38, -58, 16, 12, 18, 4, "tower_nw_2_brick");
    createBuilding(-58, -38, 12, 16, 30, 0, "tower_nw_3");
    createBuilding(-58, -58, 14, 14, 20, 3, "tower_nw_4_white");
    createBuilding(-105, -95, 14, 14, 32, 5, "tower_nw_5");
    createBuilding(-105, -120, 16, 14, 22, 1, "tower_nw_6");
    createBuilding(-125, -95, 12, 14, 18, 2, "tower_nw_7");
    createBuilding(-125, -120, 14, 12, 16, 4, "tower_nw_8");

    // BLOCK 4: SOUTH-WEST TECH INNOVATION QUADRANT (X: -24 to -125, Z: +24 to +125)
    createBuilding(-38, 38, 16, 14, 34, 0, "tower_sw_1_silicon");
    createBuilding(-38, 58, 14, 12, 22, 1, "tower_sw_2");
    createBuilding(-58, 38, 12, 16, 26, 5, "tower_sw_3");
    createBuilding(-58, 58, 14, 14, 16, 3, "tower_sw_4");
    createBuilding(-105, 95, 16, 16, 36, 0, "tower_sw_5");
    createBuilding(-105, 120, 14, 14, 24, 1, "tower_sw_6");
    createBuilding(-125, 95, 12, 14, 20, 2, "tower_sw_7");
    createBuilding(-125, 120, 14, 12, 18, 4, "tower_sw_8");

    // OUTER DISTRICT CITY TOWERS (Along Outer Expressway Rings)
    createBuilding(0, -165, 24, 12, 26, 3, "tower_north_border");
    createBuilding(0, 165, 24, 12, 28, 5, "tower_south_border");
    createBuilding(165, 0, 12, 24, 30, 0, "tower_east_border");
    createBuilding(-165, 0, 12, 24, 30, 1, "tower_west_border");
  }

  // 6. 16+ PARKED CITY VEHICLES (TAXIS, SEDANS, VANS & SPORTS CARS ALONG CURBS)
  buildParkedVehicles() {
    const carMatColors = {
      taxi: new THREE.MeshStandardMaterial({ color: 0xfde047, metalness: 0.5, roughness: 0.3 }), // Yellow Cab
      sedanBlue: new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 }),
      sedanSilver: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 }),
      sportsRed: new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.3 }),
      vanWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    };
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

    const createParkedCar = (x, z, rotY, type = "sedanBlue") => {
      const car = new THREE.Group();
      car.position.set(x, 0, z);
      car.rotation.y = rotY;

      const mat = carMatColors[type] || carMatColors.sedanBlue;

      // Chassis
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 4.0), mat);
      chassis.position.y = 0.5;
      chassis.castShadow = true;
      car.add(chassis);

      // Cabin / Roof
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 2.2), glassMat);
      cabin.position.set(0, 1.0, -0.2);
      cabin.castShadow = true;
      car.add(cabin);

      // Taxi Roof Sign
      if (type === "taxi") {
        const taxiSign = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.35), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        taxiSign.position.set(0, 1.4, -0.2);
        car.add(taxiSign);
      }

      // Wheels
      const tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
      tireGeo.rotateZ(Math.PI / 2);
      [-0.95, 0.95].forEach(wx => {
        [-1.2, 1.2].forEach(wz => {
          const wheel = new THREE.Mesh(tireGeo, wheelMat);
          wheel.position.set(wx, 0.35, wz);
          wheel.castShadow = true;
          car.add(wheel);
        });
      });

      this.scene.add(car);
      this.collision.addBox(x, z, 2.4, 4.2, "parked_" + type);
    };

    // Neatly Parked along Sidewalk Parking Bays:
    // Main Ave North (X: 8.5, parallel parking)
    createParkedCar(8.8, -35, 0, "taxi");
    createParkedCar(8.8, -48, 0, "sedanBlue");
    createParkedCar(-8.8, -35, Math.PI, "sportsRed");
    createParkedCar(-8.8, -48, Math.PI, "sedanSilver");

    // Main Ave South (Near Downtown & HQ)
    createParkedCar(8.8, 35, 0, "vanWhite");
    createParkedCar(8.8, 48, 0, "sedanBlue");
    createParkedCar(-8.8, 35, Math.PI, "taxi");
    createParkedCar(-8.8, 48, Math.PI, "sportsRed");

    // East Commercial Street (Near POS Kasir)
    createParkedCar(35, 8.8, Math.PI / 2, "vanWhite");
    createParkedCar(48, 8.8, Math.PI / 2, "sedanSilver");
    createParkedCar(35, -8.8, -Math.PI / 2, "taxi");
    createParkedCar(48, -8.8, -Math.PI / 2, "sedanBlue");

    // West Artisan Street (Near PoRoRo Gelato)
    createParkedCar(-35, 8.8, Math.PI / 2, "sportsRed");
    createParkedCar(-48, 8.8, Math.PI / 2, "sedanSilver");
    createParkedCar(-35, -8.8, -Math.PI / 2, "taxi");
    createParkedCar(-48, -8.8, -Math.PI / 2, "vanWhite");
  }

  // 7. STREET FURNITURE, DUAL-ARM LIGHTS & BUS STOPS
  buildStreetFurnitureAndLights() {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const hydrantMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });

    // Modern Dual-Arm Streetlamp (Placed neatly on sidewalks)
    const createDualStreetlamp = (x, z) => {
      const lamp = new THREE.Group();
      lamp.position.set(x, 0, z);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 5.2, 8), poleMat);
      pole.position.y = 2.6;
      pole.castShadow = true;
      lamp.add(pole);

      const armL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.1), poleMat);
      armL.position.set(-0.8, 5.0, 0);
      lamp.add(armL);

      const armR = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.1), poleMat);
      armR.position.set(0.8, 5.0, 0);
      lamp.add(armR);

      const bulbL = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), lampGlowMat);
      bulbL.position.set(-1.6, 4.8, 0);
      lamp.add(bulbL);

      const bulbR = bulbL.clone();
      bulbR.position.x = 1.6;
      lamp.add(bulbR);

      const pLight = new THREE.PointLight(0xfef08a, 0.8, 26, 1.6);
      pLight.position.y = 4.8;
      lamp.add(pLight);

      this.scene.add(lamp);
      this.collision.addCircle(x, z, 0.8, "streetlamp");
    };

    // Streetlamps aligned strictly along sidewalks
    const lampCoords = [
      [9.2, -15], [-9.2, -15], [9.2, 15], [-9.2, 15],
      [9.2, -50], [-9.2, -50], [9.2, 50], [-9.2, 50],
      [9.2, -100], [-9.2, -100], [9.2, 100], [-9.2, 100],
      [50, 9.2], [50, -9.2], [100, 9.2], [100, -9.2],
      [-50, 9.2], [-50, -9.2], [-100, 9.2], [-100, -9.2]
    ];
    lampCoords.forEach(([x, z]) => createDualStreetlamp(x, z));

    // Fire Hydrants (Red, on sidewalks)
    const createHydrant = (x, z) => {
      const hyd = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.9, 8), hydrantMat);
      hyd.position.set(x, 0.45, z);
      hyd.castShadow = true;
      this.scene.add(hyd);
      this.collision.addCircle(x, z, 0.5, "fire_hydrant");
    };

    createHydrant(9.2, -28);
    createHydrant(-9.2, 28);
    createHydrant(28, 9.2);
    createHydrant(-28, -9.2);

    // Modern Glass Bus Stop Shelters
    const createBusStop = (x, z, rotY) => {
      const shelter = new THREE.Group();
      shelter.position.set(x, 0, z);
      shelter.rotation.y = rotY;

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 2.6, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, transparent: true, opacity: 0.5 })
      );
      glass.position.set(0, 1.4, -0.8);
      shelter.add(glass);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.2, 2.0), poleMat);
      roof.position.set(0, 2.7, 0);
      shelter.add(roof);

      const bench = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.15, 0.6), woodMat);
      bench.position.set(0, 0.5, -0.4);
      shelter.add(bench);

      this.scene.add(shelter);
      this.collision.addBox(x, z, 4.8, 2.2, "bus_stop");
    };

    createBusStop(10.2, -65, 0);
    createBusStop(-10.2, 65, Math.PI);
  }

  // 8. OVERHEAD HIGHWAY GANTRIES WITH REAL READABLE SIGNS
  buildHighwayGantries() {
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });

    const createGantry = (x, z, rotY, signText, subText, width = 18) => {
      const gantry = new THREE.Group();
      gantry.position.set(x, 0, z);
      gantry.rotation.y = rotY;

      // Pillars placed safely outside the road
      const pillarGeo = new THREE.CylinderGeometry(0.35, 0.35, 6.8, 8);
      const pL = new THREE.Mesh(pillarGeo, metalMat);
      pL.position.set(-width / 2, 3.4, 0);
      pL.castShadow = true;
      gantry.add(pL);

      const pR = pL.clone();
      pR.position.x = width / 2;
      gantry.add(pR);

      // Overhead Truss Beam
      const beamGeo = new THREE.BoxGeometry(width + 1.8, 0.7, 0.7);
      const beam = new THREE.Mesh(beamGeo, metalMat);
      beam.position.set(0, 6.4, 0);
      beam.castShadow = true;
      gantry.add(beam);

      // Sign Board
      const signTex = this.createSignTexture(signText, "#047857", "#ffffff", subText);
      const signMat = new THREE.MeshBasicMaterial({ map: signTex });
      const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 2.4), signMat);
      signBoard.position.set(0, 5.0, 0.4);
      gantry.add(signBoard);

      this.scene.add(gantry);
      this.collision.addBox(x - width / 2, z, 1.4, 1.4, "gantry_pillar_l");
      this.collision.addBox(x + width / 2, z, 1.4, 1.4, "gantry_pillar_r");
    };

    createGantry(0, -32, 0, "↑ TIMELINE & MEMORIAL", "Boulevard Linimasa Karir RPL", 18);
    createGantry(32, 0, Math.PI / 2, "→ APEXSIONS & KASIR", "Kastil RPG & POS Store", 18);
    createGantry(-32, 0, -Math.PI / 2, "← PORORO & SKILLS", "Gelato Cafe & Tech Lab", 18);
    createGantry(0, 32, Math.PI, "↓ DEVELOPER HQ & RELAY", "Markas Studio & Satelit Hub", 18);
  }

  // 9. GRAND CYBER WELCOME ARCH AT SPAWN (WIDE DRIVE-THROUGH)
  buildWelcomeArch() {
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, -14);

    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const cyanGlowMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.0 });

    // Twin Pillars set far apart (18m width) so cars pass through freely!
    const pillarGeo = new THREE.CylinderGeometry(1.4, 1.6, 9.0, 6);
    const towerL = new THREE.Mesh(pillarGeo, darkMat);
    towerL.position.set(-9.2, 4.5, 0);
    towerL.castShadow = true;
    archGroup.add(towerL);

    const towerR = towerL.clone();
    towerR.position.x = 9.2;
    archGroup.add(towerR);

    // Glowing Neon Rings
    for (let y = 1.8; y <= 7.8; y += 2.0) {
      const ringL = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.08, 8, 16), cyanGlowMat);
      ringL.rotation.x = Math.PI / 2;
      ringL.position.set(-9.2, y, 0);
      archGroup.add(ringL);

      const ringR = ringL.clone();
      ringR.position.x = 9.2;
      archGroup.add(ringR);
    }

    // Overhead Arch Span (Clearance 7.5m high)
    const span = new THREE.Mesh(new THREE.BoxGeometry(20, 1.4, 2.0), darkMat);
    span.position.set(0, 8.5, 0);
    span.castShadow = true;
    archGroup.add(span);

    // Welcome Sign
    const welcomeTex = this.createSignTexture("METROPOLIS DEV WORLD", "#0284c7", "#ffffff", "Rafriel Raditya Widodo • SMKN 71 RPL");
    const welcomeSign = new THREE.Mesh(new THREE.PlaneGeometry(12, 2.6), new THREE.MeshBasicMaterial({ map: welcomeTex }));
    welcomeSign.position.set(0, 8.5, 1.15);
    archGroup.add(welcomeSign);

    this.scene.add(archGroup);
    this.collision.addBox(-9.2, -14, 3.2, 3.2, "welcome_arch_l");
    this.collision.addBox(9.2, -14, 3.2, 3.2, "welcome_arch_r");
  }

  // 10. APEXSIONS MEDIEVAL ARCHITECTURE (EAST REALM)
  buildCastleArchitecture() {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.3 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 });

    const createGuardTower = (x, z) => {
      const tower = new THREE.Group();
      tower.position.set(x, 0, z);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.4, 10, 8), stoneMat);
      shaft.position.y = 5.0;
      shaft.castShadow = true;
      tower.add(shaft);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 4.0, 8), roofMat);
      roof.position.y = 12.0;
      roof.castShadow = true;
      tower.add(roof);

      this.scene.add(tower);
      this.collision.addCircle(x, z, 2.5, "castle_guard_tower");
    };

    createGuardTower(105, -60);
    createGuardTower(105, -10);
    createGuardTower(135, -60);
    createGuardTower(135, -10);

    // Wall
    const wallEast = new THREE.Mesh(new THREE.BoxGeometry(26, 4.2, 1.4), stoneMat);
    wallEast.position.set(120, 2.1, -60);
    wallEast.castShadow = true;
    this.scene.add(wallEast);
    this.collision.addBox(120, -60, 26, 1.8, "castle_wall_north");
  }

  // 11. POS KASIR COMMERCIAL RETAIL PLAZA
  buildCommercialPlaza() {
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.75
    });
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });

    const plazaGroup = new THREE.Group();
    plazaGroup.position.set(115, 0, 45);

    const store = new THREE.Mesh(new THREE.BoxGeometry(18, 8.5, 12), concreteMat);
    store.position.set(0, 4.25, 0);
    store.castShadow = true;
    store.receiveShadow = true;
    plazaGroup.add(store);

    const glassFacade = new THREE.Mesh(new THREE.PlaneGeometry(16, 7.5), glassMat);
    glassFacade.position.set(0, 4.25, 6.05);
    plazaGroup.add(glassFacade);

    const mallSignTex = this.createSignTexture("FRIEL POS DIGITAL MART", "#0284c7", "#ffffff", "Nuxt 4 Frontend • Laravel REST API");
    const mallSign = new THREE.Mesh(new THREE.PlaneGeometry(12, 2.2), new THREE.MeshBasicMaterial({ map: mallSignTex }));
    mallSign.position.set(0, 8.8, 6.1);
    plazaGroup.add(mallSign);

    this.scene.add(plazaGroup);
    this.collision.addBox(115, 45, 19, 13, "commercial_store_annex");
  }

  // 12. PORORO GELATO CAFE & SAKURA PROMENADE
  buildGelatoPlaza() {
    const plazaGroup = new THREE.Group();
    plazaGroup.position.set(-115, 0, -45);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 });

    const cafe = new THREE.Mesh(new THREE.BoxGeometry(16, 6.5, 14), wallMat);
    cafe.position.y = 3.25;
    cafe.castShadow = true;
    cafe.receiveShadow = true;
    plazaGroup.add(cafe);

    const awning = new THREE.Mesh(new THREE.BoxGeometry(17, 0.4, 3.5), roofMat);
    awning.position.set(0, 4.5, 7.5);
    awning.rotation.x = 0.2;
    plazaGroup.add(awning);

    // GIANT 3D SCULPTED GELATO ICE CREAM CONE MONUMENT
    const conePedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 1.5, 8), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    conePedestal.position.set(-14, 0.75, 8);
    plazaGroup.add(conePedestal);

    const waffleCone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.2, 10), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }));
    waffleCone.position.set(-14, 3.4, 8);
    waffleCone.rotation.x = Math.PI;
    plazaGroup.add(waffleCone);

    const scoopMint = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 10), new THREE.MeshStandardMaterial({ color: 0x6ee7b7 }));
    scoopMint.position.set(-14, 5.0, 8);
    plazaGroup.add(scoopMint);

    const scoopPink = new THREE.Mesh(new THREE.SphereGeometry(1.15, 10, 10), new THREE.MeshStandardMaterial({ color: 0xf472b6 }));
    scoopPink.position.set(-14, 6.6, 7.8);
    plazaGroup.add(scoopPink);

    const cafeSignTex = this.createSignTexture("PORORO GELATO ARTISAN", "#db2777", "#ffffff", "18 Varian Rasa • Figma Masterplan MKK 6");
    const cafeSign = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.0), new THREE.MeshBasicMaterial({ map: cafeSignTex }));
    cafeSign.position.set(0, 6.8, 7.1);
    plazaGroup.add(cafeSign);

    this.scene.add(plazaGroup);
    this.collision.addBox(-115, -45, 17, 15, "pororo_cafe_pavilion");
    this.collision.addCircle(-115 - 14, -45 + 8, 2.5, "gelato_statue");
  }

  // 13. SKILLS LAB TECH ARCADE
  buildTechArcade() {
    const arcadeGroup = new THREE.Group();
    arcadeGroup.position.set(-115, 0, 45);

    const darkMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.8, roughness: 0.2 });
    const neonCyan = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.2 });
    const neonGold = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 2.0 });

    const serverHall = new THREE.Mesh(new THREE.BoxGeometry(16, 7.5, 14), darkMat);
    serverHall.position.y = 3.75;
    serverHall.castShadow = true;
    serverHall.receiveShadow = true;
    arcadeGroup.add(serverHall);

    // 4 GIANT KEYBOARD KEYS
    const createKeycap = (kx, kz, label, mat) => {
      const key = new THREE.Group();
      key.position.set(kx, 0, kz);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 3.2), darkMat);
      cap.position.y = 0.7;
      key.add(cap);

      const topGlow = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 2.8), mat);
      topGlow.position.y = 1.42;
      key.add(topGlow);

      arcadeGroup.add(key);
      this.collision.addBox(-115 + kx, 45 + kz, 3.5, 3.5, "keycap_" + label);
    };

    createKeycap(12, 10, "JAVA", neonGold);
    createKeycap(12, 5, "NUXT", neonCyan);
    createKeycap(12, 0, "API", neonCyan);
    createKeycap(12, -5, "CODE", neonGold);

    this.scene.add(arcadeGroup);
    this.collision.addBox(-115, 45, 17, 15, "server_hall_main");
  }

  // 14. CHRONOLOGICAL TIMELINE ARCHES (NORTH PROMENADE)
  buildTimelineAvenue() {
    const milestones = [
      { z: -45, era: "2020: Pandemi COVID-19", desc: "Awal Eksplorasi Game Minecraft" },
      { z: -68, era: "2022: Eksplorasi Addon Bedrock", desc: "Modifikasi Sistem Game Mandiri" },
      { z: -92, era: "2023: Server Minecraft Java", desc: "Setup Server & Eksplorasi Plugin" },
      { z: -118, era: "2026: Arsitek Plugin Mandiri", desc: "Ekosistem Apexsions & Software Development" }
    ];

    const archMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 });

    milestones.forEach(m => {
      const arch = new THREE.Group();
      arch.position.set(0, 0, m.z);

      // Set pillars wide (18m apart) so driving lanes are 100% open!
      const pL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.5, 1.6), archMat);
      pL.position.set(-8.5, 3.25, 0);
      pL.castShadow = true;
      arch.add(pL);

      const pR = pL.clone();
      pR.position.x = 8.5;
      arch.add(pR);

      const lintel = new THREE.Mesh(new THREE.BoxGeometry(19, 1.4, 2.0), archMat);
      lintel.position.set(0, 6.8, 0);
      lintel.castShadow = true;
      arch.add(lintel);

      const tex = this.createSignTexture(m.era, "#b45309", "#ffffff", m.desc);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(11, 2.2), new THREE.MeshBasicMaterial({ map: tex }));
      sign.position.set(0, 6.8, 1.05);
      arch.add(sign);

      this.scene.add(arch);
      this.collision.addBox(-8.5, m.z, 2.0, 2.0, "timeline_arch_l");
      this.collision.addBox(8.5, m.z, 2.0, 2.0, "timeline_arch_r");
    });
  }

  // 15. SATELLITE RELAY & DOME (SOUTH PROMENADE)
  buildObservatoryAndSatellites() {
    const southGroup = new THREE.Group();
    southGroup.position.set(0, 0, 125);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });

    // Observatory Dome
    const baseCyl = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 7.0, 3.5, 16), baseMat);
    baseCyl.position.set(25, 1.75, 0);
    southGroup.add(baseCyl);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(6.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.7 })
    );
    dome.position.set(25, 3.5, 0);
    southGroup.add(dome);

    // Radio Satellite Dish
    const dishGantry = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 6.5, 8), baseMat);
    dishGantry.position.set(-25, 3.25, 0);
    southGroup.add(dishGantry);

    const dishHead = new THREE.Mesh(new THREE.ConeGeometry(5.5, 2.2, 16, 1, true), metalMat);
    dishHead.position.set(-25, 7.2, 0);
    dishHead.rotation.x = Math.PI / 3;
    dishHead.rotation.z = Math.PI / 6;
    southGroup.add(dishHead);

    this.scene.add(southGroup);
    this.collision.addCircle(25, 125, 7.0, "observatory_dome");
    this.collision.addCircle(-25, 125, 3.5, "satellite_dish_base");
  }

  // 16. ROTATING WIND TURBINES ON OUTER HILLS
  buildWindTurbines() {
    const turbinePositions = [
      [175, -135],
      [-175, -135],
      [175, 135],
      [-175, 135]
    ];

    const towerMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });

    turbinePositions.forEach(([x, z]) => {
      const turbineGroup = new THREE.Group();
      turbineGroup.position.set(x, 0, z);

      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.8, 28, 10), towerMat);
      tower.position.y = 14;
      tower.castShadow = true;
      turbineGroup.add(tower);

      const nacelle = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 4.5), towerMat);
      nacelle.position.set(0, 28, 0);
      turbineGroup.add(nacelle);

      const hub = new THREE.Group();
      hub.position.set(0, 28, 2.4);

      const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.6, 10), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
      noseCone.rotation.x = Math.PI / 2;
      hub.add(noseCone);

      for (let b = 0; b < 3; b++) {
        const bladeArm = new THREE.Group();
        bladeArm.rotation.z = (b * Math.PI * 2) / 3;

        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.45, 11, 0.15), bladeMat);
        blade.position.y = 5.5;
        bladeArm.add(blade);

        hub.add(bladeArm);
      }

      turbineGroup.add(hub);
      this.scene.add(turbineGroup);
      this.collision.addCircle(x, z, 2.2, "wind_turbine_base");

      this.windTurbines.push({ hub, speed: 1.0 + Math.random() * 0.6 });
    });
  }

  // 17. PERIMETER FENCE SIZED FOR 460 x 460
  buildPerimeterFence() {
    const half = (CONFIG.WORLD.WIDTH / 2) - CONFIG.WORLD.BOUND_PADDING;
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.2 });
    const barrierGeo = new THREE.BoxGeometry(CONFIG.WORLD.WIDTH - 20, 2.0, 1.0);

    const fNorth = new THREE.Mesh(barrierGeo, fenceMat);
    fNorth.position.set(0, 1.0, -half);
    fNorth.castShadow = true;
    this.scene.add(fNorth);
    this.collision.addBox(0, -half, CONFIG.WORLD.WIDTH - 20, 1.8, "fence_north");

    const fSouth = new THREE.Mesh(barrierGeo, fenceMat);
    fSouth.position.set(0, 1.0, half);
    fSouth.castShadow = true;
    this.scene.add(fSouth);
    this.collision.addBox(0, half, CONFIG.WORLD.WIDTH - 20, 1.8, "fence_south");

    const sideGeo = new THREE.BoxGeometry(1.0, 2.0, CONFIG.WORLD.DEPTH - 20);
    const fEast = new THREE.Mesh(sideGeo, fenceMat);
    fEast.position.set(half, 1.0, 0);
    fEast.castShadow = true;
    this.scene.add(fEast);
    this.collision.addBox(half, 0, 1.8, CONFIG.WORLD.DEPTH - 20, "fence_east");

    const fWest = new THREE.Mesh(sideGeo, fenceMat);
    fWest.position.set(-half, 1.0, 0);
    fWest.castShadow = true;
    this.scene.add(fWest);
    this.collision.addBox(-half, 0, 1.8, CONFIG.WORLD.DEPTH - 20, "fence_west");
  }

  // 18. PROCEDURAL CLOUDS
  buildClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      transparent: true,
      opacity: 0.85
    });

    for (let i = 0; i < 28; i++) {
      const cloud = new THREE.Group();
      const numBlobs = 4 + Math.floor(Math.random() * 5);

      for (let b = 0; b < numBlobs; b++) {
        const radius = 4.0 + Math.random() * 3.5;
        const blob = new THREE.Mesh(new THREE.SphereGeometry(radius, 7, 7), cloudMat);
        blob.position.set(
          (b - numBlobs / 2) * 4.2 + (Math.random() - 0.5) * 2.5,
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 3.5
        );
        cloud.add(blob);
      }

      cloud.position.set(
        (Math.random() - 0.5) * CONFIG.WORLD.WIDTH,
        36 + Math.random() * 18,
        (Math.random() - 0.5) * CONFIG.WORLD.DEPTH
      );

      this.scene.add(cloud);
      this.clouds.push({
        group: cloud,
        speed: 1.0 + Math.random() * 2.0
      });
    }
  }

  update(deltaTime) {
    const halfWidth = CONFIG.WORLD.WIDTH / 2;
    for (const c of this.clouds) {
      c.group.position.x += c.speed * deltaTime;
      if (c.group.position.x > halfWidth + 50) {
        c.group.position.x = -halfWidth - 50;
      }
    }

    for (const t of this.windTurbines) {
      t.hub.rotation.z += t.speed * deltaTime;
    }
  }
}
