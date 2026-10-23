/**
 * ENVIRONMENT & METROPOLIS CITY ARCHITECTURE
 * Membangun tata kota modern yang teratur, simetris, dan 100% BEBAS DARI HAMBATAN:
 * - Seluruh jalan raya (Main Avenue 16m, East-West Boulevard 16m, Secondary Streets 12m, Outer Ring 14m)
 *   100% BERSIH tanpa tiang, gapura rintangan, maupun mobil yang menghalangi lajur berkendara.
 * - Jembatan lebar (18m) di setiap persimpangan kanal air (Z: -22).
 * - Semua zona portofolio terletak di dalam kavling/plaza khusus (off-road) dengan jalan masuk beraspal.
 * - Blok perkotaan tertata simetris dengan gedung pencakar langit dan perkantoran modern di area komersial.
 * - Taman Kota Pusat (Central Commons Park) dengan air mancur marmer bundar (diameter 12m).
 * - Seluruh mobil dekorasi parkir di kantong parkir resmi (off-street parking bays) dekat plaza tujuan.
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
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, canvas.width / 2, subText ? 52 : 70);

      if (subText) {
        ctx.font = "600 22px sans-serif";
        ctx.fillStyle = "#38bdf8";
        ctx.fillText(subText, canvas.width / 2, 98);
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
    this.buildCitySkyscrapersAndBlocks();
    this.buildOffStreetParkingLots();
    this.buildStreetlightsAndTrees();
    this.buildWindTurbines();
    this.buildPerimeterFence();
    this.buildClouds();
  }

  buildCityArchitecture() {
    this.buildCitySkyscrapersAndBlocks();
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

  // 2. WATER CANAL & 5 ROAD BRIDGES (ALL 18M WIDE)
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
    createBridge(75, -22);   // East Secondary Street Bridge
    createBridge(-75, -22);  // West Secondary Street Bridge
    createBridge(145, -22);  // East Expressway Bridge
    createBridge(-145, -22); // West Expressway Bridge
  }

  // 3. ROAD NETWORK (100% CLEAR BOULEVARDS WITH CONNECTING DRIVEWAY SPURS)
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

    // Central Roundabout at Spawn (Radius 20m, 100% open drivable ring!)
    const circleGeo = new THREE.RingGeometry(0, 20, 36);
    circleGeo.rotateX(-Math.PI / 2);
    const roundAbout = new THREE.Mesh(circleGeo, roadMat);
    roundAbout.position.set(0, 0.02, 0);
    roundAbout.receiveShadow = true;
    this.scene.add(roundAbout);

    // Decorative inner spawn plaza ring
    const plazaRingGeo = new THREE.RingGeometry(5.5, 7.0, 32);
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

    // 5. Connecting Driveway Spurs (Direct 10m-wide asphalt roads into each plaza)
    const createSpur = (startX, startZ, endX, endZ) => {
      const dx = endX - startX;
      const dz = endZ - startZ;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const midX = (startX + endX) / 2;
      const midZ = (startZ + endZ) / 2;

      const spurGeo = new THREE.PlaneGeometry(10, len);
      spurGeo.rotateX(-Math.PI / 2);
      const spur = new THREE.Mesh(spurGeo, roadMat);
      spur.rotation.y = -angle;
      spur.position.set(midX, 0.025, midZ);
      spur.receiveShadow = true;
      this.scene.add(spur);
    };

    createSpur(75, -105, 95, -105); // Spur into Apexsions Fortress
    createSpur(75, -35, 95, -35);   // Spur into POS Kasir Plaza
    createSpur(75, 105, 95, 105);   // Spur into Developer HQ
    createSpur(-75, -105, -95, -105); // Spur into PoRoRo Gelato
    createSpur(-75, -35, -95, -35);   // Spur into Journey Promenade
    createSpur(-75, 35, -95, 35);     // Spur into Skills Lab
    createSpur(-75, 105, -95, 105);   // Spur into Contact Relay

    // Crosswalks at main intersections
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
  }

  // 4. CENTRAL CITY COMMONS PARK (SOUTH-EAST INNER BLOCK)
  buildCentralCityPark() {
    const parkGroup = new THREE.Group();
    parkGroup.position.set(38, 0, 38);

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
      this.collision.addCircle(38 + tx, 38 + tz, 1.2, "park_tree");
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
    this.collision.addCircle(38, 38, 6.0, "central_fountain");
  }

  // 5. MODERN CITY BUILDINGS IN NEAT COMMERCIAL BLOCKS
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

    // BUILDER 1: MULTI-TIER GLASS SKYSCRAPER
    const createSkyscraper = (x, z, width, depth, height, mat, name = "skyscraper") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const podiumH = height * 0.3;
      const podium = new THREE.Mesh(new THREE.BoxGeometry(width, podiumH, depth), matCorporateWhite);
      podium.position.y = podiumH / 2;
      podium.castShadow = true;
      g.add(podium);

      const towerH = height * 0.7;
      const towerW = width * 0.82;
      const towerD = depth * 0.82;
      const tower = new THREE.Mesh(new THREE.BoxGeometry(towerW, towerH, towerD), mat);
      tower.position.y = podiumH + towerH / 2;
      tower.castShadow = true;
      g.add(tower);

      const crown = new THREE.Mesh(new THREE.BoxGeometry(towerW * 0.6, 2.2, towerD * 0.6), roofMat);
      crown.position.y = height + 1.1;
      crown.castShadow = true;
      g.add(crown);

      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 7.5, 6), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 }));
      spire.position.y = height + 5.5;
      g.add(spire);

      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 6), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      beacon.position.y = height + 9.2;
      g.add(beacon);

      this.scene.add(g);
      this.collision.addBox(x, z, width + 0.5, depth + 0.5, name);
    };

    // BUILDER 2: CORPORATE OFFICE BLOCK
    const createOfficeBlock = (x, z, width, depth, height, mat, name = "office_block") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
      body.position.y = height / 2;
      body.castShadow = true;
      g.add(body);

      const lobby = new THREE.Mesh(
        new THREE.BoxGeometry(width - 2, 4.2, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, transparent: true, opacity: 0.65 })
      );
      lobby.position.set(0, 2.1, depth / 2 + 0.2);
      g.add(lobby);

      const ac = new THREE.Mesh(new THREE.BoxGeometry(width * 0.4, 1.8, depth * 0.4), acMat);
      ac.position.set(0, height + 0.9, 0);
      ac.castShadow = true;
      g.add(ac);

      this.scene.add(g);
      this.collision.addBox(x, z, width + 0.5, depth + 0.5, name);
    };

    // BUILDER 3: URBAN BRICK BOUTIQUE
    const createBrownstone = (x, z, width, depth, height, name = "brownstone") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), matBrickLoft);
      body.position.y = height / 2;
      body.castShadow = true;
      g.add(body);

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

    // Designated Commercial Parcels (Safely inside city blocks, leaving plazas completely open!)
    // QUADRANT 1 INNER (NE): X: 35, Z: -38 to -58
    createSkyscraper(38, -38, 15, 15, 42, matGlassHighrise, "skyscraper_ne_crown");
    createOfficeBlock(38, -58, 15, 14, 24, matCorporateWhite, "office_ne_1");

    // QUADRANT 2 INNER (NW): X: -35, Z: -38 to -58
    createSkyscraper(-38, -38, 15, 15, 38, matCharcoal, "skyscraper_nw_1");
    createBrownstone(-38, -58, 15, 14, 15, "brownstone_nw_1");

    // QUADRANT 3 INNER (SW): X: -38, Z: 38 to 58
    createSkyscraper(-38, 38, 15, 15, 40, matGlassHighrise, "skyscraper_sw_tech");
    createOfficeBlock(-38, 58, 15, 14, 22, matCharcoal, "office_sw_1");

    // FAR OUTER SKYLINE TOWERS (Along perimeter beyond ±135, away from plazas)
    createOfficeBlock(138, -60, 14, 16, 26, matCorporateWhite, "skyline_outer_ne");
    createOfficeBlock(138, 60, 14, 16, 24, matDarkTitanium, "skyline_outer_se");
    createOfficeBlock(-138, -60, 14, 16, 26, matCorporateWhite, "skyline_outer_nw");
    createOfficeBlock(-138, 60, 14, 16, 24, matCharcoal, "skyline_outer_sw");
  }

  // 6. OFF-STREET PARKING LOTS (ADJACENT TO PLAZAS, ZERO IN DRIVING LANES!)
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

    // Dedicated Parking Lot 1: POS Kasir Shopping Plaza (X: 90, Z: -35)
    const lot1 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 20), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
    lot1.position.set(90, 0.05, -35);
    lot1.receiveShadow = true;
    this.scene.add(lot1);

    createCar(88, -40, Math.PI / 2, "vanWhite");
    createCar(88, -35, Math.PI / 2, "taxi");
    createCar(88, -30, Math.PI / 2, "sedanBlue");

    // Dedicated Parking Lot 2: PoRoRo Gelato Cafe (X: -90, Z: -105)
    const lot2 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 20), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
    lot2.position.set(-90, 0.05, -105);
    lot2.receiveShadow = true;
    this.scene.add(lot2);

    createCar(-88, -110, Math.PI / 2, "taxi");
    createCar(-88, -105, Math.PI / 2, "sportsRed");
    createCar(-88, -100, Math.PI / 2, "sedanSilver");

    // Dedicated Parking Lot 3: Developer HQ Courtyard (X: 90, Z: 105)
    const lot3 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 20), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
    lot3.position.set(90, 0.05, 105);
    lot3.receiveShadow = true;
    this.scene.add(lot3);

    createCar(88, 100, Math.PI / 2, "sedanBlue");
    createCar(88, 105, Math.PI / 2, "sportsRed");
    createCar(88, 110, Math.PI / 2, "sedanSilver");
  }

  // 7. STREETLIGHTS & TREES ALIGNED NEATLY ON OUTER SIDEWALKS
  buildStreetlightsAndTrees() {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });

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

      this.scene.add(lamp);
      this.collision.addCircle(x, z, 0.7, "streetlight");
    };

    // Streetlights strictly spaced on outer sidewalk boundaries (11.5m from road center)
    const lampCoords = [
      [11.5, -45], [-11.5, -45], [11.5, -95], [-11.5, -95],
      [11.5, 45], [-11.5, 45], [11.5, 95], [-11.5, 95],
      [45, 11.5], [45, -11.5], [95, 11.5], [95, -11.5],
      [-45, 11.5], [-45, -11.5], [-95, 11.5], [-95, -11.5]
    ];
    lampCoords.forEach(([x, z]) => createCleanLamp(x, z));

    // Sidewalk Trees
    const createSidewalkTree = (x, z) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0.15, z);

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
      [11.5, -30], [-11.5, -30], [11.5, -70], [-11.5, -70],
      [11.5, 30], [-11.5, 30], [11.5, 70], [-11.5, 70],
      [30, 11.5], [30, -11.5], [70, 11.5], [70, -11.5],
      [-30, 11.5], [-30, -11.5], [-70, 11.5], [-70, -11.5]
    ];
    treeCoords.forEach(([x, z]) => createSidewalkTree(x, z));
  }

  // 8. ROTATING WIND TURBINES ON OUTER HILLS
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

  // 9. PERIMETER FENCE SIZED FOR 460 x 460
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

  // 10. PROCEDURAL CLOUDS
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
