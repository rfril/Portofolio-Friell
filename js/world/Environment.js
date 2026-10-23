/**
 * ENVIRONMENT & WORLD ARCHITECTURE
 * Membangun lanskap dunia 3D luas dan megah yang mengelilingi seluruh area portofolio:
 * - Jaringan jalan raya beraspal, jalur lingkar bebas hambatan (expressway), dan jembatan melintasi kanal air.
 * - Gapura Selamat Datang Cyber di Spawn.
 * - Gerbang Kastil & Tembok Benteng Abad Pertengahan di Distrik Apexsions.
 * - Plaza Mall Komersial Kaca Modern di Distrik POS Kasir.
 * - Promenade Es Krim Gelato Artisan & Taman Sakura di Distrik PoRoRo.
 * - Arkade Monolit Keyboard & Rak Server di Distrik Skills Lab.
 * - Gapura Monumental Linimasa di Boulevard Perjalanan.
 * - Observatorium Kubah Kaca & Antena Satelit Raksasa di Distrik Kontak.
 * - Turbin Angin berputar di perbukitan luar, pepohonan beragam spesies (pinus, oak, sakura),
 *   lampu jalan, rambu jalan tol gantry melintang, dan awan volumetrik.
 */

import { CONFIG } from "../core/Config.js";

export class Environment {
  constructor(scene, collisionSystem) {
    this.scene = scene;
    this.collision = collisionSystem;
    this.clouds = [];
    this.windTurbines = [];
    this.animatedLights = [];

    // Helper Canvas Texture Generator for Road & Highway Signs
    this.createSignTexture = (text, bgColor = "#047857", textColor = "#ffffff", subText = "") => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 160;
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

      // Main Text
      ctx.fillStyle = textColor;
      ctx.font = "bold 42px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, canvas.width / 2, subText ? 65 : 80);

      // Subtitle / Direction arrow
      if (subText) {
        ctx.font = "600 24px sans-serif";
        ctx.fillStyle = "#fef08a";
        ctx.fillText(subText, canvas.width / 2, 115);
      }

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    this.buildTerrain();
    this.buildWaterCanalAndBridges();
    this.buildRoadNetwork();
    this.buildHighwayGantries();
    this.buildWelcomeArch();
    this.buildCastleArchitecture();
    this.buildCommercialPlaza();
    this.buildGelatoPlaza();
    this.buildTechArcade();
    this.buildTimelineAvenue();
    this.buildObservatoryAndSatellites();
    this.buildWindTurbines();
    this.buildVegetation();
    this.buildStreetFurniture();
    this.buildPerimeterFence();
    this.buildClouds();
  }

  // 1. TERRAIN & GROUND
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

