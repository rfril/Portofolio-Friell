/**
 * ENVIRONMENT & METROPOLIS CITY ARCHITECTURE
 * Membangun tata kota modern yang teratur, sangat rapi, dan bersih dari hambatan:
 * - Jalan raya 2 jalur aspal mulus yang LEBAR (16m) dan 100% BEBAS DARI RINTANGAN TIANG/MOBIL.
 * - Trotoar granit berundak (sidewalks) rapi di kanan-kiri jalan dengan lampu jalan modern di sisi terluar.
 * - Blok perkotaan tertata simetris dengan 4 tipe arsitektur gedung realistis:
 *   1. Glass Skyscrapers bertingkat dengan multi-tier setback & antena pemancar.
 *   2. Corporate Office Towers modern dengan lobi kaca & parapet atap.
 *   3. Urban Brownstones / Brick Lofts bertoko ritel dengan kanopi kanvas.
 *   4. Tech Campus Pavilions futuristik.
 * - Taman Kota Pusat (City Commons Park) dengan air mancur marmer bundar dan jalan setapak.
 * - Mobil-mobil terparkir rapi HANYA di area parkir khusus (off-street parking bays), TIDAK ADA di badan jalan.
 * - Distrik khusus terintegrasi: Benteng Apexsions, Mall POS Kasir, Kafe PoRoRo Sakura,
 *   Arkade Skills, Markas Developer HQ (Tentang Saya), dan Museum Linimasa.
 */

import { CONFIG } from "../core/Config.js";

export class Environment {
  constructor(scene, collisionSystem) {
    this.scene = scene;
    this.collision = collisionSystem;
    this.clouds = [];
    this.windTurbines = [];

    // Helper Texture Generator for Signs
    this.createSignTexture = (text, bgColor = "#0f172a", textColor = "#ffffff", subText = "") => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 140;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

      ctx.fillStyle = textColor;
      ctx.font = "bold 38px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, canvas.width / 2, subText ? 55 : 70);

      if (subText) {
        ctx.font = "600 22px sans-serif";
        ctx.fillStyle = "#38bdf8";
        ctx.fillText(subText, canvas.width / 2, 100);
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

    this.initMetropolis();
  }

  initMetropolis() {
    this.buildTerrain();
    this.buildWaterCanalAndBridges();
    this.buildRoadNetwork();
    this.buildCentralCityPark();
    this.buildCityArchitecture();
    this.buildOffStreetParkingLots();
    this.buildStreetlightsAndTrees();
    this.buildDistrictLandmarks();
    this.buildWindTurbines();
    this.buildPerimeterFence();
    this.buildClouds();
  }

  // 1. TERRAIN & MOUNTAIN SILHOUETTES
  buildTerrain() {
    const groundGeo = new THREE.PlaneGeometry(CONFIG.WORLD.WIDTH, CONFIG.WORLD.DEPTH, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x86efac, // Soft pasture green
      roughness: 0.9,
      metalness: 0.05
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    ground.position.y = -0.05;
    this.scene.add(ground);

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
    createMountain(-half + 30, -half + 30, 36, 48);
    createMountain(half - 30, -half + 30, 38, 50);
    createMountain(-half + 30, half - 30, 34, 45);
    createMountain(half - 30, half - 30, 36, 48);
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

    // Bridges (Width 18m so driving is 100% wide and spacious!)
    const createBridge = (x, z) => {
      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.set(x, 0, z);

      const deck = new THREE.Mesh(new THREE.BoxGeometry(18, 0.35, 20), stoneMat);
      deck.position.y = 0.18;
      deck.receiveShadow = true;
      deck.castShadow = true;
      bridgeGroup.add(deck);

      const railGeo = new THREE.BoxGeometry(0.8, 1.2, 20);
      const railL = new THREE.Mesh(railGeo, stoneMat);
      railL.position.set(-8.6, 0.8, 0);
      railL.castShadow = true;
      bridgeGroup.add(railL);

      const railR = railL.clone();
      railR.position.x = 8.6;
      bridgeGroup.add(railR);

      this.scene.add(bridgeGroup);
      this.collision.addBox(x - 8.6, z, 1.0, 20, "bridge_rail_l");
      this.collision.addBox(x + 8.6, z, 1.0, 20, "bridge_rail_r");
    };

    createBridge(0, -22);    // Main Avenue Bridge
    createBridge(140, -22);  // East Expressway Bridge
    createBridge(-140, -22); // West Expressway Bridge
  }

  // 3. ROAD NETWORK (16M WIDE, CLEAN, ASPHALT DUAL-LANE & CURBED SIDEWALKS)
  buildRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });

