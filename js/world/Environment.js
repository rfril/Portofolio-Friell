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

    // Helper Window Texture for Skyscrapers with Randomized Office Lights
    this.createWindowTexture = (baseColorHex = "#0f172a", litColorHex = "#38bdf8", rows = 8, cols = 4, secondaryLit = "#fef08a") => {
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
          const rand = Math.random();
          let color = "#1e293b"; // unlit dark window
          if (rand < 0.55) {
            color = litColorHex; // primary lit window
          } else if (rand < 0.72) {
            color = secondaryLit; // warm yellow/white suite light
          }
          ctx.fillStyle = color;
          ctx.fillRect(c * cellW + 5, r * cellH + 6, cellW - 10, cellH - 12);
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    };

    // Helper Texture Generator for Rooftop Helipads
    this.createHelipadTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");

      // Dark asphalt helipad base
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Yellow outer hazard circle
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(128, 128, 102, 0, Math.PI * 2);
      ctx.stroke();

      // Inner white guidance ring
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(128, 128, 90, 0, Math.PI * 2);
      ctx.stroke();

      // Bold white "H"
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 96px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("H", 128, 128);

      // Red corner beacon markers
      ctx.fillStyle = "#ef4444";
      [[32, 32], [224, 32], [32, 224], [224, 224]].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();
      });

      return new THREE.CanvasTexture(canvas);
    };

    // Helper Texture Generator for Electronic LED City Billboards
    this.createBillboardTexture = (title, sub, tag, color1 = "#38bdf8", color2 = "#f59e0b", icon = "⚡") => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");

      // Deep cyber gradient background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#090d16");
      grad.addColorStop(1, "#0f172a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Glowing cyber neon border
      ctx.strokeStyle = color1;
      ctx.lineWidth = 8;
      ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

      // Category tag pill
      ctx.fillStyle = color1;
      ctx.fillRect(32, 28, 150, 32);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tag.toUpperCase(), 107, 44);

      // Icon badge
      ctx.font = "bold 34px sans-serif";
      ctx.fillStyle = color2;
      ctx.textAlign = "right";
      ctx.fillText(icon, canvas.width - 32, 52);

      // Main Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 36px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(title, 32, 115);

      // Subtitle
      ctx.fillStyle = color1;
      ctx.font = "600 20px sans-serif";
      ctx.fillText(sub, 32, 160);

      // Bottom separator & footer
      ctx.fillStyle = color2;
      ctx.fillRect(32, 195, canvas.width - 64, 4);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 14px sans-serif";
      ctx.fillText("FEATURED ON RAFRIEL METROPOLIS PORTFOLIO", 32, 222);

      return new THREE.CanvasTexture(canvas);
    };

    // Helper Texture Generator for Times Square Vertical LED Ticker Ribbons
    this.createVerticalTickerTexture = (textLines, primaryColor = "#38bdf8", accentColor = "#f59e0b") => {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      // Header Tag
      ctx.fillStyle = primaryColor;
      ctx.fillRect(10, 12, canvas.width - 20, 26);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("LIVE METRO STATS", canvas.width / 2, 25);

      // Vertical text lines
      ctx.textAlign = "center";
      textLines.forEach((line, idx) => {
        const y = 60 + idx * 44;
        ctx.fillStyle = idx % 2 === 0 ? "#ffffff" : accentColor;
        ctx.font = "bold 15px sans-serif";
        ctx.fillText(line, canvas.width / 2, y);

        // Divider dot
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, y + 22, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      return new THREE.CanvasTexture(canvas);
    };

    this.initMetropolis();
  }

  initMetropolis() {
    this.buildTerrain();
    this.buildWaterCanalAndBridges();
    this.buildRoadNetwork();
    this.buildCentralCityPark();
    this.buildCitySkyscrapersAndBlocks();
    this.buildUrbanInfrastructureAndStreetFurniture();
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

  // 2. WATER CANAL & 5 DEDICATED ROAD BRIDGES (ZERO OVERLAPPING DECKS)
  buildWaterCanalAndBridges() {
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85
    });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
    const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });

    // Water channel at Z = -28 across the entire city (width: 10m, Z: -33 to -23)
    // Berada tepat di antara Bundaran Tengah (Z: -16) dan Persimpangan Sekunder (Z: -75)
    const canalGeo = new THREE.PlaneGeometry(CONFIG.WORLD.WIDTH - 40, 10);
    canalGeo.rotateX(-Math.PI / 2);
    const canal = new THREE.Mesh(canalGeo, waterMat);
    canal.position.set(0, -0.015, -28);
    this.scene.add(canal);

    // Stone embankment canal riverbanks (North bank Z: -33, South bank Z: -23)
    [-33, -23].forEach(bz => {
      const bankGeo = new THREE.BoxGeometry(CONFIG.WORLD.WIDTH - 40, 0.15, 0.6);
      const bank = new THREE.Mesh(bankGeo, stoneMat);
      bank.position.set(0, 0.05, bz);
      bank.receiveShadow = true;
      this.scene.add(bank);
    });

    // Dedicated Bridge Builder: Menghubungkan jalan melintasi kanal Z: -33 s/d -23 tanpa tumpang tindih
    const createBridge = (x, width, name) => {
      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.set(x, 0, -28);

      // 1. Solid Stone Substructure Foundation underneath canal
      const deckBase = new THREE.Mesh(new THREE.BoxGeometry(width + 0.8, 0.45, 10.2), stoneMat);
      deckBase.position.y = -0.22;
      deckBase.receiveShadow = true;
      deckBase.castShadow = true;
      bridgeGroup.add(deckBase);

      // 2. Flush Asphalt Driving Surface (Tepat di y = 0.02, menyatu sempurna dengan aspal jalan)
      const roadDeck = new THREE.Mesh(new THREE.PlaneGeometry(width, 10), asphaltMat);
      roadDeck.rotateX(-Math.PI / 2);
      roadDeck.position.y = 0.02;
      roadDeck.receiveShadow = true;
      bridgeGroup.add(roadDeck);

      // 3. Sturdy Stone/Steel Parapet Bridge Guardrails (Left & Right)
      const railW = 0.6;
      const railH = 1.1;
      const railGeo = new THREE.BoxGeometry(railW, railH, 10.2);

      const railL = new THREE.Mesh(railGeo, stoneMat);
      railL.position.set(-width / 2 - railW / 2, railH / 2, 0);
      railL.castShadow = true;
      bridgeGroup.add(railL);

      const railR = railL.clone();
      railR.position.x = width / 2 + railW / 2;
      bridgeGroup.add(railR);

      this.scene.add(bridgeGroup);
      this.collision.addBox(x - width / 2 - railW / 2, -28, railW + 0.2, 10.2, `${name}_rail_l`);
      this.collision.addBox(x + width / 2 + railW / 2, -28, railW + 0.2, 10.2, `${name}_rail_r`);
    };

    createBridge(0, 16, "bridge_main_ave");        // Main Avenue Bridge (Width 16m)
    createBridge(75, 12, "bridge_east_secondary"); // East Secondary Street Bridge (Width 12m)
    createBridge(-75, 12, "bridge_west_secondary");// West Secondary Street Bridge (Width 12m)
    createBridge(145, 14, "bridge_east_express");  // East Mid-Ring Expressway Bridge (Width 14m)
    createBridge(-145, 14, "bridge_west_express"); // West Mid-Ring Expressway Bridge (Width 14m)
    createBridge(205, 14, "bridge_outer_east");    // East Outer Parkway Bridge (Width 14m)
    createBridge(-205, 14, "bridge_outer_west");   // West Outer Parkway Bridge (Width 14m)
  }

  // 3. MODULAR ROAD NETWORK & SEAMLESS INTERSECTIONS (ZERO CLIPPING / TIMPA)
  buildRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });

    // =========================================================================
    // HELPER 1: SEAMLESS INTERSECTION JUNCTION (BEBAS TROTOAR DI TENGAH PERSIMPANGAN)
    // =========================================================================
    const createJunction = (x, z, widthX, widthZ) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      // Clean flat intersection asphalt box (y = 0.02)
      const junctionGeo = new THREE.PlaneGeometry(widthX, widthZ);
      junctionGeo.rotateX(-Math.PI / 2);
      const junction = new THREE.Mesh(junctionGeo, roadMat);
      junction.position.y = 0.02;
      junction.receiveShadow = true;
      g.add(junction);

      // 4 Corner Curb Caps (Menyambungkan trotoar dari tiap sudut luar tanpa memotong jalan)
      const curbW = 3.5;
      const curbH = 0.15;
      const curbGeo = new THREE.BoxGeometry(curbW, curbH, curbW);

      // NW, NE, SW, SE corner sidewalk caps
      const offsets = [
        [-widthX / 2 - curbW / 2, -widthZ / 2 - curbW / 2],
        [widthX / 2 + curbW / 2, -widthZ / 2 - curbW / 2],
        [-widthX / 2 - curbW / 2, widthZ / 2 + curbW / 2],
        [widthX / 2 + curbW / 2, widthZ / 2 + curbW / 2]
      ];
      offsets.forEach(([cx, cz]) => {
        const curb = new THREE.Mesh(curbGeo, curbMat);
        curb.position.set(cx, curbH / 2, cz);
        curb.receiveShadow = true;
        g.add(curb);
      });

      // Stop Lines & Zebra Crossings at all 4 approaches
      const createZebraStrip = (px, pz, length, isHoriz) => {
        const bars = Math.floor(length / 1.4);
        const sGeo = new THREE.PlaneGeometry(0.7, 2.6);
        sGeo.rotateX(-Math.PI / 2);
        if (isHoriz) sGeo.rotateY(Math.PI / 2);

        for (let i = 0; i < bars; i++) {
          const stripe = new THREE.Mesh(sGeo, whiteMat);
          if (!isHoriz) {
            stripe.position.set(px - length / 2 + (i + 0.5) * 1.4, 0.026, pz);
          } else {
            stripe.position.set(px, 0.026, pz - length / 2 + (i + 0.5) * 1.4);
          }
          g.add(stripe);
        }
      };

      // North & South Crosswalks
      createZebraStrip(0, -widthZ / 2 - 1.8, widthX, false);
      createZebraStrip(0, widthZ / 2 + 1.8, widthX, false);
      // West & East Crosswalks
      createZebraStrip(-widthX / 2 - 1.8, 0, widthZ, true);
      createZebraStrip(widthX / 2 + 1.8, 0, widthZ, true);

      this.scene.add(g);
    };

    // =========================================================================
    // HELPER 2: INDEPENDENT ROAD SEGMENT (TROTOAR BERHENTI TEPAT DI UJUNG PERSIMPANGAN)
    // =========================================================================
    const createRoadSegment = (x1, z1, x2, z2, width) => {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.hypot(dx, dz);
      if (length < 0.5) return;

      const angle = Math.atan2(dx, dz);
      const midX = (x1 + x2) / 2;
      const midZ = (z1 + z2) / 2;

      const segGroup = new THREE.Group();
      segGroup.position.set(midX, 0, midZ);
      segGroup.rotation.y = angle;

      // Asphalt Road Surface
      const roadGeo = new THREE.PlaneGeometry(width, length);
      roadGeo.rotateX(-Math.PI / 2);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.y = 0.02;
      road.receiveShadow = true;
      segGroup.add(road);

      // Center Dashed Yellow Divider Lines (Hanya di tengah segmen jalan, berhenti sebelum persimpangan)
      const lineSpacing = 7.5;
      const margin = 4.0;
      const usableLength = length - margin * 2;
      if (usableLength > 6) {
        const lineCount = Math.floor(usableLength / lineSpacing);
        const lineGeo = new THREE.PlaneGeometry(0.35, 3.2);
        lineGeo.rotateX(-Math.PI / 2);

        for (let i = 0; i < lineCount; i++) {
          const line = new THREE.Mesh(lineGeo, yellowMat);
          line.position.set(0, 0.025, -usableLength / 2 + (i + 0.5) * lineSpacing);
          segGroup.add(line);
        }
      }

      // Continuous White Edge Lines
      const edgeGeo = new THREE.PlaneGeometry(0.22, length);
      edgeGeo.rotateX(-Math.PI / 2);

      const edgeL = new THREE.Mesh(edgeGeo, whiteMat);
      edgeL.position.set(-width / 2 + 0.35, 0.024, 0);
      segGroup.add(edgeL);

      const edgeR = edgeL.clone();
      edgeR.position.x = width / 2 - 0.35;
      segGroup.add(edgeR);

      // Granite Sidewalks (Tinggi 0.15m, Lebar 3.5m)
      const walkW = 3.5;
      const walkH = 0.15;
      const walkGeo = new THREE.BoxGeometry(walkW, walkH, length);

      const walkL = new THREE.Mesh(walkGeo, curbMat);
      walkL.position.set(-width / 2 - walkW / 2, walkH / 2, 0);
      walkL.receiveShadow = true;
      segGroup.add(walkL);

      const walkR = walkL.clone();
      walkR.position.x = width / 2 + walkW / 2;
      segGroup.add(walkR);

      this.scene.add(segGroup);
    };

    // =========================================================================
    // 1. CENTRAL ROUNDABOUT AT (0, 0) (RADIUS 16M, BERHENTI TEPAT DI SEBELUM KANAL Z: -23)
    // =========================================================================
    const roundAboutGeo = new THREE.RingGeometry(0, 16, 36);
    roundAboutGeo.rotateX(-Math.PI / 2);
    const roundAbout = new THREE.Mesh(roundAboutGeo, roadMat);
    roundAbout.position.set(0, 0.02, 0);
    roundAbout.receiveShadow = true;
    this.scene.add(roundAbout);

    // Decorative inner spawn plaza ring
    const plazaRingGeo = new THREE.RingGeometry(4.5, 5.8, 32);
    plazaRingGeo.rotateX(-Math.PI / 2);
    const plazaRing = new THREE.Mesh(plazaRingGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 }));
    plazaRing.position.set(0, 0.025, 0);
    this.scene.add(plazaRing);

    // Crosswalks around Roundabout Entrances
    const createZebra = (x, z, width, rotY) => {
      const g = new THREE.Group();
      g.position.set(x, 0.026, z);
      g.rotation.y = rotY;
      const bars = Math.floor(width / 1.4);
      const sGeo = new THREE.PlaneGeometry(0.7, 2.6);
      sGeo.rotateX(-Math.PI / 2);
      for (let i = 0; i < bars; i++) {
        const stripe = new THREE.Mesh(sGeo, whiteMat);
        stripe.position.set(-width / 2 + (i + 0.5) * 1.4, 0, 0);
        g.add(stripe);
      }
      this.scene.add(g);
    };

    createZebra(0, -17.5, 16, 0);
    createZebra(0, 17.5, 16, 0);
    createZebra(-17.5, 0, 16, Math.PI / 2);
    createZebra(17.5, 0, 16, Math.PI / 2);

    // =========================================================================
    // 2. BUILD ALL INDEPENDENT GRID INTERSECTIONS (ZERO OVERLAP!)
    // =========================================================================
    // Inner & Mid Intersections
    createJunction(0, -75, 16, 12);   // Main Ave x North Secondary Street
    createJunction(0, 75, 16, 12);    // Main Ave x South Secondary Street
    createJunction(75, 0, 12, 16);    // East Secondary Street x East Boulevard
    createJunction(-75, 0, 12, 16);   // West Secondary Street x West Boulevard
    createJunction(75, -75, 12, 12);  // East Secondary x North Secondary
    createJunction(-75, -75, 12, 12); // West Secondary x North Secondary
    createJunction(75, 75, 12, 12);   // East Secondary x South Secondary
    createJunction(-75, 75, 12, 12);  // West Secondary x South Secondary

    // Outer Expressway Intersections
    createJunction(0, -145, 16, 14);  // Main Ave x North Outer Expressway
    createJunction(0, 145, 16, 14);   // Main Ave x South Outer Expressway
    createJunction(145, 0, 14, 16);   // East Outer Expressway x Boulevard
    createJunction(-145, 0, 14, 16);  // West Outer Expressway x Boulevard

    createJunction(75, -145, 12, 14);
    createJunction(-75, -145, 12, 14);
    createJunction(75, 145, 12, 14);
    createJunction(-75, 145, 12, 14);
    createJunction(145, -75, 14, 12);
    createJunction(-145, -75, 14, 12);
    createJunction(145, 75, 14, 12);
    createJunction(-145, 75, 14, 12);

    // 4 Mid-Ring Expressway Corners (X: +-145, Z: +-145)
    createJunction(145, -145, 14, 14);
    createJunction(-145, -145, 14, 14);
    createJunction(145, 145, 14, 14);
    createJunction(-145, 145, 14, 14);

    // EXPANDED OUTER PARKWAY JUNCTIONS (X: +-205, Z: +-205, Width: 14m)
    createJunction(0, -205, 16, 14);   // Main Ave North x Outer Parkway
    createJunction(0, 205, 16, 14);    // Main Ave South x Outer Parkway
    createJunction(205, 0, 14, 16);    // East Boulevard x Outer Parkway
    createJunction(-205, 0, 14, 16);   // West Boulevard x Outer Parkway

    // 4 Outer Parkway High-Speed Corners (X: +-205, Z: +-205)
    createJunction(205, -205, 14, 14);
    createJunction(-205, -205, 14, 14);
    createJunction(205, 205, 14, 14);
    createJunction(-205, 205, 14, 14);

    createJunction(75, -205, 12, 14);
    createJunction(-75, -205, 12, 14);
    createJunction(75, 205, 12, 14);
    createJunction(-75, 205, 12, 14);
    createJunction(205, -75, 14, 12);
    createJunction(-205, -75, 14, 12);
    createJunction(205, 75, 14, 12);
    createJunction(-205, 75, 14, 12);

    // =========================================================================
    // 3. BUILD ALL CLEAN ROAD SEGMENTS BETWEEN JUNCTIONS & BRIDGES
    // =========================================================================
    // MAIN NORTH-SOUTH AVENUE (X = 0, Width = 16m)
    createRoadSegment(0, -16, 0, -23, 16);    // Roundabout to Bridge South Abutment
    // Bridge at Z: -33 to -23
    createRoadSegment(0, -33, 0, -69, 16);    // Bridge North Abutment to Junction (0, -75)
    createRoadSegment(0, -81, 0, -138, 16);   // Junction (0, -75) to Junction (0, -145)
    createRoadSegment(0, -152, 0, -198, 16);  // Junction (0, -145) to Outer Parkway (0, -205)
    createRoadSegment(0, -212, 0, -242, 16);  // Outer North Stub to Boundary Fence

    createRoadSegment(0, 16, 0, 69, 16);      // Roundabout to Junction (0, 75)
    createRoadSegment(0, 81, 0, 138, 16);     // Junction (0, 75) to Junction (0, 145)
    createRoadSegment(0, 152, 0, 198, 16);    // Junction (0, 145) to Outer Parkway (0, 205)
    createRoadSegment(0, 212, 0, 242, 16);    // Outer South Stub to Boundary Fence

    // MAIN EAST-WEST BOULEVARD (Z = 0, Width = 16m)
    createRoadSegment(16, 0, 69, 0, 16);      // Roundabout to Junction (75, 0)
    createRoadSegment(81, 0, 138, 0, 16);     // Junction (75, 0) to Junction (145, 0)
    createRoadSegment(152, 0, 198, 0, 16);    // Junction (145, 0) to Outer Parkway (205, 0)
    createRoadSegment(212, 0, 242, 0, 16);    // Outer East Stub to Boundary Fence

    createRoadSegment(-16, 0, -69, 0, 16);    // Roundabout to Junction (-75, 0)
    createRoadSegment(-81, 0, -138, 0, 16);   // Junction (-75, 0) to Junction (-145, 0)
    createRoadSegment(-152, 0, -198, 0, 16);  // Junction (-145, 0) to Outer Parkway (-205, 0)
    createRoadSegment(-212, 0, -242, 0, 16);  // Outer West Stub to Boundary Fence

    // EAST SECONDARY STREET (X = 75, Width = 12m)
    createRoadSegment(75, -8, 75, -23, 12);   // Junction (75, 0) to Bridge South Abutment
    // Bridge at Z: -33 to -23
    createRoadSegment(75, -33, 75, -69, 12);  // Bridge North Abutment to Junction (75, -75)
    createRoadSegment(75, -81, 75, -138, 12); // Junction (75, -75) to Junction (75, -145)
    createRoadSegment(75, -152, 75, -198, 12);// Mid-Ring to Outer Parkway
    createRoadSegment(75, -212, 75, -242, 12);

    createRoadSegment(75, 8, 75, 69, 12);     // Junction (75, 0) to Junction (75, 75)
    createRoadSegment(75, 81, 75, 138, 12);   // Junction (75, 75) to Junction (75, 145)
    createRoadSegment(75, 152, 75, 198, 12);  // Mid-Ring to Outer Parkway
    createRoadSegment(75, 212, 75, 242, 12);

    // WEST SECONDARY STREET (X = -75, Width = 12m)
    createRoadSegment(-75, -8, -75, -23, 12); // Junction (-75, 0) to Bridge South Abutment
    // Bridge at Z: -33 to -23
    createRoadSegment(-75, -33, -75, -69, 12);// Bridge North Abutment to Junction (-75, -75)
    createRoadSegment(-75, -81, -75, -138, 12);
    createRoadSegment(-75, -152, -75, -198, 12);
    createRoadSegment(-75, -212, -75, -242, 12);

    createRoadSegment(-75, 8, -75, 69, 12);   // Junction (-75, 0) to Junction (-75, 75)
    createRoadSegment(-75, 81, -75, 138, 12); // Junction (-75, 75) to Junction (-75, 145)
    createRoadSegment(-75, 152, -75, 198, 12);
    createRoadSegment(-75, 212, -75, 242, 12);

    // NORTH SECONDARY CROSS STREET (Z = -75, Width = 12m)
    createRoadSegment(-242, -75, -212, -75, 12);
    createRoadSegment(-198, -75, -152, -75, 12);
    createRoadSegment(-138, -75, -81, -75, 12);
    createRoadSegment(-69, -75, -8, -75, 12);
    createRoadSegment(8, -75, 69, -75, 12);
    createRoadSegment(81, -75, 138, -75, 12);
    createRoadSegment(152, -75, 198, -75, 12);
    createRoadSegment(212, -75, 242, -75, 12);

    // SOUTH SECONDARY CROSS STREET (Z = 75, Width = 12m)
    createRoadSegment(-242, 75, -212, 75, 12);
    createRoadSegment(-198, 75, -152, 75, 12);
    createRoadSegment(-138, 75, -81, 75, 12);
    createRoadSegment(-69, 75, -8, 75, 12);
    createRoadSegment(8, 75, 69, 75, 12);
    createRoadSegment(81, 75, 138, 75, 12);
    createRoadSegment(152, 75, 198, 75, 12);
    createRoadSegment(212, 75, 242, 75, 12);

    // MID-RING EXPRESSWAYS (X: +-145, Z: +-145, Width = 14m)
    createRoadSegment(-138, -145, -81, -145, 14);
    createRoadSegment(-69, -145, -8, -145, 14);
    createRoadSegment(8, -145, 69, -145, 14);
    createRoadSegment(81, -145, 138, -145, 14);

    createRoadSegment(-138, 145, -81, 145, 14);
    createRoadSegment(-69, 145, -8, 145, 14);
    createRoadSegment(8, 145, 69, 145, 14);
    createRoadSegment(81, 145, 138, 145, 14);

    createRoadSegment(145, -138, 145, -81, 14);
    createRoadSegment(145, -69, 145, -33, 14);
    createRoadSegment(145, -23, 145, -8, 14);
    createRoadSegment(145, 8, 145, 69, 14);
    createRoadSegment(145, 81, 145, 138, 14);

    createRoadSegment(-145, -138, -145, -81, 14);
    createRoadSegment(-145, -69, -145, -33, 14);
    createRoadSegment(-145, -23, -145, -8, 14);
    createRoadSegment(-145, 8, -145, 69, 14);
    createRoadSegment(-145, 81, -145, 138, 14);

    // EXPANDED OUTER PARKWAY HIGH-SPEED CIRCUIT (X: +-205, Z: +-205, Width = 14m)
    // North Outer Parkway (Z = -205)
    createRoadSegment(-198, -205, -81, -205, 14);
    createRoadSegment(-69, -205, -8, -205, 14);
    createRoadSegment(8, -205, 69, -205, 14);
    createRoadSegment(81, -205, 198, -205, 14);

    // South Outer Parkway (Z = 205)
    createRoadSegment(-198, 205, -81, 205, 14);
    createRoadSegment(-69, 205, -8, 205, 14);
    createRoadSegment(8, 205, 69, 205, 14);
    createRoadSegment(81, 205, 198, 205, 14);

    // East Outer Parkway (X = 205)
    createRoadSegment(205, -198, 205, -81, 14);
    createRoadSegment(205, -69, 205, -33, 14);
    // Bridge at Z: -33 to -23
    createRoadSegment(205, -23, 205, -8, 14);
    createRoadSegment(205, 8, 205, 69, 14);
    createRoadSegment(205, 81, 205, 198, 14);

    // West Outer Parkway (X = -205)
    createRoadSegment(-205, -198, -205, -81, 14);
    createRoadSegment(-205, -69, -205, -33, 14);
    // Bridge at Z: -33 to -23
    createRoadSegment(-205, -23, -205, -8, 14);
    createRoadSegment(-205, 8, -205, 69, 14);
    createRoadSegment(-205, 81, -205, 198, 14);

    // =========================================================================
    // 4. DRIVEWAY SPURS TO PORTFOLIO PLAZAS (10M ASPHALT CONNECTORS)
    // =========================================================================
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
      spur.position.set(midX, 0.022, midZ);
      spur.receiveShadow = true;
      this.scene.add(spur);
    };

    createSpur(81, -105, 95, -105);   // Spur into Apexsions Fortress
    createSpur(81, -35, 95, -35);     // Spur into POS Kasir Plaza
    createSpur(81, 105, 95, 105);     // Spur into Developer HQ
    createSpur(-81, -105, -95, -105); // Spur into PoRoRo Gelato
    createSpur(-81, -35, -95, -35);   // Spur into Journey Promenade
    createSpur(-81, 35, -95, 35);     // Spur into Skills Lab
    createSpur(-81, 105, -95, 105);   // Spur into Contact Relay
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

  // 5. MODERN CITY BUILDINGS & COMPREHENSIVE SKYSCRAPER ARCHITECTURE
  buildCitySkyscrapersAndBlocks() {
    // Shared Procedural Textures
    const windowTexBlue = this.createWindowTexture("#0a1120", "#38bdf8", 14, 5, "#fef08a");
    const windowTexCyan = this.createWindowTexture("#0b1120", "#22d3ee", 14, 5, "#67e8f9");
    const windowTexGold = this.createWindowTexture("#0f172a", "#f59e0b", 12, 4, "#fef3c7");
    const windowTexEmerald = this.createWindowTexture("#06120e", "#34d399", 14, 4, "#a7f3d0");
    const windowTexDark = this.createWindowTexture("#020617", "#94a3b8", 12, 4, "#cbd5e1");

    const helipadTex = this.createHelipadTexture();
    const helipadMat = new THREE.MeshStandardMaterial({ map: helipadTex, roughness: 0.6 });

    // Procedural Electronic LED Billboards (Projects & Flagships)
    const bbApexsions = this.createBillboardTexture("APEXSIONS RPG MMO", "Java 21 • 3 Kerajaan • BlueMap 3D", "FLAGSHIP", "#f59e0b", "#ef4444", "⚔️");
    const bbKasir = this.createBillboardTexture("POS KASIR FRIEL 2.0", "Nuxt 4 + Laravel REST API", "FULLSTACK", "#a855f7", "#06b6d4", "💻");
    const bbPororo = this.createBillboardTexture("PORORO GELATO CAFE", "Artisan Desserts • Figma Design", "CREATIVE", "#10b981", "#f59e0b", "🍦");
    const bbJesko = this.createBillboardTexture("KOENIGSEGG JESKO", "1600 HP Twin-Turbo • Aircore Carbon", "HYPERCAR", "#84cc16", "#38bdf8", "⚡");
    const bbDev = this.createBillboardTexture("RAFRIEL RADITYA W.", "Game Developer & Systems Engineer", "PROFILE", "#38bdf8", "#f43f5e", "🚀");

    // All 5 Soft Skills Billboards (Converted into High-Impact In-World Billboards as Requested!)
    const bbSkillKomunikasi = this.createBillboardTexture("KOMUNIKASI TEKNIS", "Menjelaskan Arsitektur Sistem & Alur Logika Game", "SOFT SKILL #1", "#38bdf8", "#60a5fa", "💬");
    const bbSkillTeamwork = this.createBillboardTexture("KERJA SAMA TIM", "Kolaborasi Aktif Proyek & Sinergi Tim Developer", "SOFT SKILL #2", "#818cf8", "#38bdf8", "👥");
    const bbSkillProblemSolving = this.createBillboardTexture("PROBLEM SOLVING", "Analitis Debugging, 20 TPS Server Stability & Query", "SOFT SKILL #3", "#f59e0b", "#ef4444", "💡");
    const bbSkillCleanCode = this.createBillboardTexture("KETELITIAN KODE", "Struktur Semantik, Validasi Slot & Standar Java 21", "SOFT SKILL #4", "#10b981", "#34d399", "🔍");
    const bbSkillSelfLearning = this.createBillboardTexture("BELAJAR MANDIRI", "Cepat Menguasai PaperMC, Nuxt 4 & Laravel 11", "SOFT SKILL #5", "#ec4899", "#f43f5e", "⚡");

    // Education, Tech Stack & Contact Billboards
    const bbEducation = this.createBillboardTexture("SMKN 71 JAKARTA", "Rekayasa Perangkat Lunak • Calon Game Developer", "EDUCATION", "#38bdf8", "#fbbf24", "🎓");
    const bbTechStack = this.createBillboardTexture("CORE TECH STACK", "Java 21 • PaperMC • Nuxt 4 • Laravel 11 • Three.js", "SYSTEMS", "#6366f1", "#38bdf8", "⚙️");
    const bbContact = this.createBillboardTexture("HUBUNGI PENGEMBANG", "rafriel.developer@gmail.com • GitHub: Rafriel", "CONNECT", "#06b6d4", "#a855f7", "✉️");

    // Times Square Live Vertical Ticker Ribbons
    const tickerApex = this.createVerticalTickerTexture(["APEXSIONS RPG", "SERVER: 20 TPS", "JAVA 21 ENGINE", "BLUEMAP 3D", "CUSTOM SKILLS"], "#f59e0b", "#38bdf8");
    const tickerNuxt = this.createVerticalTickerTexture(["POS KASIR 2.0", "NUXT 4 FRONTEND", "LARAVEL 11 API", "RESTFUL SERVICES", "FAST INVENTORY"], "#a855f7", "#06b6d4");
    const tickerSkills = this.createVerticalTickerTexture(["DEV SOFT SKILLS", "PROBLEM SOLVING", "TEAM COLLAB", "CLEAN CODE", "FAST LEARNING"], "#10b981", "#f59e0b");
    const tickerMetro = this.createVerticalTickerTexture(["METROPOLIS LIVE", "FPS: 60 STABLE", "PBR SHADERS", "PHYSICS DRIFT", "HIGH SPEED"], "#38bdf8", "#ec4899");

    // Architectural Facade Materials
    const matGlassBlue = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.92, roughness: 0.12, map: windowTexBlue });
    const matGlassCyan = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.90, roughness: 0.14, map: windowTexCyan });
    const matGlassGold = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.88, roughness: 0.16, map: windowTexGold });
    const matGlassEmerald = new THREE.MeshStandardMaterial({ color: 0x06120e, metalness: 0.90, roughness: 0.15, map: windowTexEmerald });
    const matGlassDark = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.85, roughness: 0.20, map: windowTexDark });

    const matCorporateWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.1 });
    const matGraniteDark = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.4 });
    const matCharcoal = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.6 });
    const matBrick = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.75 });
    const matSandstone = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.65 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });

    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    const acMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });
    const spireMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const lobbyGlassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.75 });
    const ledAccentMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ledGoldAccentMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const ledPinkAccentMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });

    // =========================================================================
    // BUILDER 1: HIGH-TECH MULTI-TIER GLASS SKYSCRAPER
    // =========================================================================
    const createSuperSkyscraper = (x, z, width, depth, height, mat, name, opts = {}) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const podiumH = Math.min(12, height * 0.22);
      const podium = new THREE.Mesh(new THREE.BoxGeometry(width, podiumH, depth), matCorporateWhite);
      podium.position.y = podiumH / 2;
      podium.castShadow = true;
      podium.receiveShadow = true;
      g.add(podium);

      const lobby = new THREE.Mesh(new THREE.BoxGeometry(width * 0.75, podiumH * 0.55, depth + 0.3), lobbyGlassMat);
      lobby.position.y = podiumH * 0.35;
      g.add(lobby);

      [-width * 0.42, width * 0.42].forEach(px => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, podiumH, 8), matGraniteDark);
        pillar.position.set(px, podiumH / 2, depth / 2 + 0.2);
        g.add(pillar);
      });

      const shaft1H = (height - podiumH) * 0.58;
      const shaft1W = width * 0.84;
      const shaft1D = depth * 0.84;
      const shaft1 = new THREE.Mesh(new THREE.BoxGeometry(shaft1W, shaft1H, shaft1D), mat);
      shaft1.position.y = podiumH + shaft1H / 2;
      shaft1.castShadow = true;
      g.add(shaft1);

      const shaft2H = (height - podiumH) * 0.42;
      const shaft2W = shaft1W * 0.82;
      const shaft2D = shaft1D * 0.82;
      const shaft2 = new THREE.Mesh(new THREE.BoxGeometry(shaft2W, shaft2H, shaft2D), mat);
      shaft2.position.y = podiumH + shaft1H + shaft2H / 2;
      shaft2.castShadow = true;
      g.add(shaft2);

      const crownW = shaft2W * 0.72;
      const crownD = shaft2D * 0.72;
      const crown = new THREE.Mesh(new THREE.BoxGeometry(crownW, 2.8, crownD), roofMat);
      crown.position.y = height + 1.4;
      crown.castShadow = true;
      g.add(crown);

      const ledTrim = new THREE.Mesh(new THREE.BoxGeometry(crownW + 0.1, 0.3, crownD + 0.1), opts.accentMat || ledAccentMat);
      ledTrim.position.y = height + 2.7;
      g.add(ledTrim);

      [-crownW * 0.25, crownW * 0.25].forEach(cx => {
        const acChiller = new THREE.Mesh(new THREE.BoxGeometry(crownW * 0.35, 1.6, crownD * 0.35), acMat);
        acChiller.position.set(cx, height + 2.4, 0);
        g.add(acChiller);
      });

      const crownType = opts.crownType || "spire";
      if (crownType === "helipad") {
        const padMesh = new THREE.Mesh(new THREE.BoxGeometry(crownW * 0.85, 0.3, crownD * 0.85), helipadMat);
        padMesh.position.y = height + 2.9;
        g.add(padMesh);
      } else if (crownType === "angled") {
        const wedgeGeo = new THREE.ConeGeometry(shaft2W * 0.48, 8, 4);
        wedgeGeo.rotateY(Math.PI / 4);
        const wedge = new THREE.Mesh(wedgeGeo, matCorporateWhite);
        wedge.position.y = height + 5.5;
        g.add(wedge);
      } else if (crownType === "spire") {
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 12, 8), spireMat);
        spire.position.y = height + 7.5;
        g.add(spire);

        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), beaconMat);
        beacon.position.y = height + 13.5;
        g.add(beacon);
      }

      if (opts.billboard) {
        const bbMat = new THREE.MeshBasicMaterial({ map: opts.billboard });
        const bbW = width * 0.82;
        const bbH = bbW * 0.52;
        const bbMesh = new THREE.Mesh(new THREE.PlaneGeometry(bbW, bbH), bbMat);
        const side = opts.billboardSide || "W";

        if (side === "W") {
          bbMesh.position.set(-width / 2 - 0.1, podiumH + shaft1H * 0.55, 0);
          bbMesh.rotation.y = -Math.PI / 2;
        } else if (side === "E") {
          bbMesh.position.set(width / 2 + 0.1, podiumH + shaft1H * 0.55, 0);
          bbMesh.rotation.y = Math.PI / 2;
        } else if (side === "N") {
          bbMesh.position.set(0, podiumH + shaft1H * 0.55, -depth / 2 - 0.1);
          bbMesh.rotation.y = Math.PI;
        } else {
          bbMesh.position.set(0, podiumH + shaft1H * 0.55, depth / 2 + 0.1);
        }
        g.add(bbMesh);
      }

      this.scene.add(g);
      this.collision.addBox(x, z, width, depth, name);
    };

    // =========================================================================
    // BUILDER 2: ICONIC METROPOLIS TWIN TOWERS WITH SKYBRIDGE
    // =========================================================================
    const createTwinTowers = (x, z, towerW, towerD, height, span, mat, name) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      [-span / 2, span / 2].forEach((tx, idx) => {
        const tower = new THREE.Mesh(new THREE.BoxGeometry(towerW, height, towerD), mat);
        tower.position.set(tx, height / 2, 0);
        tower.castShadow = true;
        g.add(tower);

        const lobby = new THREE.Mesh(new THREE.BoxGeometry(towerW + 1, 8, towerD + 1), matCorporateWhite);
        lobby.position.set(tx, 4, 0);
        g.add(lobby);

        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.4, 14, 8), spireMat);
        spire.position.set(tx, height + 7, 0);
        g.add(spire);

        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), beaconMat);
        beacon.position.set(tx, height + 14, 0);
        g.add(beacon);

        this.collision.addBox(x + tx, z, towerW, towerD, `${name}_tower_${idx}`);
      });

      const skybridgeY = height * 0.65;
      const bridgeW = span - towerW + 1;
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(bridgeW, 5.2, towerD * 0.6), lobbyGlassMat);
      bridge.position.set(0, skybridgeY, 0);
      g.add(bridge);

      const truss = new THREE.Mesh(new THREE.BoxGeometry(bridgeW, 0.8, towerD * 0.62), matGraniteDark);
      truss.position.set(0, skybridgeY - 2.8, 0);
      g.add(truss);

      this.scene.add(g);
    };

    // =========================================================================
    // BUILDER 3: MID-RISE MIXED-USE COMMERCIAL URBAN BLOCK
    // =========================================================================
    const createMidriseBlock = (x, z, width, depth, height, mat, name, opts = {}) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
      body.position.y = height / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      const awningW = width * 0.88;
      const awningColor = opts.awningColor || 0x0284c7;
      const awningMat = new THREE.MeshStandardMaterial({ color: awningColor, roughness: 0.6 });
      const awning = new THREE.Mesh(new THREE.BoxGeometry(awningW, 0.35, 2.4), awningMat);
      awning.position.set(0, 3.8, depth / 2 + 1.2);
      awning.rotation.x = 0.22;
      g.add(awning);

      const shopfront = new THREE.Mesh(new THREE.BoxGeometry(awningW, 3.4, 0.3), lobbyGlassMat);
      shopfront.position.set(0, 1.8, depth / 2 + 0.15);
      g.add(shopfront);

      const parapet = new THREE.Mesh(new THREE.BoxGeometry(width, 0.8, depth), matCorporateWhite);
      parapet.position.y = height + 0.4;
      g.add(parapet);

      const ac = new THREE.Mesh(new THREE.BoxGeometry(width * 0.35, 1.8, depth * 0.35), acMat);
      ac.position.set(-width * 0.2, height + 1.0, 0);
      g.add(ac);

      const stairHut = new THREE.Mesh(new THREE.BoxGeometry(width * 0.25, 2.6, depth * 0.25), matGraniteDark);
      stairHut.position.set(width * 0.22, height + 1.4, -depth * 0.15);
      g.add(stairHut);

      if (opts.hasWaterTower) {
        const wtGroup = new THREE.Group();
        wtGroup.position.set(width * 0.15, height + 0.8, depth * 0.2);

        [-0.9, 0.9].forEach(lx => {
          [-0.9, 0.9].forEach(lz => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6), matCharcoal);
            leg.position.set(lx, 1.2, lz);
            wtGroup.add(leg);
          });
        });

        const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 2.2, 12), matBrick);
        tank.position.y = 3.5;
        wtGroup.add(tank);

        const cap = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.1, 12), matGraniteDark);
        cap.position.y = 5.1;
        wtGroup.add(cap);

        g.add(wtGroup);
      }

      if (opts.billboard) {
        const bbMat = new THREE.MeshBasicMaterial({ map: opts.billboard });
        const bbW = width * 0.82;
        const bbH = bbW * 0.52;
        const bbMesh = new THREE.Mesh(new THREE.PlaneGeometry(bbW, bbH), bbMat);
        const side = opts.billboardSide || "S";
        if (side === "S") {
          bbMesh.position.set(0, height * 0.58, depth / 2 + 0.1);
        } else if (side === "N") {
          bbMesh.position.set(0, height * 0.58, -depth / 2 - 0.1);
          bbMesh.rotation.y = Math.PI;
        } else if (side === "E") {
          bbMesh.position.set(width / 2 + 0.1, height * 0.58, 0);
          bbMesh.rotation.y = Math.PI / 2;
        } else {
          bbMesh.position.set(-width / 2 - 0.1, height * 0.58, 0);
          bbMesh.rotation.y = -Math.PI / 2;
        }
        g.add(bbMesh);
      }

      this.scene.add(g);
      this.collision.addBox(x, z, width, depth, name);
    };

    // =========================================================================
    // BUILDER 4: TIMES SQUARE / SHIBUYA MULTI-SCREEN CORNER SKYSCRAPER
    // =========================================================================
    const createTimesSquareTower = (x, z, width, depth, height, mat, name, opts = {}) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      // 1. Street Level High-Tech Curved/Angled Podium
      const podiumH = 14;
      const podium = new THREE.Mesh(new THREE.BoxGeometry(width, podiumH, depth), matCorporateWhite);
      podium.position.y = podiumH / 2;
      podium.castShadow = true;
      g.add(podium);

      // Glass Atrium Entrance
      const lobby = new THREE.Mesh(new THREE.BoxGeometry(width * 0.8, 5, depth + 0.4), lobbyGlassMat);
      lobby.position.y = 3;
      g.add(lobby);

      // 2. Main Tower Shaft
      const shaftH = height - podiumH - 4;
      const shaftW = width * 0.88;
      const shaftD = depth * 0.88;
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(shaftW, shaftH, shaftD), mat);
      shaft.position.y = podiumH + shaftH / 2;
      shaft.castShadow = true;
      g.add(shaft);

      // 3. Rooftop Cyber Halo Crown
      const haloGeo = new THREE.TorusGeometry(shaftW * 0.42, 0.4, 8, 24);
      haloGeo.rotateX(Math.PI / 2);
      const halo = new THREE.Mesh(haloGeo, opts.accentMat || ledAccentMat);
      halo.position.y = height + 1.2;
      g.add(halo);

      // Antenna Mast
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 14, 8), spireMat);
      antenna.position.y = height + 8;
      g.add(antenna);

      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), beaconMat);
      beacon.position.y = height + 15.2;
      g.add(beacon);

      // 4. MULTI-TIERED ELECTRONIC SCREENS (TIMES SQUARE STYLE)
      const screenSide = opts.billboardSide || "S";
      let rotY = 0;
      let offsetVec = new THREE.Vector3(0, 0, depth / 2 + 0.15);

      if (screenSide === "N") {
        rotY = Math.PI;
        offsetVec.set(0, 0, -depth / 2 - 0.15);
      } else if (screenSide === "E") {
        rotY = Math.PI / 2;
        offsetVec.set(width / 2 + 0.15, 0, 0);
      } else if (screenSide === "W") {
        rotY = -Math.PI / 2;
        offsetVec.set(-width / 2 - 0.15, 0, 0);
      }

      const screensGroup = new THREE.Group();
      screensGroup.position.copy(offsetVec);
      screensGroup.rotation.y = rotY;

      // Tier 1: Giant Main Horizontal Electronic Billboard
      if (opts.mainBillboard) {
        const bbW = width * 0.88;
        const bbH = bbW * 0.52;
        const mainScreen = new THREE.Mesh(
          new THREE.PlaneGeometry(bbW, bbH),
          new THREE.MeshBasicMaterial({ map: opts.mainBillboard })
        );
        mainScreen.position.y = podiumH + bbH / 2 + 2;
        screensGroup.add(mainScreen);

        // Glowing Neon Frame
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(bbW + 0.6, bbH + 0.6, 0.2),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        frame.position.set(0, podiumH + bbH / 2 + 2, -0.15);
        screensGroup.add(frame);
      }

      // Tier 2: Live Vertical Ticker Screen Ribbon
      if (opts.verticalTicker) {
        const vtW = 3.8;
        const vtH = 12.0;
        const vertScreen = new THREE.Mesh(
          new THREE.PlaneGeometry(vtW, vtH),
          new THREE.MeshBasicMaterial({ map: opts.verticalTicker })
        );
        vertScreen.position.set(width * 0.38, podiumH + vtH / 2 + 2, 0.05);
        screensGroup.add(vertScreen);

        // Vertical frame
        const vframe = new THREE.Mesh(
          new THREE.BoxGeometry(vtW + 0.4, vtH + 0.4, 0.2),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b })
        );
        vframe.position.set(width * 0.38, podiumH + vtH / 2 + 2, -0.1);
        screensGroup.add(vframe);
      }

      // Spotlight Floodlights Mounted on Podium
      [-width * 0.35, width * 0.35].forEach(sx => {
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), matCharcoal);
        lamp.position.set(sx, podiumH + 0.4, 0.4);
        screensGroup.add(lamp);

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        bulb.position.set(sx, podiumH + 0.6, 0.4);
        screensGroup.add(bulb);
      });

      g.add(screensGroup);

      this.scene.add(g);
      this.collision.addBox(x, z, width, depth, name);
    };

    // =========================================================================
    // BUILDER 5: ROTUNDA CYLINDRICAL GLASS SKYSCRAPER
    // =========================================================================
    const createCylinderSkyscraper = (x, z, radius, height, mat, name, opts = {}) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      // Hexagonal Podium Base
      const podium = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.15, radius * 1.25, 10, 8), matCorporateWhite);
      podium.position.y = 5;
      podium.castShadow = true;
      g.add(podium);

      // Glass Entry
      const entryGlass = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.16, radius * 1.16, 4.5, 8), lobbyGlassMat);
      entryGlass.position.y = 4.5;
      g.add(entryGlass);

      // Main Cylindrical Glass Shaft
      const shaftH = height - 16;
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, shaftH, 24), mat);
      shaft.position.y = 10 + shaftH / 2;
      shaft.castShadow = true;
      g.add(shaft);

      // Horizontal Architectural Metal Rings Every 8m
      const numRings = Math.floor(shaftH / 8);
      for (let r = 1; r <= numRings; r++) {
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(radius * 1.03, radius * 1.03, 0.4, 24),
          matGraniteDark
        );
        ring.position.y = 10 + r * 8;
        g.add(ring);
      }

      // Top Panoramic Observation Deck Ring
      const deck = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.08, radius * 1.08, 3.2, 24), lobbyGlassMat);
      deck.position.y = height - 3;
      g.add(deck);

      // Rooftop Circular Helipad
      const helipad = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, 0.4, 24), helipadMat);
      helipad.position.y = height;
      g.add(helipad);

      // 4 Perimeter Warning Beacons
      for (let b = 0; b < 4; b++) {
        const ang = (b * Math.PI) / 2;
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), beaconMat);
        beacon.position.set(Math.cos(ang) * (radius * 0.92), height + 0.35, Math.sin(ang) * (radius * 0.92));
        g.add(beacon);
      }

      this.scene.add(g);
      this.collision.addCircle(x, z, radius + 0.5, name);
    };

    // =========================================================================
    // BUILDER 6: DIAGRID STRUCTURAL LATTICE SKYSCRAPER (GHERKIN / HEARST STYLE)
    // =========================================================================
    const createDiagridTower = (x, z, width, depth, height, mat, name, opts = {}) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      // Polygonal Base Podium
      const podium = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.55, width * 0.65, 10, 8), matCorporateWhite);
      podium.position.y = 5;
      podium.castShadow = true;
      g.add(podium);

      // Central Glass Shaft
      const shaftH = height - 18;
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(width * 0.85, shaftH, depth * 0.85), mat);
      shaft.position.y = 10 + shaftH / 2;
      shaft.castShadow = true;
      g.add(shaft);

      // Diagrid Exterior Structural Frame (Diamond cross lattice)
      const trussCount = Math.floor(shaftH / 14);
      for (let t = 0; t < trussCount; t++) {
        const ty = 10 + t * 14 + 7;
        const belt = new THREE.Mesh(new THREE.BoxGeometry(width * 0.88, 0.8, depth * 0.88), matCharcoal);
        belt.position.y = ty;
        g.add(belt);

        const diag1 = new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, 0.4, depth * 0.9), matCorporateWhite);
        diag1.position.y = ty;
        diag1.rotation.y = 0.785;
        g.add(diag1);
      }

      // Tapered Crown
      const crown = new THREE.Mesh(new THREE.ConeGeometry(width * 0.52, 8, 8), matCorporateWhite);
      crown.position.y = height - 4;
      g.add(crown);

      // Spire & Beacon
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 12, 8), spireMat);
      spire.position.y = height + 4;
      g.add(spire);

      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), beaconMat);
      beacon.position.y = height + 10.5;
      g.add(beacon);

      this.scene.add(g);
      this.collision.addBox(x, z, width, depth, name);
    };

    // =========================================================================
    // BUILDER 7: NYC SOHO / BROOKLYN BRICK LOFT WITH FIRE ESCAPES
    // =========================================================================
    const createLoftWithFireEscapes = (x, z, width, depth, height, mat, name, opts = {}) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      // Brick Building Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
      body.position.y = height / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      // Ground Floor Retail Boutique Shopfront & Awning
      const awningW = width * 0.88;
      const awningColor = opts.awningColor || 0x0284c7;
      const awningMat = new THREE.MeshStandardMaterial({ color: awningColor, roughness: 0.6 });
      const awning = new THREE.Mesh(new THREE.BoxGeometry(awningW, 0.35, 2.4), awningMat);
      awning.position.set(0, 3.8, depth / 2 + 1.2);
      awning.rotation.x = 0.22;
      g.add(awning);

      const shopfront = new THREE.Mesh(new THREE.BoxGeometry(awningW, 3.4, 0.3), lobbyGlassMat);
      shopfront.position.set(0, 1.8, depth / 2 + 0.15);
      g.add(shopfront);

      // EXTERIOR METAL ZIGZAG FIRE ESCAPES ON FACADE
      const floors = Math.floor(height / 4.5);
      for (let f = 1; f < floors; f++) {
        const fy = f * 4.5;
        // Metal platform balcony
        const platform = new THREE.Mesh(new THREE.BoxGeometry(width * 0.45, 0.15, 1.2), matCharcoal);
        const px = (f % 2 === 0 ? -1 : 1) * (width * 0.2);
        platform.position.set(px, fy, depth / 2 + 0.65);
        g.add(platform);

        // Safety railing
        const rail = new THREE.Mesh(new THREE.BoxGeometry(width * 0.45, 0.8, 1.2), matCharcoal);
        rail.position.set(px, fy + 0.4, depth / 2 + 0.65);
        g.add(rail);

        // Diagonal stairs
        if (f > 1) {
          const stair = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.8, 0.1), matCharcoal);
          stair.position.set(0, fy - 2.2, depth / 2 + 0.8);
          stair.rotation.z = (f % 2 === 0 ? 0.7 : -0.7);
          g.add(stair);
        }
      }

      // Rooftop Parapet
      const parapet = new THREE.Mesh(new THREE.BoxGeometry(width, 0.8, depth), matCorporateWhite);
      parapet.position.y = height + 0.4;
      g.add(parapet);

      // Rooftop NYC Wooden Barrel Water Tower
      const wtGroup = new THREE.Group();
      wtGroup.position.set(width * 0.2, height + 0.8, -depth * 0.15);

      [-0.8, 0.8].forEach(lx => {
        [-0.8, 0.8].forEach(lz => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6), matCharcoal);
          leg.position.set(lx, 1.1, lz);
          wtGroup.add(leg);
        });
      });

      const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.0, 12), matBrick);
      tank.position.y = 3.2;
      wtGroup.add(tank);

      const cap = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.0, 12), matGraniteDark);
      cap.position.y = 4.7;
      wtGroup.add(cap);

      g.add(wtGroup);

      this.scene.add(g);
      this.collision.addBox(x, z, width, depth, name);
    };

    // =========================================================================
    // BUILDER 8: CASCADING TERRACED URBAN ECO-TOWER
    // =========================================================================
    const createTerracedTower = (x, z, width, depth, height, mat, name, opts = {}) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      // Tier 1 (Base - 35% height)
      const t1H = height * 0.35;
      const t1 = new THREE.Mesh(new THREE.BoxGeometry(width, t1H, depth), mat);
      t1.position.y = t1H / 2;
      t1.castShadow = true;
      g.add(t1);

      // Glass Podium Lobby
      const lobby = new THREE.Mesh(new THREE.BoxGeometry(width * 0.8, 5, depth + 0.4), lobbyGlassMat);
      lobby.position.y = 2.5;
      g.add(lobby);

      // Tier 2 (Mid - 35% height, setback by 3m)
      const t2H = height * 0.35;
      const t2W = width - 4;
      const t2D = depth - 4;
      const t2 = new THREE.Mesh(new THREE.BoxGeometry(t2W, t2H, t2D), mat);
      t2.position.set(2, t1H + t2H / 2, 0);
      t2.castShadow = true;
      g.add(t2);

      // Terrace 1 Garden (Lush Greenery on Setback)
      const garden1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, depth * 0.8), foliageMat);
      garden1.position.set(-width / 2 + 1.8, t1H + 0.2, 0);
      g.add(garden1);

      // Tier 3 (Upper - 30% height, setback further)
      const t3H = height * 0.30;
      const t3W = t2W - 4;
      const t3D = t2D - 4;
      const t3 = new THREE.Mesh(new THREE.BoxGeometry(t3W, t3H, t3D), mat);
      t3.position.set(4, t1H + t2H + t3H / 2, 0);
      t3.castShadow = true;
      g.add(t3);

      // Terrace 2 Garden
      const garden2 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, t2D * 0.8), foliageMat);
      garden2.position.set(0, t1H + t2H + 0.2, 0);
      g.add(garden2);

      // Rooftop Solar Trellis / Canopy
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(t3W * 0.9, 0.3, t3D * 0.9), matCorporateWhite);
      canopy.position.set(4, height + 1.5, 0);
      g.add(canopy);

      this.scene.add(g);
      this.collision.addBox(x, z, width, depth, name);
    };

    // =========================================================================
    // BUILDER 9: STANDALONE HIGHWAY MONOLITH BILLBOARDS (DOUBLE-SIDED ELECTRONIC)
    // =========================================================================
    const createHighwayMonolithBillboard = (x, z, rotY, billboardTex, name) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      // Concrete Footing
      const footing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 1.4), matGraniteDark);
      footing.position.y = 0.4;
      g.add(footing);

      // Heavy Structural Steel Pylon Columns
      [-0.7, 0.7].forEach(px => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 10.5, 8), matCharcoal);
        col.position.set(px, 5.5, 0);
        col.castShadow = true;
        g.add(col);
      });

      // Cross Bracing Trusses
      const truss = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 0.4), matCharcoal);
      truss.position.set(0, 5.5, 0);
      g.add(truss);

      // Billboard Screen Frame (Heavy Cyber Metal Housing)
      const bW = 11.0;
      const bH = 5.5;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.6, bH + 0.6, 0.6), matCharcoal);
      frame.position.set(0, 10.8 + bH / 2, 0);
      frame.castShadow = true;
      g.add(frame);

      // Neon Rim Trim
      const rim = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.8, 0.2, 0.8), ledAccentMat);
      rim.position.set(0, 10.8 + bH + 0.3, 0);
      g.add(rim);

      // Front Face Screen
      const bbMat = new THREE.MeshBasicMaterial({ map: billboardTex });
      const frontScreen = new THREE.Mesh(new THREE.PlaneGeometry(bW, bH), bbMat);
      frontScreen.position.set(0, 10.8 + bH / 2, 0.32);
      g.add(frontScreen);

      // Back Face Screen (Double-sided for oncoming drivers from opposite direction)
      const backScreen = new THREE.Mesh(new THREE.PlaneGeometry(bW, bH), bbMat);
      backScreen.position.set(0, 10.8 + bH / 2, -0.32);
      backScreen.rotation.y = Math.PI;
      g.add(backScreen);

      // Maintenance Catwalk Platform Underneath
      const catwalk = new THREE.Mesh(new THREE.BoxGeometry(bW + 1.2, 0.15, 1.4), matGraniteDark);
      catwalk.position.set(0, 10.7, 0);
      g.add(catwalk);

      // Angled Overhead LED Spotlights (2 on each face)
      [-bW * 0.3, bW * 0.3].forEach(lx => {
        // Front Spotlight
        const spotArmF = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.2), matCharcoal);
        spotArmF.position.set(lx, 10.8 + bH + 0.4, 0.6);
        g.add(spotArmF);

        const lampF = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        lampF.position.set(lx, 10.8 + bH + 0.3, 1.1);
        g.add(lampF);

        // Back Spotlight
        const spotArmB = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.2), matCharcoal);
        spotArmB.position.set(lx, 10.8 + bH + 0.4, -0.6);
        g.add(spotArmB);

        const lampB = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        lampB.position.set(lx, 10.8 + bH + 0.3, -1.1);
        g.add(lampB);
      });

      this.scene.add(g);
      this.collision.addCircle(x, z, 1.4, name);
    };

    // =========================================================================
    // BUILDER 10: DISTANT HORIZON PERIMETER SKYLINE SKYSCRAPER
    // =========================================================================
    const createSkylineTower = (x, z, width, depth, height, mat) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
      body.position.y = height / 2;
      body.castShadow = true;
      g.add(body);

      const crownH = height * 0.15;
      const crown = new THREE.Mesh(new THREE.BoxGeometry(width * 0.75, crownH, depth * 0.75), matCorporateWhite);
      crown.position.y = height + crownH / 2;
      g.add(crown);

      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 12, 6), spireMat);
      spire.position.y = height + crownH + 6;
      g.add(spire);

      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), beaconMat);
      beacon.position.y = height + crownH + 12;
      g.add(beacon);

      this.scene.add(g);
    };

    // =========================================================================
    // 1. CLUSTER DOWNTOWN FINANCIAL CORE (NORTH-EAST INNER QUADRANT)
    // =========================================================================
    // TIMES SQUARE TOWER 1: Facing South-West directly at Roundabout & Main Avenue Approach
    createTimesSquareTower(24, -48, 16, 16, 86, matGlassBlue, "ts_tower_ne_roundabout", {
      mainBillboard: bbSkillKomunikasi,
      verticalTicker: tickerSkills,
      billboardSide: "S",
      accentMat: ledAccentMat
    });

    createSuperSkyscraper(48, -48, 16, 16, 88, matGlassBlue, "skyscraper_ne_zenithar", {
      crownType: "helipad",
      billboard: bbApexsions,
      billboardSide: "W",
      accentMat: ledGoldAccentMat
    });

    createCylinderSkyscraper(60, -48, 7.5, 68, matGlassCyan, "rotunda_ne_gateway", {
      accentMat: ledAccentMat
    });

    createLoftWithFireEscapes(24, -36, 14, 10, 28, matBrick, "loft_ne_waterfront_1", {
      awningColor: 0x0f766e
    });

    createLoftWithFireEscapes(48, -36, 16, 10, 26, matSandstone, "loft_ne_waterfront_2", {
      awningColor: 0xb45309
    });

    // =========================================================================
    // 2. CLUSTER DOWNTOWN MEDIA & SILICON TECH CORE (NORTH-WEST INNER QUADRANT)
    // =========================================================================
    // TIMES SQUARE TOWER 2: Facing South-East directly at Roundabout & Main Avenue Approach
    createTimesSquareTower(-24, -48, 16, 16, 84, matGlassCyan, "ts_tower_nw_roundabout", {
      mainBillboard: bbSkillProblemSolving,
      verticalTicker: tickerApex,
      billboardSide: "S",
      accentMat: ledGoldAccentMat
    });

    createSuperSkyscraper(-48, -48, 16, 16, 78, matGlassCyan, "skyscraper_nw_silicon", {
      crownType: "angled",
      billboard: bbDev,
      billboardSide: "E",
      accentMat: ledAccentMat
    });

    createCylinderSkyscraper(-60, -48, 7.5, 64, matGlassDark, "rotunda_nw_techcenter");

    createLoftWithFireEscapes(-24, -36, 14, 10, 26, matBrick, "loft_nw_studios_1", {
      awningColor: 0x38bdf8
    });

    createLoftWithFireEscapes(-48, -36, 16, 10, 28, matSandstone, "loft_nw_studios_2", {
      awningColor: 0xd97706
    });

    // =========================================================================
    // 3. CLUSTER SOUTH-WEST RESIDENTIAL, TWIN TOWERS & CREATIVE DISTRICT
    // =========================================================================
    // TIMES SQUARE TOWER 3: Facing North towards Roundabout & West Boulevard
    createTimesSquareTower(-24, 24, 16, 16, 80, matGlassGold, "ts_tower_sw_boulevard", {
      mainBillboard: bbSkillTeamwork,
      verticalTicker: tickerMetro,
      billboardSide: "N",
      accentMat: ledGoldAccentMat
    });

    createTwinTowers(-48, 44, 12, 12, 72, 20, matGlassBlue, "twintowers_sw_metropolis");

    createSuperSkyscraper(-60, 24, 14, 14, 56, matGlassEmerald, "skyscraper_sw_grandres", {
      crownType: "helipad"
    });

    createMidriseBlock(-24, 56, 16, 12, 28, matCorporateWhite, "midrise_sw_dining", {
      billboard: bbPororo,
      billboardSide: "N",
      awningColor: 0x10b981
    });

    createLoftWithFireEscapes(-48, 62, 14, 10, 24, matBrick, "loft_sw_residences", {
      awningColor: 0x9a3412
    });

    // =========================================================================
    // 4. CLUSTER SOUTH-EAST PARKSIDE HIGH-RISE & HOTEL DISTRICT
    // =========================================================================
    createCylinderSkyscraper(58, 24, 7.5, 72, matGlassGold, "rotunda_se_parkside", {
      accentMat: ledGoldAccentMat
    });

    createSuperSkyscraper(58, 48, 15, 15, 80, matGlassBlue, "skyscraper_se_parkview", {
      crownType: "helipad",
      billboard: bbKasir,
      billboardSide: "W",
      accentMat: ledAccentMat
    });

    createMidriseBlock(38, 62, 14, 10, 26, matSandstone, "midrise_se_promenade", {
      hasWaterTower: true,
      awningColor: 0xd97706
    });

    createLoftWithFireEscapes(58, 62, 14, 10, 26, matBrick, "loft_se_hospitality", {
      awningColor: 0x6366f1
    });

    // =========================================================================
    // 5. CLUSTER NORTH UPTOWN WATERFRONT CORRIDOR (Z: -86 to -136)
    // =========================================================================
    createSuperSkyscraper(26, -95, 16, 16, 72, matGlassBlue, "skyscraper_nu_east1", { crownType: "spire" });
    createTerracedTower(52, -95, 16, 16, 62, matCorporateWhite, "terraced_nu_east2");
    createSuperSkyscraper(26, -125, 16, 16, 64, matGlassCyan, "skyscraper_nu_east3", { crownType: "helipad" });
    createDiagridTower(52, -125, 15, 15, 80, matGlassDark, "diagrid_nu_east4");

    createSuperSkyscraper(-26, -95, 16, 16, 76, matGlassCyan, "skyscraper_nu_west1", { crownType: "angled" });
    createDiagridTower(-52, -95, 15, 15, 82, matGlassGold, "diagrid_nu_west2");
    createCylinderSkyscraper(-26, -125, 7.5, 62, matGlassBlue, "rotunda_nu_west3");
    createTerracedTower(-52, -125, 16, 16, 64, matCorporateWhite, "terraced_nu_west4");

    createLoftWithFireEscapes(92, -95, 16, 14, 28, matBrick, "loft_nu_east5");
    createDiagridTower(118, -95, 16, 16, 84, matGlassBlue, "diagrid_nu_east6");
    createCylinderSkyscraper(92, -125, 7.5, 64, matGlassEmerald, "rotunda_nu_east7");
    createTerracedTower(118, -125, 16, 16, 66, matCorporateWhite, "terraced_nu_east8");

    createLoftWithFireEscapes(-92, -95, 16, 14, 28, matSandstone, "loft_nu_west5");
    createSuperSkyscraper(-118, -95, 16, 16, 74, matGlassGold, "skyscraper_nu_west6");
    createTerracedTower(-92, -125, 16, 16, 62, matCorporateWhite, "terraced_nu_west7");
    createDiagridTower(-118, -125, 16, 16, 86, matGlassCyan, "diagrid_nu_west8");

    // =========================================================================
    // 6. CLUSTER SOUTH METROPOLIS HIGH-RISE CANYON (Z: 86 to 136)
    // =========================================================================
    createSuperSkyscraper(26, 95, 16, 16, 82, matGlassGold, "skyscraper_su_east1", { crownType: "spire" });
    createCylinderSkyscraper(52, 95, 7.5, 68, matGlassBlue, "rotunda_su_east2");
    createTerracedTower(26, 125, 16, 16, 64, matCorporateWhite, "terraced_su_east3");
    createSuperSkyscraper(52, 125, 16, 16, 66, matGlassEmerald, "skyscraper_su_east4");

    createSuperSkyscraper(-26, 95, 16, 16, 78, matGlassBlue, "skyscraper_su_west1", { crownType: "helipad" });
    createTerracedTower(-52, 95, 16, 16, 66, matCorporateWhite, "terraced_su_west2");
    createDiagridTower(-26, 125, 15, 15, 80, matGlassDark, "diagrid_su_west3");
    createSuperSkyscraper(-52, 125, 16, 16, 68, matGlassDark, "skyscraper_su_west4");

    createDiagridTower(92, 95, 16, 16, 84, matGlassGold, "diagrid_su_east5");
    createLoftWithFireEscapes(118, 95, 16, 14, 28, matSandstone, "loft_su_east6");
    createCylinderSkyscraper(92, 125, 7.5, 64, matGlassCyan, "rotunda_su_east7");
    createTerracedTower(118, 125, 16, 16, 66, matCorporateWhite, "terraced_su_east8");

    createLoftWithFireEscapes(-92, 95, 16, 14, 28, matSandstone, "loft_su_west5");
    createCylinderSkyscraper(-118, 95, 7.5, 66, matGlassCyan, "rotunda_su_west6");
    createDiagridTower(-92, 125, 16, 16, 84, matGlassBlue, "diagrid_su_west7");
    createTerracedTower(-118, 125, 16, 16, 64, matCorporateWhite, "terraced_su_west8");

    // =========================================================================
    // 7. CLUSTER EAST MIDTOWN COMMERCIAL STRIP (X: 86 to 136, Z: -68 to 68)
    // =========================================================================
    createMidriseBlock(92, -56, 14, 14, 32, matCorporateWhite, "midrise_em_1", { hasWaterTower: true });
    createSuperSkyscraper(118, -56, 16, 16, 68, matGlassGold, "skyscraper_em_2", { crownType: "spire" });
    createLoftWithFireEscapes(92, -36, 14, 10, 26, matBrick, "loft_em_3");

    // TIMES SQUARE TOWER 4: Facing West along East Boulevard towards POS Kasir Plaza
    createTimesSquareTower(126, -36, 16, 16, 74, matGlassCyan, "ts_tower_em_boulevard", {
      mainBillboard: bbSkillCleanCode,
      verticalTicker: tickerNuxt,
      billboardSide: "W",
      accentMat: ledAccentMat
    });

    createSuperSkyscraper(92, 24, 14, 14, 64, matGlassEmerald, "skyscraper_em_5", { crownType: "spire" });
    createTerracedTower(118, 24, 16, 16, 62, matCorporateWhite, "terraced_em_6");
    createDiagridTower(92, 56, 15, 15, 80, matGlassBlue, "diagrid_em_7");
    createLoftWithFireEscapes(118, 56, 16, 14, 28, matBrick, "loft_em_8");

    // =========================================================================
    // 8. CLUSTER WEST MIDTOWN CREATIVE STRIP (X: -136 to -86, Z: -68 to 68)
    // =========================================================================
    createMidriseBlock(-92, -56, 14, 14, 32, matCharcoal, "midrise_wm_1", { billboard: bbJesko, billboardSide: "E" });
    createSuperSkyscraper(-118, -56, 16, 16, 70, matGlassDark, "skyscraper_wm_2", { crownType: "spire" });
    createLoftWithFireEscapes(-92, -36, 14, 10, 26, matBrick, "loft_wm_3");
    createTerracedTower(-118, -36, 16, 16, 60, matCorporateWhite, "terraced_wm_4");

    createSuperSkyscraper(-92, 24, 14, 14, 60, matGlassGold, "skyscraper_wm_5", { crownType: "spire" });

    // TIMES SQUARE TOWER 5: Facing East along West Boulevard towards PoRoRo Cafe Plaza
    createTimesSquareTower(-126, 24, 16, 16, 76, matGlassBlue, "ts_tower_wm_boulevard", {
      mainBillboard: bbSkillSelfLearning,
      verticalTicker: tickerSkills,
      billboardSide: "E",
      accentMat: ledPinkAccentMat
    });

    createCylinderSkyscraper(-92, 56, 7, 58, matGlassBlue, "rotunda_wm_7");
    createLoftWithFireEscapes(-118, 56, 16, 14, 28, matBrick, "loft_wm_8");

    // =========================================================================
    // 9. EXPANDED OUTER PARKWAY METROPOLIS CORRIDORS (NEW EXPANSION: 153m TO 197m)
    // =========================================================================
    // Outer North Tech Corridor (Z: -185 to -165)
    createDiagridTower(-175, -175, 18, 18, 92, matGlassCyan, "diagrid_outer_nw_pinnacle");
    createCylinderSkyscraper(-115, -175, 8.0, 70, matGlassBlue, "rotunda_outer_n1");
    createTerracedTower(-55, -175, 18, 18, 68, matCorporateWhite, "terraced_outer_n2");
    createSuperSkyscraper(55, -175, 18, 18, 80, matGlassCyan, "skyscraper_outer_n3", { crownType: "helipad" });
    createDiagridTower(115, -175, 18, 18, 88, matGlassGold, "diagrid_outer_n4");
    createCylinderSkyscraper(175, -175, 8.0, 72, matGlassEmerald, "rotunda_outer_ne_pinnacle");

    // Outer South Innovation Campus (Z: 165 to 185)
    createCylinderSkyscraper(-175, 175, 8.0, 74, matGlassCyan, "rotunda_outer_sw_pinnacle");
    createTerracedTower(-115, 175, 18, 18, 66, matCorporateWhite, "terraced_outer_s1");
    createDiagridTower(-55, 175, 18, 18, 86, matGlassGold, "diagrid_outer_s2");
    createTerracedTower(55, 175, 18, 18, 68, matCorporateWhite, "terraced_outer_s3");
    createSuperSkyscraper(115, 175, 18, 18, 78, matGlassGold, "skyscraper_outer_s4", { crownType: "spire" });
    createDiagridTower(175, 175, 18, 18, 90, matGlassBlue, "diagrid_outer_se_pinnacle");

    // Outer East Media & Commerce Hub (X: 165 to 185)
    createSuperSkyscraper(175, -115, 18, 18, 82, matGlassBlue, "skyscraper_outer_e1", { crownType: "helipad" });
    createCylinderSkyscraper(175, -55, 8.0, 68, matGlassCyan, "rotunda_outer_e2");
    createTerracedTower(175, 55, 18, 18, 66, matCorporateWhite, "terraced_outer_e3");
    createDiagridTower(175, 115, 18, 18, 86, matGlassEmerald, "diagrid_outer_e4");

    // Outer West Creative Quarter (X: -185 to -165)
    createDiagridTower(-175, -115, 18, 18, 86, matGlassDark, "diagrid_outer_w1");
    createTerracedTower(-175, -55, 18, 18, 66, matCorporateWhite, "terraced_outer_w2");
    createCylinderSkyscraper(-175, 55, 8.0, 70, matGlassBlue, "rotunda_outer_w3");
    createSuperSkyscraper(-175, 115, 18, 18, 80, matGlassDark, "skyscraper_outer_w4", { crownType: "spire" });

    // =========================================================================
    // 10. HIGHWAY MONOLITH BILLBOARDS (FEATURING ALL SOFT SKILLS, EDUCATION & CONTACT)
    // =========================================================================
    // Standalone double-sided monolith billboards placed along highways in plain driver view!
    createHighwayMonolithBillboard(12, -85, 0, bbEducation, "monolith_bb_education");
    createHighwayMonolithBillboard(-12, 85, 0, bbContact, "monolith_bb_contact");
    createHighwayMonolithBillboard(85, 12, Math.PI / 2, bbTechStack, "monolith_bb_techstack");
    createHighwayMonolithBillboard(-85, -12, Math.PI / 2, bbSkillProblemSolving, "monolith_bb_problem_solving");

    createHighwayMonolithBillboard(60, -195, Math.PI / 2, bbSkillKomunikasi, "monolith_bb_komunikasi");
    createHighwayMonolithBillboard(-60, 195, Math.PI / 2, bbSkillTeamwork, "monolith_bb_teamwork");
    createHighwayMonolithBillboard(195, 60, 0, bbSkillCleanCode, "monolith_bb_cleancode");
    createHighwayMonolithBillboard(-195, -60, 0, bbSkillSelfLearning, "monolith_bb_selflearning");

    // =========================================================================
    // 11. UNBROKEN 360-DEGREE PERIMETER SKYLINE BACKDROP (OUTER HORIZON AT +-238m)
    // =========================================================================
    const skylineMats = [matGlassBlue, matGlassCyan, matGlassGold, matGlassEmerald, matGlassDark];
    // North Perimeter Skyline (Z = -238)
    [-210, -170, -130, -90, -50, -15, 15, 50, 90, 130, 170, 210].forEach((sx, i) => {
      const h = 58 + (i % 4) * 11 + Math.sin(i * 1.7) * 8;
      createSkylineTower(sx, -238, 18, 18, h, skylineMats[i % skylineMats.length]);
    });
    // South Perimeter Skyline (Z = 238)
    [-210, -170, -130, -90, -50, -15, 15, 50, 90, 130, 170, 210].forEach((sx, i) => {
      const h = 60 + ((i + 2) % 4) * 10 + Math.cos(i * 1.5) * 8;
      createSkylineTower(sx, 238, 18, 18, h, skylineMats[(i + 1) % skylineMats.length]);
    });
    // East Perimeter Skyline (X = 238)
    [-210, -170, -130, -90, -50, -15, 15, 50, 90, 130, 170, 210].forEach((sz, i) => {
      const h = 56 + ((i + 1) % 4) * 11 + Math.sin(i * 2.1) * 7;
      createSkylineTower(238, sz, 18, 18, h, skylineMats[(i + 2) % skylineMats.length]);
    });
    // West Perimeter Skyline (X = -238)
    [-210, -170, -130, -90, -50, -15, 15, 50, 90, 130, 170, 210].forEach((sz, i) => {
      const h = 58 + ((i + 3) % 4) * 10 + Math.cos(i * 1.9) * 8;
      createSkylineTower(-238, sz, 18, 18, h, skylineMats[(i + 3) % skylineMats.length]);
    });
  }

  // 6. URBAN INFRASTRUCTURE & STREET FURNITURE (AUTHENTIC METROPOLIS DETAILS)
  buildUrbanInfrastructureAndStreetFurniture() {
    const metalDark = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
    const signGreen = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });
    const glassShelterMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, transparent: true, opacity: 0.65 });
    const woodBenchMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
    const hydrantMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.6, roughness: 0.3 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });

    // Signal Light Lenses
    const redLens = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const yellowLens = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const greenLens = new THREE.MeshBasicMaterial({ color: 0x22c55e });

    // Helper: 3-Lens Traffic Signal Head
    const createTrafficSignalHead = () => {
      const g = new THREE.Group();
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.45), metalDark);
      g.add(box);

      const red = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 12), redLens);
      red.rotation.x = Math.PI / 2;
      red.position.set(0, 0.42, 0.22);
      g.add(red);

      const yellow = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 12), yellowLens);
      yellow.rotation.x = Math.PI / 2;
      yellow.position.set(0, 0, 0.22);
      g.add(yellow);

      const green = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 12), greenLens);
      green.rotation.x = Math.PI / 2;
      green.position.set(0, -0.42, 0.22);
      g.add(green);

      return g;
    };

    // BUILDER A: OVERHEAD CANTILEVER TRAFFIC LIGHT GANTRY
    const createTrafficGantry = (x, z, rotY, streetName = "MAIN AVE") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      // Vertical Support Mast on Sidewalk Edge
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 7.2, 10), metalDark);
      mast.position.set(-9.5, 3.6, 0);
      mast.castShadow = true;
      g.add(mast);

      // Horizontal Cantilever Arm spanning across road lanes
      const arm = new THREE.Mesh(new THREE.BoxGeometry(14, 0.45, 0.45), metalDark);
      arm.position.set(-2.5, 6.8, 0);
      g.add(arm);

      // Diagonal Brace
      const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 8), metalDark);
      brace.position.set(-7.5, 5.8, 0);
      brace.rotation.z = -0.7;
      g.add(brace);

      // 2 Overhead Traffic Signal Heads
      [-4.5, 1.5].forEach(sx => {
        const signal = createTrafficSignalHead();
        signal.position.set(sx, 5.8, 0);
        g.add(signal);
      });

      // Overhead Street Name Sign
      const signTex = this.createSignTexture(streetName, "#0f172a", "#38bdf8", "CITY TRAFFIC");
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.0), new THREE.MeshBasicMaterial({ map: signTex }));
      signMesh.position.set(-1.5, 7.6, 0.25);
      g.add(signMesh);

      this.scene.add(g);
      this.collision.addCircle(x - Math.cos(rotY) * 9.5, z + Math.sin(rotY) * 9.5, 0.7, "traffic_mast");
    };

    // Placed safely at Main Boulevard Approaches to Central Roundabout (Radius 16m)
    createTrafficGantry(0, -18, 0, "MAIN AVE NORTH");
    createTrafficGantry(0, 18, Math.PI, "MAIN AVE SOUTH");
    createTrafficGantry(18, 0, -Math.PI / 2, "EAST BOULEVARD");
    createTrafficGantry(-18, 0, Math.PI / 2, "WEST BOULEVARD");

    // BUILDER B: OVERHEAD HIGHWAY DIRECTIONAL SIGN GANTRY
    const createHighwayGantry = (x, z, rotY, line1, line2) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      // Left & Right Masts outside road lanes
      [-9.5, 9.5].forEach(mx => {
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 8.2, 8), metalDark);
        mast.position.set(mx, 4.1, 0);
        g.add(mast);
      });

      // Overhead Cross Truss
      const truss = new THREE.Mesh(new THREE.BoxGeometry(19.5, 0.9, 0.9), metalDark);
      truss.position.set(0, 7.6, 0);
      g.add(truss);

      // Dual Green Highway Direction Signs
      const signTex1 = this.createSignTexture(line1, "#15803d", "#ffffff", "METRO EXPRESSWAY");
      const sign1 = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.6), new THREE.MeshBasicMaterial({ map: signTex1 }));
      sign1.position.set(-4.2, 7.6, 0.48);
      g.add(sign1);

      const signTex2 = this.createSignTexture(line2, "#15803d", "#ffffff", "EXPRESS EXIT");
      const sign2 = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.6), new THREE.MeshBasicMaterial({ map: signTex2 }));
      sign2.position.set(4.2, 7.6, 0.48);
      g.add(sign2);

      this.scene.add(g);
    };

    createHighwayGantry(0, -135, 0, "↑ DOWNTOWN CORE", "↗ APEXSIONS REALM");
    createHighwayGantry(0, 135, Math.PI, "↑ METROPOLIS SOUTH", "↖ DEV HQ & STUDIO");
    createHighwayGantry(135, 0, -Math.PI / 2, "↑ EAST RING EXP", "↗ POS KASIR STORE");
    createHighwayGantry(-135, 0, Math.PI / 2, "↑ WEST RING EXP", "↖ PORORO CAFE");

    // Outer Parkway Circuit Gantries (+-195m)
    createHighwayGantry(0, -195, 0, "↑ OUTER NORTH LOOP", "↗ TECH CORRIDOR");
    createHighwayGantry(0, 195, Math.PI, "↑ OUTER SOUTH LOOP", "↖ INNOVATION CAMPUS");
    createHighwayGantry(195, 0, -Math.PI / 2, "↑ OUTER EAST LOOP", "↗ MEDIA COMMERCE HUB");
    createHighwayGantry(-195, 0, Math.PI / 2, "↑ OUTER WEST LOOP", "↖ CREATIVE DESIGN QUARTER");

    // BUILDER C: GLASS BUS STOP TRANSIT SHELTERS
    const createBusStop = (x, z, rotY = 0) => {
      const g = new THREE.Group();
      g.position.set(x, 0.15, z);
      g.rotation.y = rotY;

      // Steel Support Pillars
      [-1.8, 1.8].forEach(px => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6), metalDark);
        post.position.set(px, 1.6, -0.6);
        g.add(post);
      });

      // Glass Back Panel
      const backGlass = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 0.1), glassShelterMat);
      backGlass.position.set(0, 1.6, -0.6);
      g.add(backGlass);

      // Curved Glass Canopy Roof
      const roof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 2.2), glassShelterMat);
      roof.position.set(0, 3.1, 0.2);
      roof.rotation.x = 0.08;
      g.add(roof);

      // Wood Slat Passenger Bench
      const bench = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 0.6), woodBenchMat);
      bench.position.set(0, 0.65, -0.2);
      g.add(bench);

      // Backlit Illuminated Transit Ad Poster
      const adTex = this.createBillboardTexture("METRO TRANSIT", "Line 1 Rapid Express", "TRANSIT", "#38bdf8", "#fde047", "🚊");
      const adPoster = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.0), new THREE.MeshBasicMaterial({ map: adTex }));
      adPoster.position.set(1.6, 1.6, 0.2);
      adPoster.rotation.y = Math.PI / 2;
      g.add(adPoster);

      this.scene.add(g);
      this.collision.addBox(x, z, 4.4, 2.4, "bus_stop_shelter");
    };

    // Bus stops spaced along safe sidewalk spans (jauh dari jembatan dan persimpangan)
    createBusStop(11.8, -44, -Math.PI / 2);
    createBusStop(-11.8, -44, Math.PI / 2);
    createBusStop(11.8, 36, -Math.PI / 2);
    createBusStop(-11.8, 36, Math.PI / 2);
    createBusStop(36, 11.8, 0);
    createBusStop(-36, -11.8, Math.PI);

    // BUILDER D: URBAN FIRE HYDRANTS
    const createFireHydrant = (x, z) => {
      const g = new THREE.Group();
      g.position.set(x, 0.15, z);

      // Red barrel body
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.9, 10), hydrantMat);
      barrel.position.y = 0.45;
      barrel.castShadow = true;
      g.add(barrel);

      // Brass dome top
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), brassMat);
      dome.position.y = 0.9;
      g.add(dome);

      // Dual side nozzles
      [-0.22, 0.22].forEach(nx => {
        const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.18, 8), brassMat);
        nozzle.rotation.z = Math.PI / 2;
        nozzle.position.set(nx, 0.52, 0);
        g.add(nozzle);
      });

      this.scene.add(g);
    };

    const hydrantCoords = [
      [11.5, -66], [-11.5, -66],
      [11.5, 66], [-11.5, 66],
      [66, 11.5], [-66, 11.5],
      [66, -11.5], [-66, -11.5]
    ];
    hydrantCoords.forEach(([hx, hz]) => createFireHydrant(hx, hz));

    // BUILDER E: STAINLESS STEEL PEDESTRIAN BOLLARDS
    const createBollard = (x, z) => {
      const g = new THREE.Group();
      g.position.set(x, 0.15, z);

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.85, 10), metalDark);
      post.position.y = 0.42;
      g.add(post);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), metalDark);
      cap.position.y = 0.85;
      g.add(cap);

      // Yellow reflective collar ring
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.08, 10), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      ring.position.y = 0.72;
      g.add(ring);

      this.scene.add(g);
    };

    const bollardCoords = [
      [10.5, -18], [-10.5, -18], [10.5, 18], [-10.5, 18],
      [18, 10.5], [18, -10.5], [-18, 10.5], [-18, -10.5],
      [10.5, -72], [-10.5, -72], [10.5, 72], [-10.5, 72],
      [72, 10.5], [72, -10.5], [-72, 10.5], [-72, -10.5]
    ];
    bollardCoords.forEach(([bx, bz]) => createBollard(bx, bz));
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
      this.collision.addBox(x, z, 2.0, 4.0, "parked_" + type);
    };

    // Dedicated Parking Lot 1: POS Kasir Shopping Plaza (Set back from driveway spur Z: -35)
    const lot1 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 22), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
    lot1.position.set(90, 0.05, -52);
    lot1.receiveShadow = true;
    this.scene.add(lot1);

    createCar(88, -46, Math.PI / 2, "vanWhite");
    createCar(88, -52, Math.PI / 2, "taxi");
    createCar(88, -58, Math.PI / 2, "sedanBlue");

    // Dedicated Parking Lot 2: PoRoRo Gelato Cafe (Set back from driveway spur Z: -105)
    const lot2 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 22), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
    lot2.position.set(-90, 0.05, -122);
    lot2.receiveShadow = true;
    this.scene.add(lot2);

    createCar(-88, -116, Math.PI / 2, "taxi");
    createCar(-88, -122, Math.PI / 2, "sportsRed");
    createCar(-88, -128, Math.PI / 2, "sedanSilver");

    // Dedicated Parking Lot 3: Developer HQ Courtyard (Set back from driveway spur Z: 105)
    const lot3 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 22), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
    lot3.position.set(90, 0.05, 122);
    lot3.receiveShadow = true;
    this.scene.add(lot3);

    createCar(88, 116, Math.PI / 2, "sedanBlue");
    createCar(88, 122, Math.PI / 2, "sportsRed");
    createCar(88, 128, Math.PI / 2, "sedanSilver");
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
    // Placed strictly in mid-block zones (never within 12m of any cross street, bridge, or driveway spur)
    const lampCoords = [
      // North Main Avenue
      [11.5, -44], [-11.5, -44],
      [11.5, -120], [-11.5, -120],
      // South Main Avenue
      [11.5, 36], [-11.5, 36],
      [11.5, 120], [-11.5, 120],
      // East Boulevard
      [36, 11.5], [36, -11.5],
      [120, 11.5], [120, -11.5],
      // West Boulevard
      [-36, 11.5], [-36, -11.5],
      [-120, 11.5], [-120, -11.5]
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

    // Sidewalk Trees: alternating with lamps on safe mid-block stretches (100% clear of all intersections!)
    const treeCoords = [
      // North Main Avenue
      [11.5, -56], [-11.5, -56],
      [11.5, -94], [-11.5, -94],
      [11.5, -128], [-11.5, -128],
      // South Main Avenue
      [11.5, 52], [-11.5, 52],
      [11.5, 94], [-11.5, 94],
      [11.5, 128], [-11.5, 128],
      // East Boulevard
      [52, 11.5], [52, -11.5],
      [94, 11.5], [94, -11.5],
      [128, 11.5], [128, -11.5],
      // West Boulevard
      [-52, 11.5], [-52, -11.5],
      [-94, 11.5], [-94, -11.5],
      [-128, 11.5], [-128, -11.5]
    ];
    treeCoords.forEach(([x, z]) => createSidewalkTree(x, z));
  }

  // 8. ROTATING WIND TURBINES ON OUTER HILLS
  buildWindTurbines() {
    const turbinePositions = [
      [228, -135],
      [-228, -135],
      [228, 135],
      [-228, 135]
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