    // Grid decorative lines
    const gridHelper = new THREE.GridHelper(CONFIG.WORLD.WIDTH - 30, 46, 0x10b981, 0xbbf7d0);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // Mountain silhouettes in distant corners
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.95
    });

    const createMountain = (x, z, radius, height) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 7), mountainMat);
      cone.position.set(x, height / 2, z);
      cone.castShadow = true;
      cone.receiveShadow = true;
      this.scene.add(cone);
      this.collision.addCircle(x, z, radius * 0.85, "mountain");
    };

    const half = CONFIG.WORLD.WIDTH / 2 - 25;
    createMountain(-half + 30, -half + 30, 32, 45);
    createMountain(half - 30, -half + 30, 35, 48);
    createMountain(-half + 30, half - 30, 30, 42);
    createMountain(half - 30, half - 30, 34, 46);
  }

  // 2. WATER CANAL & BRIDGES
  buildWaterCanalAndBridges() {
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85
    });

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.7
    });

    // East-West curved canal running across Z = -15 to -20
    const canalGeo = new THREE.PlaneGeometry(CONFIG.WORLD.WIDTH - 50, 16);
    canalGeo.rotateX(-Math.PI / 2);
    const canal = new THREE.Mesh(canalGeo, waterMat);
    canal.position.set(0, -0.02, -18);
    this.scene.add(canal);

    // 2 Arched Bridges over Canal:
    // Bridge 1 (Center North Road: X = 0, Z = -18)
    // Bridge 2 (Outer East Highway: X = 135, Z = -18)
    // Bridge 3 (Outer West Highway: X = -135, Z = -18)
    const createBridge = (x, z) => {
      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.set(x, 0, z);

      // Deck
      const deck = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 20), stoneMat);
      deck.position.y = 0.2;
      deck.receiveShadow = true;
      deck.castShadow = true;
      bridgeGroup.add(deck);

      // Side Guardrails
      const railGeo = new THREE.BoxGeometry(0.8, 1.2, 20);
      const railLeft = new THREE.Mesh(railGeo, stoneMat);
      railLeft.position.set(-6.8, 0.8, 0);
      railLeft.castShadow = true;
      bridgeGroup.add(railLeft);

      const railRight = railLeft.clone();
      railRight.position.x = 6.8;
      bridgeGroup.add(railRight);

      // Glowing Safety Beacons on bridge corners
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      [-6.8, 6.8].forEach(bx => {
        [-9.5, 9.5].forEach(bz => {
          const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.6, 8), beaconMat);
          beacon.position.set(bx, 1.4, bz);
          bridgeGroup.add(beacon);
        });
      });

      this.scene.add(bridgeGroup);
      this.collision.addBox(x - 6.8, z, 1.0, 20, "bridge_rail_left");
      this.collision.addBox(x + 6.8, z, 1.0, 20, "bridge_rail_right");
    };

    createBridge(0, -18);
    createBridge(135, -18);
    createBridge(-135, -18);
  }

  // 3. ROAD NETWORK (EXPRESSWAY, BOULEVARDS & ROUNDABOUTS)
  buildRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Premium dark asphalt
      roughness: 0.85
    });

    const createRoadSegment = (x, z, width, length, rotY = 0) => {
      const roadGeo = new THREE.PlaneGeometry(width, length);
      roadGeo.rotateX(-Math.PI / 2);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(x, 0.02, z);
      road.rotation.y = rotY;
      road.receiveShadow = true;
      this.scene.add(road);

      // Dash lines
      const lineCount = Math.floor(length / 7);
      const lineGeo = new THREE.PlaneGeometry(0.35, 3.2);
      lineGeo.rotateX(-Math.PI / 2);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xfde047 }); // Yellow stripe

      for (let i = 0; i < lineCount; i++) {
        const line = new THREE.Mesh(lineGeo, lineMat);
        const offsetZ = -length / 2 + (i + 0.5) * 7;
        line.position.set(0, 0.03, offsetZ);
        road.add(line);
      }
    };

    // Central Roundabout at Spawn
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

    // Main Arterials:
    // 1. North to Journey Zone (Z -75 to Z -160)
    createRoadSegment(0, -85, 12, 150, 0);

    // 2. East to Apexsions (X +80) & Kasir (X +80, Z +35)
    createRoadSegment(75, 0, 12, 130, Math.PI / 2);

    // 3. West to PoRoRo (X -80) & Skills Lab (X -80, Z +35)
    createRoadSegment(-75, 0, 12, 130, Math.PI / 2);

    // 4. South to About Studio & Contact Hub (Z +75)
    createRoadSegment(0, 85, 12, 150, 0);

    // Outer Expressway Circuit (Rings at ±135)
    createRoadSegment(135, 0, 11, 280, 0);
    createRoadSegment(-135, 0, 11, 280, 0);
    createRoadSegment(0, -140, 11, 280, Math.PI / 2);
    createRoadSegment(0, 140, 11, 280, Math.PI / 2);

    // Secondary Cross Streets connecting districts
    createRoadSegment(80, -35, 9, 70, 0);
    createRoadSegment(80, 35, 9, 70, 0);
    createRoadSegment(-80, -35, 9, 70, 0);
    createRoadSegment(-80, 35, 9, 70, 0);
    createRoadSegment(40, 75, 9, 65, Math.PI / 2);
    createRoadSegment(-40, 75, 9, 65, Math.PI / 2);
  }

  // 4. OVERHEAD HIGHWAY GANTRIES & DIRECTION SIGNS
  buildHighwayGantries() {
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });

    const createGantry = (x, z, rotY, signText, subText, width = 16) => {
      const gantry = new THREE.Group();
      gantry.position.set(x, 0, z);
      gantry.rotation.y = rotY;

      // Pillars
      const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, 6.2, 8);
      const pLeft = new THREE.Mesh(pillarGeo, metalMat);
      pLeft.position.set(-width / 2, 3.1, 0);
      pLeft.castShadow = true;
      gantry.add(pLeft);

      const pRight = pLeft.clone();
      pRight.position.x = width / 2;
      gantry.add(pRight);

      // Overhead Truss Beam
      const beamGeo = new THREE.BoxGeometry(width + 1.5, 0.6, 0.6);
      const beam = new THREE.Mesh(beamGeo, metalMat);
      beam.position.set(0, 5.8, 0);
      beam.castShadow = true;
      gantry.add(beam);

      // Sign Board
      const signTex = this.createSignTexture(signText, "#047857", "#ffffff", subText);
      const signMat = new THREE.MeshBasicMaterial({ map: signTex });
      const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 2.2), signMat);
      signBoard.position.set(0, 4.6, 0.35);
      gantry.add(signBoard);

      this.scene.add(gantry);
      this.collision.addBox(x - width / 2, z, 1.2, 1.2, "gantry_pillar_l");
      this.collision.addBox(x + width / 2, z, 1.2, 1.2, "gantry_pillar_r");
    };

    // North Gantry near Spawn
    createGantry(0, -32, 0, "↑ TIMELINE AVENUE", "Eksplorasi Perjalanan Karir", 14);

    // East Gantry leading to Apexsions & Kasir
    createGantry(32, 0, Math.PI / 2, "→ APEXSIONS & KASIR", "Kastil RPG & POS Store", 14);

    // West Gantry leading to PoRoRo & Skills
    createGantry(-32, 0, -Math.PI / 2, "← PORORO & SKILLS", "Gelato Cafe & Tech Lab", 14);

    // South Gantry leading to About & Contact
    createGantry(0, 32, Math.PI, "↓ STUDIO & RELAY", "Profil Siswa & Kontak Hub", 14);
  }

  // 5. GRAND CYBER WELCOME ARCH AT SPAWN
  buildWelcomeArch() {
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, -14);

    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const cyanGlowMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.0 });
    const amberGlowMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 1.8 });

    // Twin Hexagonal Towers
    const towerGeo = new THREE.CylinderGeometry(1.2, 1.5, 8.5, 6);
    const towerL = new THREE.Mesh(towerGeo, darkMat);
    towerL.position.set(-7.5, 4.25, 0);
    towerL.castShadow = true;
    archGroup.add(towerL);

    const towerR = towerL.clone();
    towerR.position.x = 7.5;
    archGroup.add(towerR);

    // Glowing Neon Vertical Rings on Towers
    for (let y = 1.5; y <= 7.5; y += 2.0) {
      const ringL = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.08, 8, 16), cyanGlowMat);
      ringL.rotation.x = Math.PI / 2;
      ringL.position.set(-7.5, y, 0);
      archGroup.add(ringL);

      const ringR = ringL.clone();
      ringR.position.x = 7.5;
      archGroup.add(ringR);
    }

    // Overhead Arch Span
    const span = new THREE.Mesh(new THREE.BoxGeometry(16.5, 1.2, 1.8), darkMat);
    span.position.set(0, 8.0, 0);
    span.castShadow = true;
    archGroup.add(span);

    // Welcome Sign Banner
    const welcomeTex = this.createSignTexture("DEV WORLD EXPLORER", "#0284c7", "#ffffff", "Rafriel Raditya Widodo • SMK 71 RPL");
    const welcomeSign = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 2.5), new THREE.MeshBasicMaterial({ map: welcomeTex }));
    welcomeSign.position.set(0, 8.0, 1.0);
    archGroup.add(welcomeSign);

    this.scene.add(archGroup);
    this.collision.addBox(-7.5, -14, 2.8, 2.8, "welcome_arch_l");
    this.collision.addBox(7.5, -14, 2.8, 2.8, "welcome_arch_r");
  }

  // 6. APEXSIONS MEDIEVAL ARCHITECTURE (EAST REALM)
  buildCastleArchitecture() {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.3 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 }); // Crimson roof
    const bannerGold = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });

    // Outer Rampart Walls & Guard Towers flanking Apexsions (Around X: 115, Z: -35)
    const createGuardTower = (x, z) => {
      const tower = new THREE.Group();
      tower.position.set(x, 0, z);

      // Stone Shaft
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.4, 9.5, 8), stoneMat);
      shaft.position.y = 4.75;
      shaft.castShadow = true;
      tower.add(shaft);

      // Conical Roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 3.8, 8), roofMat);
      roof.position.y = 11.4;
      roof.castShadow = true;
      tower.add(roof);

      // Torch
      const torch = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      torch.position.set(0, 9.8, 2.2);
      tower.add(torch);

      this.scene.add(tower);
      this.collision.addCircle(x, z, 2.4, "castle_guard_tower");
    };

    createGuardTower(105, -60);
    createGuardTower(105, -10);
    createGuardTower(135, -60);
    createGuardTower(135, -10);

    // Stone Perimeter Curtain Wall
    const wallGeo = new THREE.BoxGeometry(26, 4.2, 1.4);
    const wallEast = new THREE.Mesh(wallGeo, stoneMat);
    wallEast.position.set(120, 2.1, -60);
    wallEast.castShadow = true;
    this.scene.add(wallEast);
    this.collision.addBox(120, -60, 26, 1.8, "castle_wall_north");

    // Grand Medieval Entrance Arch
    const archGroup = new THREE.Group();
    archGroup.position.set(65, 0, -35);
    archGroup.rotation.y = Math.PI / 2;

    const archPillar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 6.5, 2.2), stoneMat);
    const p1 = archPillar.clone();
    p1.position.set(-4.5, 3.25, 0);
    archGroup.add(p1);

    const p2 = archPillar.clone();
    p2.position.set(4.5, 3.25, 0);
    archGroup.add(p2);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(11.5, 1.8, 2.5), stoneMat);
    lintel.position.set(0, 6.6, 0);
    archGroup.add(lintel);

    // Royal Crest / Sign
    const crestTex = this.createSignTexture("KERAJAAN APEXSIONS", "#b45309", "#ffffff", "PaperMC • Java 21 • 3 Faksi");
    const crestSign = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 1.8), new THREE.MeshBasicMaterial({ map: crestTex }));
    crestSign.position.set(0, 6.6, 1.35);
    archGroup.add(crestSign);

    this.scene.add(archGroup);
    this.collision.addBox(65, -39.5, 2.5, 2.5, "castle_arch_l");
    this.collision.addBox(65, -30.5, 2.5, 2.5, "castle_arch_r");
  }

  // 7. MODERN COMMERCIAL MALL & STORE PLAZA (POS KASIR DISTRICT)
  buildCommercialPlaza() {
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.75
    });

    const concreteMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
    const darkFrame = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });

    const plazaGroup = new THREE.Group();
    plazaGroup.position.set(115, 0, 45);

    // Modern Two-Story Department Store Annex
    const store = new THREE.Mesh(new THREE.BoxGeometry(18, 8.5, 12), concreteMat);
    store.position.set(0, 4.25, 0);
    store.castShadow = true;
    store.receiveShadow = true;
    plazaGroup.add(store);

    // Front Glass Curtain Wall
    const glassFacade = new THREE.Mesh(new THREE.PlaneGeometry(16, 7.5), glassMat);
    glassFacade.position.set(0, 4.25, 6.05);
    plazaGroup.add(glassFacade);

    // Storefront Sign
    const mallSignTex = this.createSignTexture("FRIEL POS DIGITAL MART", "#0284c7", "#ffffff", "Nuxt 4 Frontend • Laravel REST API");
    const mallSign = new THREE.Mesh(new THREE.PlaneGeometry(12, 2.2), new THREE.MeshBasicMaterial({ map: mallSignTex }));
    mallSign.position.set(0, 8.8, 6.1);
    plazaGroup.add(mallSign);

    // Parking lot markings with 2 Toy Parked Courier Vans
    const createToyVan = (vx, vz, colorHex) => {
      const van = new THREE.Group();
      van.position.set(vx, 0, vz);

      const vanBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 4.2), new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.4 }));
      vanBody.position.y = 1.1;
      vanBody.castShadow = true;
      van.add(vanBody);

      const vanCab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 1.8), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 }));
      vanCab.position.set(0, 1.3, 1.2);
      van.add(vanCab);

      plazaGroup.add(van);
      this.collision.addBox(115 + vx, 45 + vz, 2.5, 4.5, "parked_van");
    };

    createToyVan(-14, 12, 0x10b981); // Emerald Green Courier Van
    createToyVan(-14, 5, 0xf59e0b);  // Amber Van

    this.scene.add(plazaGroup);
    this.collision.addBox(115, 45, 19, 13, "commercial_store_annex");
  }

  // 8. ARTISAN GELATO PROMENADE & SAKURA PARK (PORORO DISTRICT)
  buildGelatoPlaza() {
    const plazaGroup = new THREE.Group();
    plazaGroup.position.set(-115, 0, -45);

    // Pastel Pavilion Building
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 }); // Pastel yellow
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 }); // Strawberry pink

    const cafe = new THREE.Mesh(new THREE.BoxGeometry(16, 6.5, 14), wallMat);
    cafe.position.y = 3.25;
    cafe.castShadow = true;
    cafe.receiveShadow = true;
    plazaGroup.add(cafe);

    // Striped Awning
    const awning = new THREE.Mesh(new THREE.BoxGeometry(17, 0.4, 3.5), roofMat);
    awning.position.set(0, 4.5, 7.5);
    awning.rotation.x = 0.2;
    awning.castShadow = true;
    plazaGroup.add(awning);

    // GIANT 3D SCULPTED GELATO ICE CREAM CONE ON PEDESTAL
    const conePedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 1.5, 8), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    conePedestal.position.set(-14, 0.75, 8);
    plazaGroup.add(conePedestal);

    // Waffle Cone
    const waffleCone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.2, 10), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }));
    waffleCone.position.set(-14, 3.4, 8);
    waffleCone.rotation.x = Math.PI; // Point down
    plazaGroup.add(waffleCone);

    // 3 Scoops (Mint, Vanilla, Strawberry)
    const scoopMint = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 10), new THREE.MeshStandardMaterial({ color: 0x6ee7b7 }));
    scoopMint.position.set(-14, 5.0, 8);
    plazaGroup.add(scoopMint);

    const scoopPink = new THREE.Mesh(new THREE.SphereGeometry(1.15, 10, 10), new THREE.MeshStandardMaterial({ color: 0xf472b6 }));
    scoopPink.position.set(-14, 6.6, 7.8);
    plazaGroup.add(scoopPink);

    const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xbe123c }));
    cherry.position.set(-14, 7.8, 7.8);
    plazaGroup.add(cherry);

    // Cafe Banner Sign
    const cafeSignTex = this.createSignTexture("PORORO GELATO ARTISAN", "#db2777", "#ffffff", "18 Varian Rasa • Figma Masterplan MKK 6");
    const cafeSign = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.0), new THREE.MeshBasicMaterial({ map: cafeSignTex }));
    cafeSign.position.set(0, 6.8, 7.1);
    plazaGroup.add(cafeSign);

    this.scene.add(plazaGroup);
    this.collision.addBox(-115, -45, 17, 15, "pororo_cafe_pavilion");
    this.collision.addCircle(-115 - 14, -45 + 8, 2.5, "gelato_statue");
  }

  // 9. CYBER DATA CENTER & CODE ARCADE (SKILLS LAB DISTRICT)
  buildTechArcade() {
    const arcadeGroup = new THREE.Group();
    arcadeGroup.position.set(-115, 0, 45);

    const darkMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.8, roughness: 0.2 });
    const neonCyan = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.2 });
    const neonGold = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 2.0 });

    // Main Server Center Block
    const serverHall = new THREE.Mesh(new THREE.BoxGeometry(16, 7.5, 14), darkMat);
    serverHall.position.y = 3.75;
    serverHall.castShadow = true;
    serverHall.receiveShadow = true;
    arcadeGroup.add(serverHall);

    // Glowing Fiber Optic Grid Lines on Roof
    const roofGrid = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 12), neonCyan);
    roofGrid.position.set(0, 7.6, 0);
    arcadeGroup.add(roofGrid);

    // 4 GIANT OVERSIZED KEYBOARD KEYS EMBEDDED IN GROUND
    const createKeycap = (kx, kz, label, mat) => {
      const key = new THREE.Group();
      key.position.set(kx, 0, kz);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 3.2), darkMat);
      cap.position.y = 0.7;
      cap.castShadow = true;
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

    // District Signboard
    const techSignTex = this.createSignTexture("DEVELOPER TECH ARCADE", "#0284c7", "#ffffff", "Java 21 • Nuxt • Laravel • WebGL Three.js");
    const techSign = new THREE.Mesh(new THREE.PlaneGeometry(11, 2.2), new THREE.MeshBasicMaterial({ map: techSignTex }));
    techSign.position.set(0, 8.2, 7.1);
    arcadeGroup.add(techSign);

    this.scene.add(arcadeGroup);
    this.collision.addBox(-115, 45, 17, 15, "server_hall_main");
  }

  // 10. CHRONOLOGICAL TIMELINE GATEWAY ARCHES (JOURNEY BOULEVARD)
  buildTimelineAvenue() {
    const milestones = [
      { z: -42, era: "2020: Pandemi COVID-19", desc: "Awal Ketertarikan Bermain & Eksplorasi Minecraft" },
      { z: -62, era: "2022: Eksplorasi Addon Bedrock", desc: "Mempelajari Modifikasi Sistem Game Mandiri" },
      { z: -88, era: "2023: Eksperimen Server Java", desc: "Memulai Setup Server & Eksplorasi Plugin Spigot/Paper" },
      { z: -115, era: "2026: Arsitek Plugin Mandiri", desc: "Mengembangkan Ekosistem Apexsions & Software Development" }
    ];

    const archMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 });

    milestones.forEach(m => {
      const arch = new THREE.Group();
      arch.position.set(0, 0, m.z);

      // Left Pillar
      const pL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.2, 1.6), archMat);
      pL.position.set(-6.5, 3.1, 0);
      pL.castShadow = true;
      arch.add(pL);

      // Right Pillar
      const pR = pL.clone();
      pR.position.x = 6.5;
      arch.add(pR);

      // Overhead Lintel
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(15, 1.4, 2.0), archMat);
      lintel.position.set(0, 6.4, 0);
      lintel.castShadow = true;
      arch.add(lintel);

      // Sign Banner
      const tex = this.createSignTexture(m.era, "#b45309", "#ffffff", m.desc);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 2.2), new THREE.MeshBasicMaterial({ map: tex }));
      sign.position.set(0, 6.4, 1.05);
      arch.add(sign);

      this.scene.add(arch);
      this.collision.addBox(-6.5, m.z, 2.0, 2.0, "timeline_arch_l");
      this.collision.addBox(6.5, m.z, 2.0, 2.0, "timeline_arch_r");
    });
  }

  // 11. OBSERVATORY DOME & ROTATING SATELLITE DISH (SOUTH RELAY)
  buildObservatoryAndSatellites() {
    const southGroup = new THREE.Group();
    southGroup.position.set(0, 0, 125);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });

    // 1. Geodesic Glass Observatory Dome
    const baseCyl = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 7.0, 3.5, 16), baseMat);
    baseCyl.position.set(25, 1.75, 0);
    baseCyl.castShadow = true;
    southGroup.add(baseCyl);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(6.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.7 })
    );
    dome.position.set(25, 3.5, 0);
    southGroup.add(dome);

    // 2. Giant Radio Satellite Dish
    const dishGantry = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 6.5, 8), baseMat);
    dishGantry.position.set(-25, 3.25, 0);
    dishGantry.castShadow = true;
    southGroup.add(dishGantry);

    // Parabolic Dish Head
    const dishHead = new THREE.Mesh(new THREE.ConeGeometry(5.5, 2.2, 16, 1, true), metalMat);
    dishHead.position.set(-25, 7.2, 0);
    dishHead.rotation.x = Math.PI / 3;
    dishHead.rotation.z = Math.PI / 6;
    dishHead.castShadow = true;
    southGroup.add(dishHead);

    // Receiver needle
    const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 3.5, 6), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
    needle.position.set(-25, 8.2, 0.8);
    needle.rotation.x = Math.PI / 3;
    southGroup.add(needle);

    this.scene.add(southGroup);
    this.collision.addCircle(25, 125, 7.0, "observatory_dome");
    this.collision.addCircle(-25, 125, 3.5, "satellite_dish_base");
  }

  // 12. ROTATING MODERN WIND TURBINES ON OUTER HILLS
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

      // Tower
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.8, 28, 10), towerMat);
      tower.position.y = 14;
      tower.castShadow = true;
      turbineGroup.add(tower);

      // Nacelle
      const nacelle = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 4.5), towerMat);
      nacelle.position.set(0, 28, 0);
      nacelle.castShadow = true;
      turbineGroup.add(nacelle);

      // Rotor Blades Hub
      const hub = new THREE.Group();
      hub.position.set(0, 28, 2.4);

      const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.6, 10), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
      noseCone.rotation.x = Math.PI / 2;
      hub.add(noseCone);

      // 3 Blades
      for (let b = 0; b < 3; b++) {
        const bladeArm = new THREE.Group();
        bladeArm.rotation.z = (b * Math.PI * 2) / 3;

        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.45, 11, 0.15), bladeMat);
        blade.position.y = 5.5;
        blade.castShadow = true;
        bladeArm.add(blade);

        hub.add(bladeArm);
      }

      turbineGroup.add(hub);
      this.scene.add(turbineGroup);
      this.collision.addCircle(x, z, 2.2, "wind_turbine_base");

      this.windTurbines.push({
        hub,
        speed: 1.0 + Math.random() * 0.6
      });
    });
  }

  // 13. EXTENSIVE DIVERSE VEGETATION (70+ TREES, SAKURA, PINES & OAKS)
  buildVegetation() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const pineMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const pineMat2 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 });
    const oakMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });
    const sakuraMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 }); // Pink blossom

    // Helper: Pine Tree
    const createPine = (x, z, scale = 1.0) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * scale, 0.45 * scale, 2.4 * scale, 6), trunkMat);
      trunk.position.y = 1.2 * scale;
      trunk.castShadow = true;
      tree.add(trunk);

      const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2.2 * scale, 2.4 * scale, 7), pineMat1);
      cone1.position.y = 2.6 * scale;
      cone1.castShadow = true;
      tree.add(cone1);

      const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.7 * scale, 2.0 * scale, 7), pineMat2);
      cone2.position.y = 3.9 * scale;
      cone2.castShadow = true;
      tree.add(cone2);

      const cone3 = new THREE.Mesh(new THREE.ConeGeometry(1.1 * scale, 1.6 * scale, 7), pineMat1);
      cone3.position.y = 5.0 * scale;
      cone3.castShadow = true;
      tree.add(cone3);

      this.scene.add(tree);
      this.collision.addCircle(x, z, 1.2 * scale, "pine");
    };

    // Helper: Fluffy Oak Tree
    const createOak = (x, z, scale = 1.0) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 2.2 * scale, 6), trunkMat);
      trunk.position.y = 1.1 * scale;
      trunk.castShadow = true;
      tree.add(trunk);

      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2 * scale, 1), oakMat);
      crown.position.y = 3.6 * scale;
      crown.castShadow = true;
      tree.add(crown);

      this.scene.add(tree);
      this.collision.addCircle(x, z, 1.4 * scale, "oak");
    };

    // Helper: Sakura Cherry Blossom Tree
    const createSakura = (x, z, scale = 1.0) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * scale, 0.45 * scale, 2.0 * scale, 6), trunkMat);
      trunk.position.y = 1.0 * scale;
      trunk.castShadow = true;
      tree.add(trunk);

      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(2.1 * scale, 1), sakuraMat);
      crown.position.y = 3.4 * scale;
      crown.castShadow = true;
      tree.add(crown);

      this.scene.add(tree);
      this.collision.addCircle(x, z, 1.3 * scale, "sakura");
    };

    // 1. Pines along North Highway & Castle perimeter
    const pineCoords = [
      [-16, -24], [16, -24], [-16, 24], [16, 24],
      [-26, -55], [26, -55], [-26, 55], [26, 55],
      [55, -75], [75, -75], [95, -75], [115, -75],
      [145, -45], [155, -25], [145, 10], [155, 30],
      [90, 85], [110, 85], [130, 85], [150, 85],
      [-90, 85], [-110, 85], [-130, 85], [-150, 85],
      [0, -170], [-40, -165], [40, -165], [-80, -160], [80, -160],
      [0, 170], [-40, 165], [40, 165], [-80, 160], [80, 160]
    ];
    pineCoords.forEach(([x, z]) => createPine(x, z, 0.85 + Math.random() * 0.4));

    // 2. Oaks in central and southern parks
    const oakCoords = [
      [-45, -20], [-45, 20], [45, -20], [45, 20],
      [-65, -15], [65, -15], [-65, 15], [65, 15],
      [-25, 95], [25, 95], [-45, 105], [45, 105],
      [105, 115], [125, 125], [-105, 115], [-125, 125],
      [160, 0], [170, 15], [170, -15], [-160, 0]
    ];
    oakCoords.forEach(([x, z]) => createOak(x, z, 0.9 + Math.random() * 0.35));

    // 3. Sakura Cherry Blossom Grove around PoRoRo Gelato District
    const sakuraCoords = [
      [-95, -65], [-115, -65], [-135, -65],
      [-95, -25], [-135, -25], [-145, -40], [-145, -55],
      [-100, -80], [-120, -80], [-140, -80]
    ];
    sakuraCoords.forEach(([x, z]) => createSakura(x, z, 0.95 + Math.random() * 0.3));
  }

  // 14. STREET FURNITURE (STREETLIGHTS, BENCHES & BOLLARDS)
  buildStreetFurniture() {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });

    const createLamp = (x, z) => {
      const lamp = new THREE.Group();
      lamp.position.set(x, 0, z);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 4.6, 8), poleMat);
      pole.position.y = 2.3;
      pole.castShadow = true;
      lamp.add(pole);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), lampGlowMat);
      head.position.y = 4.7;
      lamp.add(head);

      const pLight = new THREE.PointLight(0xfef08a, 0.75, 22, 1.6);
      pLight.position.y = 4.7;
      lamp.add(pLight);

      this.scene.add(lamp);
      this.collision.addCircle(x, z, 0.85, "streetlight");
    };

    const lampPositions = [
      [-10, -18], [10, -18], [-10, 18], [10, 18],
      [-18, -10], [-18, 10], [18, -10], [18, 10],
      [-8, -50], [8, -50], [-8, -100], [8, -100],
      [-8, 50], [8, 50], [-8, 100], [8, 100],
      [50, -8], [50, 8], [100, -8], [100, 8],
      [-50, -8], [-50, 8], [-100, -8], [-100, 8]
    ];
    lampPositions.forEach(([x, z]) => createLamp(x, z));

    // Park Benches at Plaza Corners
    const createBench = (x, z, rotY) => {
      const bench = new THREE.Group();
      bench.position.set(x, 0, z);
      bench.rotation.y = rotY;

      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.8), woodMat);
      seat.position.y = 0.55;
      bench.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.12), woodMat);
      back.position.set(0, 0.9, -0.35);
      bench.add(back);

      this.scene.add(bench);
      this.collision.addBox(x, z, 2.6, 1.0, "park_bench");
    };

    createBench(-14, -14, Math.PI / 4);
    createBench(14, -14, -Math.PI / 4);
    createBench(-14, 14, 3 * Math.PI / 4);
    createBench(14, 14, -3 * Math.PI / 4);
  }

  // 15. PERIMETER FENCE SIZED FOR 460 x 460
  buildPerimeterFence() {
    const half = (CONFIG.WORLD.WIDTH / 2) - CONFIG.WORLD.BOUND_PADDING;
    const fenceMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Electric blue cyber barrier
      metalness: 0.7,
      roughness: 0.2
    });

    const barrierGeo = new THREE.BoxGeometry(CONFIG.WORLD.WIDTH - 20, 2.0, 1.0);

    // North
    const fNorth = new THREE.Mesh(barrierGeo, fenceMat);
    fNorth.position.set(0, 1.0, -half);
    fNorth.castShadow = true;
    this.scene.add(fNorth);
    this.collision.addBox(0, -half, CONFIG.WORLD.WIDTH - 20, 1.8, "fence_north");

    // South
    const fSouth = new THREE.Mesh(barrierGeo, fenceMat);
    fSouth.position.set(0, 1.0, half);
    fSouth.castShadow = true;
    this.scene.add(fSouth);
    this.collision.addBox(0, half, CONFIG.WORLD.WIDTH - 20, 1.8, "fence_south");

    // East
    const sideGeo = new THREE.BoxGeometry(1.0, 2.0, CONFIG.WORLD.DEPTH - 20);
    const fEast = new THREE.Mesh(sideGeo, fenceMat);
    fEast.position.set(half, 1.0, 0);
    fEast.castShadow = true;
    this.scene.add(fEast);
    this.collision.addBox(half, 0, 1.8, CONFIG.WORLD.DEPTH - 20, "fence_east");

    // West
    const fWest = new THREE.Mesh(sideGeo, fenceMat);
    fWest.position.set(-half, 1.0, 0);
    fWest.castShadow = true;
    this.scene.add(fWest);
    this.collision.addBox(-half, 0, 1.8, CONFIG.WORLD.DEPTH - 20, "fence_west");
  }

  // 16. PROCEDURAL CLOUDS
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
    // 1. Drifting clouds animation
    const halfWidth = CONFIG.WORLD.WIDTH / 2;
    for (const c of this.clouds) {
      c.group.position.x += c.speed * deltaTime;
      if (c.group.position.x > halfWidth + 50) {
        c.group.position.x = -halfWidth - 50;
      }
    }

    // 2. Wind Turbines rotation
    for (const t of this.windTurbines) {
      t.hub.rotation.z += t.speed * deltaTime;
    }
  }
}