    const createCleanRoad = (x, z, width, length, rotY = 0) => {
      const roadGroup = new THREE.Group();
      roadGroup.position.set(x, 0, z);
      roadGroup.rotation.y = rotY;

      // Asphalt Road Surface
      const roadGeo = new THREE.PlaneGeometry(width, length);
      roadGeo.rotateX(-Math.PI / 2);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.y = 0.02;
      road.receiveShadow = true;
      roadGroup.add(road);

      // Center Dashed Yellow Divider Lines
      const lineCount = Math.floor(length / 8);
      const lineGeo = new THREE.PlaneGeometry(0.35, 3.5);
      lineGeo.rotateX(-Math.PI / 2);

      for (let i = 0; i < lineCount; i++) {
        const line = new THREE.Mesh(lineGeo, yellowMat);
        line.position.set(0, 0.03, -length / 2 + (i + 0.5) * 8);
        roadGroup.add(line);
      }

      // White Edge Lines
      const edgeGeo = new THREE.PlaneGeometry(0.25, length);
      edgeGeo.rotateX(-Math.PI / 2);

      const edgeL = new THREE.Mesh(edgeGeo, whiteMat);
      edgeL.position.set(-width / 2 + 0.35, 0.025, 0);
      roadGroup.add(edgeL);

      const edgeR = edgeL.clone();
      edgeR.position.x = width / 2 - 0.35;
      roadGroup.add(edgeR);

      // Granite Sidewalks (Elevated 0.15m, 3.5m wide)
      const walkGeo = new THREE.BoxGeometry(3.5, 0.15, length);
      const walkL = new THREE.Mesh(walkGeo, curbMat);
      walkL.position.set(-width / 2 - 1.75, 0.075, 0);
      walkL.receiveShadow = true;
      roadGroup.add(walkL);

      const walkR = walkL.clone();
      walkR.position.x = width / 2 + 1.75;
      roadGroup.add(walkR);

      this.scene.add(roadGroup);
    };

    // Central Roundabout at Spawn (Radius 20m, spacious drive-through!)
    const circleGeo = new THREE.RingGeometry(0, 20, 36);
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

    // 1. Central North-South Main Avenue (Width: 16m, Runs from -160 to +160)
    createCleanRoad(0, -95, 16, 150, 0);
    createCleanRoad(0, 95, 16, 150, 0);

    // 2. Central East-West Boulevard (Width: 16m, Runs from -160 to +160)
    createCleanRoad(95, 0, 16, 150, Math.PI / 2);
    createCleanRoad(-95, 0, 16, 150, Math.PI / 2);

    // 3. Secondary Cross Streets (Width: 12m)
    createCleanRoad(0, -75, 12, 280, Math.PI / 2);
    createCleanRoad(0, 75, 12, 280, Math.PI / 2);
    createCleanRoad(75, 0, 12, 280, 0);
    createCleanRoad(-75, 0, 12, 280, 0);

    // 4. Outer Ring Expressway (Width: 14m)
    createCleanRoad(145, 0, 14, 300, 0);
    createCleanRoad(-145, 0, 14, 300, 0);
    createCleanRoad(0, -145, 14, 300, Math.PI / 2);
    createCleanRoad(0, 145, 14, 300, Math.PI / 2);

    // Flat Painted Crosswalks at Intersections (No collision, zero obstruction!)
    const createZebra = (x, z, width = 16, rotY = 0) => {
      const g = new THREE.Group();
      g.position.set(x, 0.035, z);
      g.rotation.y = rotY;
      const bars = Math.floor(width / 1.4);
      const sGeo = new THREE.PlaneGeometry(0.7, 3.2);
      sGeo.rotateX(-Math.PI / 2);
      for (let i = 0; i < bars; i++) {
        const stripe = new THREE.Mesh(sGeo, whiteMat);
        stripe.position.set(-width / 2 + (i + 0.5) * 1.4, 0, 0);
        g.add(stripe);
      }
      this.scene.add(g);
    };

    createZebra(0, -22, 16, 0);
    createZebra(0, 22, 16, 0);
    createZebra(-22, 0, 16, Math.PI / 2);
    createZebra(22, 0, 16, Math.PI / 2);
    createZebra(75, -75, 12, 0);
    createZebra(-75, -75, 12, 0);
    createZebra(75, 75, 12, 0);
    createZebra(-75, 75, 12, 0);
  }

  // 4. CENTRAL CITY COMMONS PARK (SOUTH-EAST INNER BLOCK)
  buildCentralCityPark() {
    const parkGroup = new THREE.Group();
    parkGroup.position.set(40, 0, 40);

    // Park Lawn Plaza (44 x 44m)
    const lawn = new THREE.Mesh(
      new THREE.BoxGeometry(44, 0.2, 44),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.9 })
    );
    lawn.position.y = 0.1;
    lawn.receiveShadow = true;
    parkGroup.add(lawn);

    // Large Circular Marble Fountain
    const fountainBase = new THREE.Mesh(
      new THREE.CylinderGeometry(5.5, 6.0, 1.2, 24),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
    );
    fountainBase.position.y = 0.6;
    fountainBase.castShadow = true;
    parkGroup.add(fountainBase);

    // Fountain Water Surface
    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(5.0, 5.0, 0.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.4 })
    );
    water.position.y = 1.1;
    parkGroup.add(water);

    // Center Spire
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.4, 3.2, 12),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1 })
    );
    spire.position.y = 2.2;
    parkGroup.add(spire);

    // Park Trees & Benches
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });

    const parkTreeCoords = [
      [-14, -14], [14, -14], [-14, 14], [14, 14]
    ];
    parkTreeCoords.forEach(([tx, tz]) => {
      const tree = new THREE.Group();
      tree.position.set(tx, 0.2, tz);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.2, 6), trunkMat);
      trunk.position.y = 1.1;
      tree.add(trunk);

      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(2.0, 1), treeMat);
      crown.position.y = 3.2;
      crown.castShadow = true;
      tree.add(crown);

      parkGroup.add(tree);
      this.collision.addCircle(40 + tx, 40 + tz, 1.2, "park_tree");
    });

    // Park Benches
    const benchCoords = [
      [0, -8, 0], [0, 8, Math.PI], [-8, 0, Math.PI / 2], [8, 0, -Math.PI / 2]
    ];
    benchCoords.forEach(([bx, bz, rotY]) => {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.8), woodMat);
      bench.position.set(bx, 0.45, bz);
      bench.rotation.y = rotY;
      parkGroup.add(bench);
    });

    this.scene.add(parkGroup);
    this.collision.addCircle(40, 40, 6.0, "central_fountain");
  }

  // 5. 30+ REALISTIC MODERN CITY BUILDINGS IN NEAT MATRIX BLOCKS
  buildCitySkyscrapersAndBlocks() {
    const windowTexBlue = this.createWindowTexture("#0f172a", "#38bdf8", 12, 4);
    const windowTexCyan = this.createWindowTexture("#0b1120", "#22d3ee", 14, 5);
    const windowTexGold = this.createWindowTexture("#1e293b", "#fde047", 10, 4);

    const matGlassHighrise = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.15, map: windowTexBlue });
    const matCorporateWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const matCharcoal = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2, map: windowTexCyan });
    const matBrickLoft = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
    const matDarkTitanium = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3, map: windowTexGold });

    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const acMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 });

    // =========================================================================
    // BUILDER 1: MULTI-TIER GLASS HIGH-RISE SKYSCRAPER (HEIGHT 30m - 44m)
    // =========================================================================
    const createSkyscraper = (x, z, width, depth, height, mat, name = "skyscraper") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      // Base Podium (3 floors)
      const podiumH = height * 0.3;
      const podium = new THREE.Mesh(new THREE.BoxGeometry(width, podiumH, depth), matCorporateWhite);
      podium.position.y = podiumH / 2;
      podium.castShadow = true;
      g.add(podium);

      // Slender Glass Upper Tower
      const towerH = height * 0.7;
      const towerW = width * 0.82;
      const towerD = depth * 0.82;
      const tower = new THREE.Mesh(new THREE.BoxGeometry(towerW, towerH, towerD), mat);
      tower.position.y = podiumH + towerH / 2;
      tower.castShadow = true;
      g.add(tower);

      // Rooftop Mechanical Crown
      const crown = new THREE.Mesh(new THREE.BoxGeometry(towerW * 0.6, 2.2, towerD * 0.6), roofMat);
      crown.position.y = height + 1.1;
      crown.castShadow = true;
      g.add(crown);

      // Antenna Spire with Red Warning Beacon
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 7.5, 6), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 }));
      spire.position.y = height + 5.5;
      g.add(spire);

      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 6), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      beacon.position.y = height + 9.2;
      g.add(beacon);

      this.scene.add(g);
      this.collision.addBox(x, z, width + 0.5, depth + 0.5, name);
    };

    // =========================================================================
    // BUILDER 2: CORPORATE OFFICE BLOCK (HEIGHT 18m - 26m)
    // =========================================================================
    const createOfficeBlock = (x, z, width, depth, height, mat, name = "office_block") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      // Main Structure
      const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
      body.position.y = height / 2;
      body.castShadow = true;
      g.add(body);

      // Double-Height Glass Entrance Lobby
      const lobby = new THREE.Mesh(
        new THREE.BoxGeometry(width - 2, 4.2, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, transparent: true, opacity: 0.65 })
      );
      lobby.position.set(0, 2.1, depth / 2 + 0.2);
      g.add(lobby);

      // Rooftop HVAC units
      const ac = new THREE.Mesh(new THREE.BoxGeometry(width * 0.4, 1.8, depth * 0.4), acMat);
      ac.position.set(0, height + 0.9, 0);
      ac.castShadow = true;
      g.add(ac);

      this.scene.add(g);
      this.collision.addBox(x, z, width + 0.5, depth + 0.5, name);
    };

    // =========================================================================
    // BUILDER 3: URBAN BRICK BROWNSTONE / RETAIL SHOPFRONT (HEIGHT 10m - 15m)
    // =========================================================================
    const createBrownstone = (x, z, width, depth, height, name = "brownstone") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), matBrickLoft);
      body.position.y = height / 2;
      body.castShadow = true;
      g.add(body);

      // Ground Floor Striped Awning
      const awning = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.85, 0.35, 2.2),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 })
      );
      awning.position.set(0, 3.2, depth / 2 + 1.1);
      awning.rotation.x = 0.2;
      g.add(awning);

      this.scene.add(g);
      this.collision.addBox(x, z, width + 0.5, depth + 0.5, name);
    };

    // =========================================================================
    // NEAT, SYMMETRICAL RECTANGULAR PARCELS INSIDE CITY BLOCKS
    // (Every building is safely set back from street curbs!)
    // =========================================================================

    // QUADRANT 1: NORTH-EAST BLOCK (X: 18 to 65, Z: -18 to -65)
    createSkyscraper(38, -38, 16, 16, 42, matGlassHighrise, "skyscraper_ne_crown");
    createOfficeBlock(38, -58, 16, 14, 24, matCorporateWhite, "office_ne_1");
    createBrownstone(58, -38, 14, 16, 14, "brownstone_ne_1");
    createOfficeBlock(58, -58, 14, 14, 20, matCharcoal, "office_ne_2");

    // QUADRANT 1 OUTER: NORTH-EAST SKYLINE (X: 85 to 135, Z: -85 to -135)
    createSkyscraper(105, -105, 18, 18, 44, matGlassHighrise, "skyline_ne_apex");
    createOfficeBlock(105, -125, 16, 14, 26, matDarkTitanium, "office_ne_outer");
    createOfficeBlock(125, -105, 14, 16, 22, matCorporateWhite, "office_ne_outer2");

    // QUADRANT 2: NORTH-WEST BLOCK (X: -65 to -18, Z: -65 to -18)
    createSkyscraper(-38, -38, 16, 16, 38, matCharcoal, "skyscraper_nw_1");
    createBrownstone(-38, -58, 16, 14, 15, "brownstone_nw_1");
    createOfficeBlock(-58, -38, 14, 16, 26, matCorporateWhite, "office_nw_1");
    createOfficeBlock(-58, -58, 14, 14, 20, matDarkTitanium, "office_nw_2");

    // QUADRANT 2 OUTER: NORTH-WEST SKYLINE (X: -135 to -85, Z: -135 to -85)
    createSkyscraper(-105, -105, 18, 18, 40, matGlassHighrise, "skyline_nw_pororo");
    createOfficeBlock(-105, -125, 16, 14, 24, matCorporateWhite, "office_nw_outer");
    createBrownstone(-125, -105, 14, 16, 14, "brownstone_nw_outer");

    // QUADRANT 3: SOUTH-WEST BLOCK (X: -65 to -18, Z: 18 to 65)
    createSkyscraper(-38, 38, 16, 16, 40, matGlassHighrise, "skyscraper_sw_tech");
    createOfficeBlock(-38, 58, 16, 14, 22, matCharcoal, "office_sw_1");
    createBrownstone(-58, 38, 14, 16, 15, "brownstone_sw_1");
    createOfficeBlock(-58, 58, 14, 14, 24, matCorporateWhite, "office_sw_2");

    // QUADRANT 3 OUTER: SOUTH-WEST TECH CORRIDOR (X: -135 to -85, Z: 85 to 135)
    createSkyscraper(-105, 105, 18, 18, 38, matDarkTitanium, "skyline_sw_skills");
    createOfficeBlock(-105, 125, 16, 14, 26, matCorporateWhite, "office_sw_outer");
    createOfficeBlock(-125, 105, 14, 16, 22, matCharcoal, "office_sw_outer2");

    // QUADRANT 4: SOUTH-EAST OUTER SKYLINE (X: 85 to 135, Z: 35 to 85)
    createSkyscraper(125, 45, 18, 18, 44, matGlassHighrise, "skyline_se_commercial");
    createOfficeBlock(125, 70, 16, 16, 26, matCorporateWhite, "office_se_kasir");

    // OUTER HIGHWAY PERIMETER TOWERS (Along outer ring at ±165)
    createOfficeBlock(0, -170, 24, 12, 28, matCorporateWhite, "tower_border_north");
    createOfficeBlock(0, 170, 24, 12, 28, matCharcoal, "tower_border_south");
    createOfficeBlock(170, 0, 12, 24, 30, matGlassHighrise, "tower_border_east");
    createOfficeBlock(-170, 0, 12, 24, 30, matDarkTitanium, "tower_border_west");
  }

  // 6. OFF-STREET PARKING LOTS WITH 14+ CARS (ZERO CARS IN DRIVING LANES!)
  buildOffStreetParkingLots() {
    const carMatColors = {
      taxi: new THREE.MeshStandardMaterial({ color: 0xfde047, metalness: 0.5, roughness: 0.3 }),
      sedanBlue: new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 }),
      sedanSilver: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 }),
      sportsRed: new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.3 }),
      vanWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    };
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const createCar = (x, z, rotY, type = "sedanBlue") => {
      const car = new THREE.Group();
      car.position.set(x, 0, z);
      car.rotation.y = rotY;

      const mat = carMatColors[type] || carMatColors.sedanBlue;

      const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 4.0), mat);
      chassis.position.y = 0.5;
      chassis.castShadow = true;
      car.add(chassis);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 2.2), glassMat);
      cabin.position.set(0, 1.0, -0.2);
      cabin.castShadow = true;
      car.add(cabin);

      if (type === "taxi") {
        const taxiSign = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.35), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        taxiSign.position.set(0, 1.4, -0.2);
        car.add(taxiSign);
      }

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

    // Dedicated Parking Lot 1: POS Kasir Shopping Plaza (X: 95, Z: 45)
    // Paved lot with parking bays safely inside the block!
    const lot1 = new THREE.Mesh(new THREE.BoxGeometry(18, 0.1, 24), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
    lot1.position.set(95, 0.05, 45);
    lot1.receiveShadow = true;
    this.scene.add(lot1);

    createCar(90, 40, Math.PI / 2, "vanWhite");
    createCar(90, 46, Math.PI / 2, "taxi");
    createCar(90, 52, Math.PI / 2, "sedanBlue");
    createCar(100, 40, -Math.PI / 2, "sportsRed");
    createCar(100, 46, -Math.PI / 2, "sedanSilver");

    // Dedicated Parking Lot 2: PoRoRo Gelato Cafe (X: -95, Z: -45)
    const lot2 = new THREE.Mesh(new THREE.BoxGeometry(18, 0.1, 24), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
    lot2.position.set(-95, 0.05, -45);
    lot2.receiveShadow = true;
    this.scene.add(lot2);

    createCar(-90, -40, Math.PI / 2, "taxi");
    createCar(-90, -46, Math.PI / 2, "sportsRed");
    createCar(-90, -52, Math.PI / 2, "sedanSilver");
    createCar(-100, -40, -Math.PI / 2, "vanWhite");
    createCar(-100, -46, -Math.PI / 2, "sedanBlue");

    // Dedicated Parking Lot 3: Developer HQ Campus Courtyard (X: 95, Z: 122)
    createCar(90, 122, 0, "sedanBlue");
    createCar(96, 122, 0, "sportsRed");
    createCar(102, 122, 0, "sedanSilver");
  }

  // 7. STREETLIGHTS & TREES ALIGNED NEATLY ON OUTER SIDEWALKS (NEVER IN ROADS)
  buildStreetlightsAndTrees() {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });

    // Clean modern streetlight placed strictly on outer edge of sidewalks (X: ±11.5, Z: ±11.5)
    const createCleanLamp = (x, z) => {
      const lamp = new THREE.Group();
      lamp.position.set(x, 0, z);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 5.2, 8), poleMat);
      pole.position.y = 2.6;
      pole.castShadow = true;
      lamp.add(pole);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.1), poleMat);
      arm.position.set(x > 0 ? -0.6 : 0.6, 5.0, 0);
      lamp.add(arm);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), lampGlowMat);
      bulb.position.set(x > 0 ? -1.2 : 1.2, 4.8, 0);
      lamp.add(bulb);

      const pLight = new THREE.PointLight(0xfef08a, 0.7, 24, 1.8);
      pLight.position.set(x > 0 ? -1.2 : 1.2, 4.8, 0);
      lamp.add(pLight);

      this.scene.add(lamp);
      this.collision.addCircle(x, z, 0.7, "streetlight");
    };

    // Streetlight positions: strictly spaced every 35m on outer sidewalk edges (11.5m from road center)
    const lampCoords = [
      [11.5, -45], [-11.5, -45], [11.5, -95], [-11.5, -95],
      [11.5, 45], [-11.5, 45], [11.5, 95], [-11.5, 95],
      [45, 11.5], [45, -11.5], [95, 11.5], [95, -11.5],
      [-45, 11.5], [-45, -11.5], [-95, 11.5], [-95, -11.5]
    ];
    lampCoords.forEach(([x, z]) => createCleanLamp(x, z));

    // Sidewalk Trees with Square Tree Grates (Planted safely on sidewalk outer edges)
    const createSidewalkTree = (x, z) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0.15, z);

      // Grate frame
      const grate = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 1.8), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      tree.add(grate);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.4, 6), trunkMat);
      trunk.position.y = 1.2;
      tree.add(trunk);

      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), foliageMat);
      crown.position.y = 3.0;
      crown.castShadow = true;
      tree.add(crown);

      this.scene.add(tree);
      this.collision.addCircle(x, z, 1.0, "street_tree");
    };

    const treeCoords = [
      [11.5, -25], [-11.5, -25], [11.5, -70], [-11.5, -70],
      [11.5, 25], [-11.5, 25], [11.5, 70], [-11.5, 70],
      [25, 11.5], [25, -11.5], [70, 11.5], [70, -11.5],
      [-25, 11.5], [-25, -11.5], [-70, 11.5], [-70, -11.5]
    ];
    treeCoords.forEach(([x, z]) => createSidewalkTree(x, z));
  }

  // 8. OVERHEAD HIGHWAY GANTRIES (SPANNING 22M SO DRIVING LANES ARE 100% CLEAR)
  buildHighwayGantries() {
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });

    const createGantry = (x, z, rotY, signText, subText) => {
      const gantry = new THREE.Group();
      gantry.position.set(x, 0, z);
      gantry.rotation.y = rotY;

      const width = 22; // 22m span! Pillars are set far back behind sidewalks!

      const pillarGeo = new THREE.CylinderGeometry(0.4, 0.4, 7.2, 8);
      const pL = new THREE.Mesh(pillarGeo, metalMat);
      pL.position.set(-width / 2, 3.6, 0);
      gantry.add(pL);

      const pR = pL.clone();
      pR.position.x = width / 2;
      gantry.add(pR);

      const beam = new THREE.Mesh(new THREE.BoxGeometry(width + 1.5, 0.7, 0.7), metalMat);
      beam.position.set(0, 6.8, 0);
      gantry.add(beam);

      const signTex = this.createSignTexture(signText, "#047857", "#ffffff", subText);
      const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 2.4), new THREE.MeshBasicMaterial({ map: signTex }));
      signBoard.position.set(0, 5.2, 0.4);
      gantry.add(signBoard);

      this.scene.add(gantry);
      this.collision.addBox(x - width / 2, z, 1.6, 1.6, "gantry_pillar_l");
      this.collision.addBox(x + width / 2, z, 1.6, 1.6, "gantry_pillar_r");
    };

    createGantry(0, -35, 0, "↑ TIMELINE BOULEVARD", "Perjalanan Karir Siswa RPL");
    createGantry(35, 0, Math.PI / 2, "→ APEXSIONS & KASIR", "Kastil RPG & Digital Mart");
    createGantry(-35, 0, -Math.PI / 2, "← PORORO & SKILLS", "Gelato Cafe & Tech Arcade");
    createGantry(0, 35, Math.PI, "↓ DEVELOPER HQ & RELAY", "Markas Studio & Satelit Hub");
  }

  // 9. GRAND WELCOME ARCH (WIDTH 24M, HUGE SPAN, 100% CLEAR ROAD)
  buildWelcomeArch() {
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, -18);

    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const cyanGlowMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.0 });

    const spanWidth = 24; // 24m wide! Pillars are far out at X = ±12

    const towerL = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 9.5, 6), darkMat);
    towerL.position.set(-spanWidth / 2, 4.75, 0);
    archGroup.add(towerL);

    const towerR = towerL.clone();
    towerR.position.x = spanWidth / 2;
    archGroup.add(towerR);

    // Overhead Bridge Beam (High 8.5m clearance!)
    const beam = new THREE.Mesh(new THREE.BoxGeometry(spanWidth + 2.5, 1.4, 2.2), darkMat);
    beam.position.set(0, 8.8, 0);
    archGroup.add(beam);

    const welcomeTex = this.createSignTexture("METROPOLIS DEV WORLD", "#0284c7", "#ffffff", "Rafriel Raditya Widodo • SMKN 71 RPL");
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(12, 2.4), new THREE.MeshBasicMaterial({ map: welcomeTex }));
    sign.position.set(0, 8.8, 1.25);
    archGroup.add(sign);

    this.scene.add(archGroup);
    this.collision.addBox(-spanWidth / 2, -18, 3.0, 3.0, "welcome_arch_l");
    this.collision.addBox(spanWidth / 2, -18, 3.0, 3.0, "welcome_arch_r");
  }

  // 10. DISTRICT LANDMARKS (SAFELY HOUSED INSIDE CITY BLOCKS)
  buildDistrictLandmarks() {
    // A. APEXSIONS CASTLE REALM (Inside North-East Block: X: 110, Z: -45)
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 });

    const createGuardTower = (x, z) => {
      const tower = new THREE.Group();
      tower.position.set(x, 0, z);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.4, 11, 8), stoneMat);
      shaft.position.y = 5.5;
      tower.add(shaft);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 4.0, 8), roofMat);
      roof.position.y = 13.0;
      tower.add(roof);

      this.scene.add(tower);
      this.collision.addCircle(x, z, 2.5, "guard_tower");
    };

    createGuardTower(100, -65);
    createGuardTower(100, -25);
    createGuardTower(130, -65);
    createGuardTower(130, -25);

    // B. PORORO GELATO CAFE & SAKURA PROMENADE (Inside North-West Block: X: -110, Z: -45)
    const gelatoGroup = new THREE.Group();
    gelatoGroup.position.set(-110, 0, -45);

    const cafe = new THREE.Mesh(new THREE.BoxGeometry(18, 7.0, 14), new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 }));
    cafe.position.y = 3.5;
    gelatoGroup.add(cafe);

    // GIANT 3D GELATO CONE STATUE
    const conePedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 1.5, 8), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    conePedestal.position.set(-14, 0.75, 8);
    gelatoGroup.add(conePedestal);

    const waffle = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.2, 10), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }));
    waffle.position.set(-14, 3.4, 8);
    waffle.rotation.x = Math.PI;
    gelatoGroup.add(waffle);

    const scoopMint = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 10), new THREE.MeshStandardMaterial({ color: 0x6ee7b7 }));
    scoopMint.position.set(-14, 5.0, 8);
    gelatoGroup.add(scoopMint);

    const scoopPink = new THREE.Mesh(new THREE.SphereGeometry(1.15, 10, 10), new THREE.MeshStandardMaterial({ color: 0xf472b6 }));
    scoopPink.position.set(-14, 6.6, 7.8);
    gelatoGroup.add(scoopPink);

    // Sakura Trees in Gelato Promenade
    const sakuraMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    [-8, 8].forEach(sx => {
      const sTree = new THREE.Group();
      sTree.position.set(sx, 0, 10);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.0, 6), trunkMat);
      trunk.position.y = 1.0;
      sTree.add(trunk);
      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 1), sakuraMat);
      crown.position.y = 2.8;
      sTree.add(crown);
      gelatoGroup.add(sTree);
    });

    this.scene.add(gelatoGroup);
    this.collision.addBox(-110, -45, 19, 15, "pororo_cafe_pavilion");
    this.collision.addCircle(-124, -37, 2.5, "gelato_statue");
  }

  // 11. TIMELINE PROMENADE (NORTH END PARK, SET BACK FROM ROADS)
  buildTimelineAvenue() {
    const milestones = [
      { z: -55, era: "2020: Pandemi COVID-19", desc: "Awal Eksplorasi Game Minecraft" },
      { z: -85, era: "2022: Eksplorasi Addon Bedrock", desc: "Modifikasi Sistem Game Mandiri" },
      { z: -115, era: "2023: Server Minecraft Java", desc: "Setup Server & Eksplorasi Plugin" }
    ];

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 });

    // Monuments placed along the North Boulevard SIDEWALK EDGES (X = -12 and X = 12, NEVER in driving lanes!)
    milestones.forEach((m, idx) => {
      const monX = idx % 2 === 0 ? -12.5 : 12.5;
      const monGroup = new THREE.Group();
      monGroup.position.set(monX, 0, m.z);

      const pedestal = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.2, 2.2), metalMat);
      pedestal.position.y = 0.6;
      monGroup.add(pedestal);

      const tex = this.createSignTexture(m.era, "#b45309", "#ffffff", m.desc);
      const board = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 1.8), new THREE.MeshBasicMaterial({ map: tex }));
      board.position.set(0, 2.2, monX < 0 ? 0.6 : -0.6);
      board.rotation.y = monX < 0 ? Math.PI / 2 : -Math.PI / 2;
      monGroup.add(board);

      this.scene.add(monGroup);
      this.collision.addBox(monX, m.z, 3.8, 2.5, "timeline_monument");
    });
  }

  // 12. SATELLITE DISH & DOME (SOUTH END PARK)
  buildObservatoryAndSatellites() {
    const southGroup = new THREE.Group();
    southGroup.position.set(0, 0, 130);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8 });
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });

    // Observatory Dome set back at X = 25
    const baseCyl = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 7.0, 3.5, 16), baseMat);
    baseCyl.position.set(25, 1.75, 0);
    southGroup.add(baseCyl);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(6.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, transparent: true, opacity: 0.7 })
    );
    dome.position.set(25, 3.5, 0);
    southGroup.add(dome);

    // Radio Satellite Dish set back at X = -25
    const dishGantry = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 6.5, 8), baseMat);
    dishGantry.position.set(-25, 3.25, 0);
    southGroup.add(dishGantry);

    const dishHead = new THREE.Mesh(new THREE.ConeGeometry(5.5, 2.2, 16, 1, true), metalMat);
    dishHead.position.set(-25, 7.2, 0);
    dishHead.rotation.x = Math.PI / 3;
    southGroup.add(dishHead);

    this.scene.add(southGroup);
    this.collision.addCircle(25, 130, 7.0, "observatory_dome");
    this.collision.addCircle(-25, 130, 3.5, "satellite_dish_base");
  }

  // 13. ROTATING WIND TURBINES ON OUTER HILLS
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
      towerGroup.add(tower);

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

  // 14. PERIMETER FENCE SIZED FOR 460 x 460
  buildPerimeterFence() {
    const half = (CONFIG.WORLD.WIDTH / 2) - CONFIG.WORLD.BOUND_PADDING;
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.2 });
    const barrierGeo = new THREE.BoxGeometry(CONFIG.WORLD.WIDTH - 20, 2.0, 1.0);

    const fNorth = new THREE.Mesh(barrierGeo, fenceMat);
    fNorth.position.set(0, 1.0, -half);
    this.scene.add(fNorth);
    this.collision.addBox(0, -half, CONFIG.WORLD.WIDTH - 20, 1.8, "fence_north");

    const fSouth = new THREE.Mesh(barrierGeo, fenceMat);
    fSouth.position.set(0, 1.0, half);
    this.scene.add(fSouth);
    this.collision.addBox(0, half, CONFIG.WORLD.WIDTH - 20, 1.8, "fence_south");

    const sideGeo = new THREE.BoxGeometry(1.0, 2.0, CONFIG.WORLD.DEPTH - 20);
    const fEast = new THREE.Mesh(sideGeo, fenceMat);
    fEast.position.set(half, 1.0, 0);
    this.scene.add(fEast);
    this.collision.addBox(half, 0, 1.8, CONFIG.WORLD.DEPTH - 20, "fence_east");

    const fWest = new THREE.Mesh(sideGeo, fenceMat);
    fWest.position.set(-half, 1.0, 0);
    this.scene.add(fWest);
    this.collision.addBox(-half, 0, 1.8, CONFIG.WORLD.DEPTH - 20, "fence_west");
  }

  // 15. PROCEDURAL CLOUDS
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
