/**
 * ENVIRONMENT & METROPOLIS CITY ARCHITECTURE
 * Skala Metropolitan 720m x 720m:
 * - Superblocks perkotaan: lajur lurus panjang (100m-130m) bebas hambatan
 * - Kepadatan tinggi (95+ gedung beragam arsitektur di blok kota + 52 skyline cakrawala)
 * - Kanal air di Z = -62 yang bersih dari seluruh zona portofolio
 * - Lampu Merah 3D Interaktif (Traffic Light Gantries) dengan siklus lampu Hijau -> Kuning -> Merah
 * - Variasi gedung otentik:
 *     * Gedung Segitiga Flatiron di percabangan South Broadway
 *     * Metro Bistro & Cafe dengan teras luar (outdoor dining patio), meja bundar, payung bergaris, & neon
 *     * Minimarket 24 Jam (24/7 Convenience Store) berfasia neon 3-garis, etalase kaca, ATM & vending machine
 *     * SPBU & EV Fast-Charging Station dengan kanopi drive-through, 4 pulau charger, & totem harga 10m
 *     * Metropolis Grand Cinema & Theater dengan kanopi marquee, poster film menyala, & blade neon
 *     * Hotel Mewah Bintang 5 dengan kanopi porte-cochère drop-off karpet merah & sky lounge
 *     * Kompleks Gedung Berbentuk L (L-Shaped Courtyard Complex) dengan taman dalam
 *     * Showroom Mobil Mewah berdinding kaca ganda dengan supercar di panggung putar
 *     * Menara Times Square dengan LED billboard raksasa & ticker vertikal
 * - Seluruh 8 zona portofolio terlindungi rapi tanpa tumpang tindih
 */

import { CONFIG } from "../core/Config.js";

export class Environment {
  constructor(scene, collisionSystem) {
    this.scene = scene;
    this.collision = collisionSystem;
    this.clouds = [];
    this.windTurbines = [];
    this.trafficLightSets = [];

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

      const padX = 14;
      const padY = 16;
      const winW = (canvas.width - padX * (cols + 1)) / cols;
      const winH = (canvas.height - padY * (rows + 1)) / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const wx = padX + c * (winW + padX);
          const wy = padY + r * (winH + padY);
          const rand = Math.random();

          if (rand < 0.55) {
            ctx.fillStyle = litColorHex;
            ctx.shadowColor = litColorHex;
            ctx.shadowBlur = 6;
          } else if (rand < 0.72) {
            ctx.fillStyle = secondaryLit;
            ctx.shadowColor = secondaryLit;
            ctx.shadowBlur = 4;
          } else {
            ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
            ctx.shadowBlur = 0;
          }

          ctx.fillRect(wx, wy, winW, winH);
        }
      }

      return new THREE.CanvasTexture(canvas);
    };

    // Helper Helipad Circular Target Texture
    this.createHelipadTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, 256, 256);

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(128, 128, 105, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, 216, 216);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 130px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("H", 128, 128);

      return new THREE.CanvasTexture(canvas);
    };

    // Helper Billboard Texture Generator
    this.createBillboardTexture = (title, subtitle, tag = "METROPOLIS", accentColor = "#38bdf8", glowColor = "#60a5fa", icon = "⚡") => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#090d16");
      grad.addColorStop(0.5, "#0f172a");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.lineWidth = 2;
      const grid = 32;
      for (let x = 0; x < canvas.width; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 10;
      ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

      ctx.fillStyle = accentColor;
      const tagW = 240;
      const tagH = 44;
      ctx.fillRect(40, 40, tagW, tagH);

      ctx.fillStyle = "#020617";
      ctx.font = "900 22px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tag.toUpperCase(), 40 + tagW / 2, 40 + tagH / 2);

      ctx.font = "72px sans-serif";
      ctx.fillText(icon, canvas.width - 90, 80);

      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 24;
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 64px 'Segoe UI', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(title, 48, 220);

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 32px 'Segoe UI', sans-serif";
      ctx.fillText(subtitle, 48, 280);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(48, 330);
      ctx.lineTo(canvas.width - 48, 330);
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 26px monospace";
      ctx.fillText("● LIVE FEED • 60 FPS • INTERACTIVE 3D METROPOLIS", 48, 400);

      return new THREE.CanvasTexture(canvas);
    };

    // Helper Vertical Ticker Screen Texture (Times Square Style)
    this.createVerticalTickerTexture = (lines = ["METROPOLIS LIVE", "DEV STUDIO", "CLEAN ARCHITECTURE"], primaryColor = "#38bdf8", secondaryColor = "#f59e0b") => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

      const itemH = canvas.height / lines.length;
      lines.forEach((line, i) => {
        const cy = i * itemH + itemH / 2;

        ctx.fillStyle = i % 2 === 0 ? primaryColor : secondaryColor;
        ctx.fillRect(16, i * itemH + 12, canvas.width - 32, itemH - 24);

        ctx.fillStyle = "#020617";
        ctx.font = "900 24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(line, canvas.width / 2, cy);
      });

      return new THREE.CanvasTexture(canvas);
    };

    // Helper Green Enamel Street Name Sign
    this.createStreetNameTexture = (name) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#15803d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(name.toUpperCase(), canvas.width / 2, canvas.height / 2);

      return new THREE.CanvasTexture(canvas);
    };

    // Helper Convenience Store 3-Stripe Fascia
    this.createConvenienceFasciaTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#16a34a";
      ctx.fillRect(0, 0, canvas.width, 42);
      ctx.fillStyle = "#ea580c";
      ctx.fillRect(0, 42, canvas.width, 44);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 86, canvas.width, 42);

      ctx.fillStyle = "#0f172a";
      ctx.font = "900 40px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("24/7 EXPRESS MART", canvas.width / 2, 64);

      return new THREE.CanvasTexture(canvas);
    };

    // Helper Gas & EV Price Totem Texture
    this.createGasPriceTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "900 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("METRO ENERGY", canvas.width / 2, 60);

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(20, 90, canvas.width - 40, 110);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 20px sans-serif";
      ctx.fillText("OCTANE 98", canvas.width / 2, 120);
      ctx.fillStyle = "#ef4444";
      ctx.font = "900 48px monospace";
      ctx.fillText("$1.85", canvas.width / 2, 175);

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(20, 220, canvas.width - 40, 110);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 20px sans-serif";
      ctx.fillText("EV ULTRA 350kW", canvas.width / 2, 250);
      ctx.fillStyle = "#06b6d4";
      ctx.font = "900 48px monospace";
      ctx.fillText("$0.35", canvas.width / 2, 305);

      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText("● OPEN 24 HOURS", canvas.width / 2, 390);

      return new THREE.CanvasTexture(canvas);
    };

    // Helper Cinema Movie Poster
    this.createCinemaPosterTexture = (title, genre, color = "#ec4899") => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 384;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

      ctx.fillStyle = color;
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(genre.toUpperCase(), canvas.width / 2, 60);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 28px sans-serif";
      ctx.fillText(title, canvas.width / 2, 180);

      ctx.fillStyle = "#facc15";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("★★★★★ NOW SHOWING", canvas.width / 2, 320);

      return new THREE.CanvasTexture(canvas);
    };

    this.initMetropolis();
  }

  initMetropolis() {
    this.buildTerrain();
    this.buildWaterCanalAndBridges();
    this.buildRoadNetwork();
    this.buildTrafficLightSystem();
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


  // 1. TERRAIN (720m x 720m)
  buildTerrain() {
    const groundGeo = new THREE.PlaneGeometry(CONFIG.WORLD.WIDTH, CONFIG.WORLD.DEPTH, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      roughness: 0.9,
      metalness: 0.05
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    ground.position.y = -0.05;
    this.scene.add(ground);
  }

  // 2. WATER CANAL AT Z = -62 (BEBAS TOTAL DARI ZONA KASIR, JOURNEY, APEXSIONS, & PORORO!)
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

    // Water channel at Z = -62 across city width (Z: -67 to -57, lebar 10m)
    const canalGeo = new THREE.PlaneGeometry(CONFIG.WORLD.WIDTH - 40, 10);
    canalGeo.rotateX(-Math.PI / 2);
    const canal = new THREE.Mesh(canalGeo, waterMat);
    canal.position.set(0, -0.015, -62);
    this.scene.add(canal);

    // Stone riverbanks (North Z: -67, South Z: -57)
    [-67, -57].forEach(bz => {
      const bankGeo = new THREE.BoxGeometry(CONFIG.WORLD.WIDTH - 40, 0.15, 0.6);
      const bank = new THREE.Mesh(bankGeo, stoneMat);
      bank.position.set(0, 0.05, bz);
      bank.receiveShadow = true;
      this.scene.add(bank);
    });

    // Dedicated Bridges at Z = -62 (Z: -67 to -57)
    const createBridge = (x, width, name) => {
      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.set(x, 0, -62);

      const deckBase = new THREE.Mesh(new THREE.BoxGeometry(width + 0.8, 0.45, 10.2), stoneMat);
      deckBase.position.y = -0.22;
      deckBase.receiveShadow = true;
      deckBase.castShadow = true;
      bridgeGroup.add(deckBase);

      const roadDeck = new THREE.Mesh(new THREE.PlaneGeometry(width, 10), asphaltMat);
      roadDeck.rotateX(-Math.PI / 2);
      roadDeck.position.y = 0.02;
      roadDeck.receiveShadow = true;
      bridgeGroup.add(roadDeck);

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
      this.collision.addBox(x - width / 2 - railW / 2, -62, railW + 0.2, 10.2, `${name}_rail_l`);
      this.collision.addBox(x + width / 2 + railW / 2, -62, railW + 0.2, 10.2, `${name}_rail_r`);
    };

    createBridge(0, 16, "bridge_main_ave");        // Main Avenue Bridge
    createBridge(75, 12, "bridge_east_sec");       // East Secondary Bridge
    createBridge(-75, 12, "bridge_west_sec");      // West Secondary Bridge
    createBridge(270, 14, "bridge_outer_east");    // East Parkway Bridge
    createBridge(-270, 14, "bridge_outer_west");   // West Parkway Bridge
  }


  // 3. ROAD NETWORK & SUPERBLOCK ACCELERATION CORRIDORS
  buildRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });

    // HELPER 1: SEAMLESS SIGNALIZED JUNCTION
    const createJunction = (x, z, widthX, widthZ) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const junctionGeo = new THREE.PlaneGeometry(widthX, widthZ);
      junctionGeo.rotateX(-Math.PI / 2);
      const junction = new THREE.Mesh(junctionGeo, roadMat);
      junction.position.y = 0.02;
      junction.receiveShadow = true;
      g.add(junction);

      const curbW = 3.5;
      const curbH = 0.15;
      const curbGeo = new THREE.BoxGeometry(curbW, curbH, curbW);

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

      createZebraStrip(0, -widthZ / 2 - 1.8, widthX, false);
      createZebraStrip(0, widthZ / 2 + 1.8, widthX, false);
      createZebraStrip(-widthX / 2 - 1.8, 0, widthZ, true);
      createZebraStrip(widthX / 2 + 1.8, 0, widthZ, true);

      this.scene.add(g);
    };

    // HELPER 2: INDEPENDENT ROAD SEGMENT
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

      const roadGeo = new THREE.PlaneGeometry(width, length);
      roadGeo.rotateX(-Math.PI / 2);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.y = 0.02;
      road.receiveShadow = true;
      segGroup.add(road);

      const lineSpacing = 8.0;
      const margin = 4.0;
      const usableLength = length - margin * 2;
      if (usableLength > 6) {
        const lineCount = Math.floor(usableLength / lineSpacing);
        const lineGeo = new THREE.PlaneGeometry(0.35, 3.4);
        lineGeo.rotateX(-Math.PI / 2);

        for (let i = 0; i < lineCount; i++) {
          const line = new THREE.Mesh(lineGeo, yellowMat);
          line.position.set(0, 0.025, -usableLength / 2 + (i + 0.5) * lineSpacing);
          segGroup.add(line);
        }
      }

      const edgeGeo = new THREE.PlaneGeometry(0.22, length);
      edgeGeo.rotateX(-Math.PI / 2);

      const edgeL = new THREE.Mesh(edgeGeo, whiteMat);
      edgeL.position.set(-width / 2 + 0.35, 0.024, 0);
      segGroup.add(edgeL);

      const edgeR = edgeL.clone();
      edgeR.position.x = width / 2 - 0.35;
      segGroup.add(edgeR);

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
    // HELPER 3: SEAMLESS CURVED ROAD BEND (SWEEPING HIGHWAY & CRESCENT TURNS)
    // =========================================================================
    const createCurvedRoad = (centerX, centerZ, radius, width, startAngle, angleLength) => {
      const innerR = radius - width / 2;
      const outerR = radius + width / 2;
      const segments = Math.max(24, Math.floor(Math.abs(angleLength) * radius / 3));

      // Asphalt Road Surface
      const roadGeo = new THREE.RingGeometry(innerR, outerR, segments, 1, startAngle, angleLength);
      roadGeo.rotateX(-Math.PI / 2);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(centerX, 0.02, centerZ);
      road.receiveShadow = true;
      this.scene.add(road);

      // White Continuous Edge Lines
      const edgeInGeo = new THREE.RingGeometry(innerR + 0.25, innerR + 0.47, segments, 1, startAngle, angleLength);
      edgeInGeo.rotateX(-Math.PI / 2);
      const edgeIn = new THREE.Mesh(edgeInGeo, whiteMat);
      edgeIn.position.set(centerX, 0.024, centerZ);
      this.scene.add(edgeIn);

      const edgeOutGeo = new THREE.RingGeometry(outerR - 0.47, outerR - 0.25, segments, 1, startAngle, angleLength);
      edgeOutGeo.rotateX(-Math.PI / 2);
      const edgeOut = new THREE.Mesh(edgeOutGeo, whiteMat);
      edgeOut.position.set(centerX, 0.024, centerZ);
      this.scene.add(edgeOut);

      // Yellow Dashed Center Divider Line
      const arcLength = Math.abs(angleLength) * radius;
      const dashSpacing = 8.0;
      const numDashes = Math.max(1, Math.floor(arcLength / dashSpacing));
      const yellowGeo = new THREE.PlaneGeometry(0.35, 3.2);
      yellowGeo.rotateX(-Math.PI / 2);

      for (let i = 0; i < numDashes; i++) {
        const t = (i + 0.5) / numDashes;
        const angle = startAngle + t * angleLength;
        const dx = radius * Math.cos(angle);
        const dz = -radius * Math.sin(angle);

        const dash = new THREE.Mesh(yellowGeo, yellowMat);
        dash.position.set(centerX + dx, 0.025, centerZ + dz);
        dash.rotation.y = angle + Math.PI;
        this.scene.add(dash);
      }

      // Granite Sidewalk Curbs
      const walkW = 3.5;
      const walkInGeo = new THREE.RingGeometry(innerR - walkW, innerR, segments, 1, startAngle, angleLength);
      walkInGeo.rotateX(-Math.PI / 2);
      const walkIn = new THREE.Mesh(walkInGeo, curbMat);
      walkIn.position.set(centerX, 0.08, centerZ);
      walkIn.receiveShadow = true;
      this.scene.add(walkIn);

      const walkOutGeo = new THREE.RingGeometry(outerR, outerR + walkW, segments, 1, startAngle, angleLength);
      walkOutGeo.rotateX(-Math.PI / 2);
      const walkOut = new THREE.Mesh(walkOutGeo, curbMat);
      walkOut.position.set(centerX, 0.08, centerZ);
      walkOut.receiveShadow = true;
      this.scene.add(walkOut);
    };

    // 1. CENTRAL ROUNDABOUT (0, 0)
    const roundAboutGeo = new THREE.RingGeometry(0, 16, 36);
    roundAboutGeo.rotateX(-Math.PI / 2);
    const roundAbout = new THREE.Mesh(roundAboutGeo, roadMat);
    roundAbout.position.set(0, 0.02, 0);
    roundAbout.receiveShadow = true;
    this.scene.add(roundAbout);

    const plazaRingGeo = new THREE.RingGeometry(4.5, 5.8, 32);
    plazaRingGeo.rotateX(-Math.PI / 2);
    const plazaRing = new THREE.Mesh(plazaRingGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 }));
    plazaRing.position.set(0, 0.025, 0);
    this.scene.add(plazaRing);

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

    // 2. PRIMARY SIGNALIZED HUBS (SUPERBLOCK JUNCTIONS)
    createJunction(0, -140, 16, 14);   // North Central Hub
    createJunction(0, 140, 16, 14);    // South Central Hub
    createJunction(140, 0, 14, 16);    // East Central Hub
    createJunction(-140, 0, 14, 16);   // West Central Hub

    createJunction(75, -140, 12, 14);  // East Secondary x North Connector
    createJunction(-75, -140, 12, 14); // West Secondary x North Connector
    createJunction(75, 140, 12, 14);   // East Secondary x South Connector
    createJunction(-75, 140, 12, 14);  // West Secondary x South Connector

    // Outer Parkway Junctions (X = +-270, Z = +-270)
    createJunction(0, -270, 16, 14);
    createJunction(0, 270, 16, 14);
    createJunction(270, 0, 14, 16);
    createJunction(-270, 0, 14, 16);

    // 4 Outer Parkway High-Speed Corners diganti dengan 40m Sweeping Curves di bawah

    createJunction(75, -270, 12, 14);
    createJunction(-75, -270, 12, 14);
    createJunction(75, 270, 12, 14);
    createJunction(-75, 270, 12, 14);

    // 3. UNBROKEN SUPERBLOCK STRAIGHTAWAYS
    // Main North-South Avenue (X = 0, Width = 16m)
    createRoadSegment(0, -16, 0, -57, 16);     // Roundabout to Canal Bridge South
    // Canal Bridge at Z: -67 to -57
    createRoadSegment(0, -67, 0, -133, 16);    // Bridge to North Hub
    createRoadSegment(0, -147, 0, -263, 16);   // North Hub to Outer Parkway
    createRoadSegment(0, -277, 0, -338, 16);   // North Stub

    createRoadSegment(0, 16, 0, 133, 16);      // Roundabout to South Hub (117m stretch!)
    createRoadSegment(0, 147, 0, 263, 16);     // South Hub to Outer Parkway (116m stretch!)
    createRoadSegment(0, 277, 0, 338, 16);     // South Stub

    // Main East-West Boulevard (Z = 0, Width = 16m)
    createRoadSegment(16, 0, 133, 0, 16);      // Roundabout to East Hub (117m stretch!)
    createRoadSegment(147, 0, 263, 0, 16);     // East Hub to Outer Parkway (116m stretch!)
    createRoadSegment(277, 0, 338, 0, 16);     // East Stub

    createRoadSegment(-16, 0, -133, 0, 16);    // Roundabout to West Hub (117m stretch!)
    createRoadSegment(-147, 0, -263, 0, 16);   // West Hub to Outer Parkway (116m stretch!)
    createRoadSegment(-277, 0, -338, 0, 16);   // West Stub

    // East Secondary Corridor (X = 75, Width = 12m)
    createRoadSegment(75, 0, 75, -57, 12);     // To Canal Bridge South
    // Canal Bridge at Z: -67 to -57
    createRoadSegment(75, -67, 75, -133, 12);
    createRoadSegment(75, -147, 75, -263, 12);
    createRoadSegment(75, 0, 75, 133, 12);
    createRoadSegment(75, 147, 75, 263, 12);

    // West Secondary Corridor (X = -75, Width = 12m)
    createRoadSegment(-75, 0, -75, -57, 12);    // To Canal Bridge South
    // Canal Bridge at Z: -67 to -57
    createRoadSegment(-75, -67, -75, -133, 12);
    createRoadSegment(-75, -147, -75, -263, 12);
    createRoadSegment(-75, 0, -75, 133, 12);
    createRoadSegment(-75, 147, -75, 263, 12);

    // Cross Connectors (Z = +-140, Width = 14m)
    createRoadSegment(-263, -140, -147, -140, 14);
    createRoadSegment(-133, -140, -81, -140, 14);
    createRoadSegment(-69, -140, -8, -140, 14);
    createRoadSegment(8, -140, 69, -140, 14);
    createRoadSegment(81, -140, 133, -140, 14);
    createRoadSegment(147, -140, 263, -140, 14);

    createRoadSegment(-263, 140, -147, 140, 14);
    createRoadSegment(-133, 140, -81, 140, 14);
    createRoadSegment(-69, 140, -8, 140, 14);
    createRoadSegment(8, 140, 69, 140, 14);
    createRoadSegment(81, 140, 133, 140, 14);
    createRoadSegment(147, 140, 263, 140, 14);

    // 4. GRAND PARKSIDE CRESCENT (JALUR LENGKUNG HALUS RADIUS 85m)
    // Menghubungkan East Boulevard (85, 0) ke South Main Ave (0, 85) dengan tikungan mulus memeluk Central Commons Park!
    // Bebas dari sudut patah 90 derajat & bebas dari jalan silang janggal.
    createCurvedRoad(85, 85, 85, 12, Math.PI / 2, Math.PI / 2);

    // 5. OUTER GRAND PARKWAY CIRCUIT DENGAN 4 TIKUNGAN HALUS SWEEPING (RADIUS 40m)
    // Menghubungkan North, South, East, West Parkway tanpa tabrakan sudut 90 derajat tajam!
    // Corner 1: North-East (230, -230)
    createCurvedRoad(230, -230, 40, 14, 0, Math.PI / 2);
    // Corner 2: North-West (-230, -230)
    createCurvedRoad(-230, -230, 40, 14, Math.PI / 2, Math.PI / 2);
    // Corner 3: South-West (-230, 230)
    createCurvedRoad(-230, 230, 40, 14, Math.PI, Math.PI / 2);
    // Corner 4: South-East (230, 230)
    createCurvedRoad(230, 230, 40, 14, 3 * Math.PI / 2, Math.PI / 2);

    // Straight Parkway Segments (Menyambung presisi ke ujung lengkungan +-230m):
    // North Parkway (Z = -270)
    createRoadSegment(-230, -270, -8, -270, 14);
    createRoadSegment(8, -270, 230, -270, 14);

    // South Parkway (Z = 270)
    createRoadSegment(-230, 270, -8, 270, 14);
    createRoadSegment(8, 270, 230, 270, 14);

    // East Parkway (X = 270)
    createRoadSegment(270, -230, 270, -67, 14);
    // Bridge at Z: -67 to -57
    createRoadSegment(270, -57, 270, -8, 14);
    createRoadSegment(270, 8, 270, 230, 14);

    // West Parkway (X = -270)
    createRoadSegment(-270, -230, -270, -67, 14);
    // Bridge at Z: -67 to -57
    createRoadSegment(-270, -57, -270, -8, 14);
    createRoadSegment(-270, 8, -270, 230, 14);

    // 6. OFF-ROAD SPURS MENUJU 7 ZONA PORTOFOLIO (BERSIH DARI JALUR UTAMA)
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

    createSpur(75, -105, 92, -105);  // Spur into Apexsions Fortress
    createSpur(75, -35, 92, -35);    // Spur into POS Kasir Plaza
    createSpur(75, 105, 92, 105);    // Spur into Developer HQ
    createSpur(-75, -105, -92, -105);// Spur into PoRoRo Gelato
    createSpur(-75, -35, -92, -35);  // Spur into Journey Promenade
    createSpur(-75, 35, -92, 35);    // Spur into Skills Lab
    createSpur(-75, 105, -92, 105);  // Spur into Contact Relay
  }


    // 4. DYNAMIC 3D TRAFFIC LIGHT GANTRIES (ORIENTATION-PERFECT OVER EACH APPROACH)
  buildTrafficLightSystem() {
    const metalDark = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
    const housingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });

    const createApproachTrafficGantry = ({
      roadType,   // "NS" or "EW"
      roadCenter, // Center of road (X for NS, Z for EW)
      roadWidth,  // Width of road
      stopPos,    // Position along road (Z for NS, X for EW)
      facingDir,  // "-Z" (North), "+Z" (South), "-X" (West), "+X" (East)
      streetName, // Text on sign
      phaseGroup  // "A" or "B"
    }) => {
      const g = new THREE.Group();
      const mastH = 6.8;

      const buildHead = (posX, posY, posZ, dir) => {
        const headGroup = new THREE.Group();
        headGroup.position.set(posX, posY, posZ);

        const isNS = (dir === "-Z" || dir === "+Z");
        const boxGeo = isNS
          ? new THREE.BoxGeometry(0.65, 1.85, 0.45)
          : new THREE.BoxGeometry(0.45, 1.85, 0.65);
        const box = new THREE.Mesh(boxGeo, housingMat);
        headGroup.add(box);

        const redMat = new THREE.MeshStandardMaterial({ color: 0x330505, emissive: 0xef4444, emissiveIntensity: 0.05, roughness: 0.2 });
        const yellowMat = new THREE.MeshStandardMaterial({ color: 0x332505, emissive: 0xf59e0b, emissiveIntensity: 0.05, roughness: 0.2 });
        const greenMat = new THREE.MeshStandardMaterial({ color: 0x053315, emissive: 0x10b981, emissiveIntensity: 0.05, roughness: 0.2 });

        const lensGeo = new THREE.SphereGeometry(0.16, 12, 12);
        const lensOffset = 0.24;
        let lX = 0, lZ = 0;
        let rotY = 0;

        if (dir === "-Z") {
          lZ = -lensOffset;
          rotY = Math.PI;
        } else if (dir === "+Z") {
          lZ = lensOffset;
          rotY = 0;
        } else if (dir === "-X") {
          lX = -lensOffset;
          rotY = -Math.PI / 2;
        } else if (dir === "+X") {
          lX = lensOffset;
          rotY = Math.PI / 2;
        }

        const redLens = new THREE.Mesh(lensGeo, redMat);
        redLens.position.set(lX, 0.55, lZ);
        headGroup.add(redLens);

        const yellowLens = new THREE.Mesh(lensGeo, yellowMat);
        yellowLens.position.set(lX, 0.0, lZ);
        headGroup.add(yellowLens);

        const greenLens = new THREE.Mesh(lensGeo, greenMat);
        greenLens.position.set(lX, -0.55, lZ);
        headGroup.add(greenLens);

        [-0.55, 0.0, 0.55].forEach(vy => {
          const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.25, 12, 1, true, 0, Math.PI), metalDark);
          visor.rotation.x = Math.PI / 2;
          visor.rotation.z = -rotY;
          visor.position.set(lX * 1.05, vy + 0.12, lZ * 1.05);
          headGroup.add(visor);
        });

        const light = new THREE.PointLight(0x10b981, 0.8, 12);
        light.position.set(lX * 2.5, 0, lZ * 2.5);
        headGroup.add(light);

        this.trafficLightSets.push({ redMat, yellowMat, greenMat, light, phase: phaseGroup });
        return headGroup;
      };

      if (roadType === "NS") {
        const isFacingNorth = (facingDir === "-Z");
        const mastX = isFacingNorth
          ? roadCenter + roadWidth / 2 + 1.2
          : roadCenter - roadWidth / 2 - 1.2;

        const armReachX = isFacingNorth
          ? roadCenter - roadWidth * 0.25
          : roadCenter + roadWidth * 0.25;

        const armLen = Math.abs(mastX - armReachX);
        const armMidX = (mastX + armReachX) / 2;

        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, mastH, 12), metalDark);
        mast.position.set(mastX, mastH / 2, stopPos);
        mast.castShadow = true;
        g.add(mast);

        const basePlate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), metalDark);
        basePlate.position.set(mastX, 0.15, stopPos);
        g.add(basePlate);

        const arm = new THREE.Mesh(new THREE.BoxGeometry(armLen, 0.35, 0.35), metalDark);
        arm.position.set(armMidX, 6.2, stopPos);
        arm.castShadow = true;
        g.add(arm);

        const signTex = this.createStreetNameTexture(streetName);
        const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshBasicMaterial({ map: signTex }));
        const signZ = isFacingNorth ? stopPos - 0.22 : stopPos + 0.22;
        signMesh.position.set(roadCenter, 7.0, signZ);
        if (isFacingNorth) signMesh.rotation.y = Math.PI;
        g.add(signMesh);

        const lane1X = isFacingNorth ? roadCenter + roadWidth * 0.25 : roadCenter - roadWidth * 0.25;
        const lane2X = isFacingNorth ? roadCenter - roadWidth * 0.1 : roadCenter + roadWidth * 0.1;
        g.add(buildHead(lane1X, 5.4, stopPos, facingDir));
        g.add(buildHead(lane2X, 5.4, stopPos, facingDir));

        this.scene.add(g);
        this.collision.addCircle(mastX, stopPos, 0.7, "traffic_mast");

      } else {
        const isFacingWest = (facingDir === "-X");
        const mastZ = isFacingWest
          ? roadCenter + roadWidth / 2 + 1.2
          : roadCenter - roadWidth / 2 - 1.2;

        const armReachZ = isFacingWest
          ? roadCenter - roadWidth * 0.25
          : roadCenter + roadWidth * 0.25;

        const armLen = Math.abs(mastZ - armReachZ);
        const armMidZ = (mastZ + armReachZ) / 2;

        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, mastH, 12), metalDark);
        mast.position.set(stopPos, mastH / 2, mastZ);
        mast.castShadow = true;
        g.add(mast);

        const basePlate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), metalDark);
        basePlate.position.set(stopPos, 0.15, mastZ);
        g.add(basePlate);

        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, armLen), metalDark);
        arm.position.set(stopPos, 6.2, armMidZ);
        arm.castShadow = true;
        g.add(arm);

        const signTex = this.createStreetNameTexture(streetName);
        const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshBasicMaterial({ map: signTex }));
        const signX = isFacingWest ? stopPos - 0.22 : stopPos + 0.22;
        signMesh.position.set(signX, 7.0, roadCenter);
        signMesh.rotation.y = isFacingWest ? -Math.PI / 2 : Math.PI / 2;
        g.add(signMesh);

        const lane1Z = isFacingWest ? roadCenter + roadWidth * 0.25 : roadCenter - roadWidth * 0.25;
        const lane2Z = isFacingWest ? roadCenter - roadWidth * 0.1 : roadCenter + roadWidth * 0.1;
        g.add(buildHead(stopPos, 5.4, lane1Z, facingDir));
        g.add(buildHead(stopPos, 5.4, lane2Z, facingDir));

        this.scene.add(g);
        this.collision.addCircle(stopPos, mastZ, 0.7, "traffic_mast");
      }
    };

    // 1. Central Roundabout (Radius 16m)
    createApproachTrafficGantry({ roadType: "NS", roadCenter: 0, roadWidth: 16, stopPos: -18, facingDir: "-Z", streetName: "CENTRAL ROUNDABOUT", phaseGroup: "A" });
    createApproachTrafficGantry({ roadType: "NS", roadCenter: 0, roadWidth: 16, stopPos: 18, facingDir: "+Z", streetName: "CENTRAL ROUNDABOUT", phaseGroup: "A" });
    createApproachTrafficGantry({ roadType: "EW", roadCenter: 0, roadWidth: 16, stopPos: 18, facingDir: "+X", streetName: "CENTRAL ROUNDABOUT", phaseGroup: "B" });
    createApproachTrafficGantry({ roadType: "EW", roadCenter: 0, roadWidth: 16, stopPos: -18, facingDir: "-X", streetName: "CENTRAL ROUNDABOUT", phaseGroup: "B" });

    // 2. North Central Hub (0, -140)
    createApproachTrafficGantry({ roadType: "NS", roadCenter: 0, roadWidth: 16, stopPos: -149, facingDir: "-Z", streetName: "MAIN AVE SOUTH", phaseGroup: "A" });
    createApproachTrafficGantry({ roadType: "NS", roadCenter: 0, roadWidth: 16, stopPos: -131, facingDir: "+Z", streetName: "MAIN AVE NORTH", phaseGroup: "A" });
    createApproachTrafficGantry({ roadType: "EW", roadCenter: -140, roadWidth: 14, stopPos: 10, facingDir: "+X", streetName: "METRO EXP WEST", phaseGroup: "B" });
    createApproachTrafficGantry({ roadType: "EW", roadCenter: -140, roadWidth: 14, stopPos: -10, facingDir: "-X", streetName: "METRO EXP EAST", phaseGroup: "B" });

    // 3. South Central Hub (0, 140)
    createApproachTrafficGantry({ roadType: "NS", roadCenter: 0, roadWidth: 16, stopPos: 131, facingDir: "-Z", streetName: "MAIN AVE SOUTH", phaseGroup: "A" });
    createApproachTrafficGantry({ roadType: "NS", roadCenter: 0, roadWidth: 16, stopPos: 149, facingDir: "+Z", streetName: "MAIN AVE NORTH", phaseGroup: "A" });
    createApproachTrafficGantry({ roadType: "EW", roadCenter: 140, roadWidth: 14, stopPos: 10, facingDir: "+X", streetName: "METRO EXP WEST", phaseGroup: "B" });
    createApproachTrafficGantry({ roadType: "EW", roadCenter: 140, roadWidth: 14, stopPos: -10, facingDir: "-X", streetName: "METRO EXP EAST", phaseGroup: "B" });

    // 4. East Central Hub (140, 0)
    createApproachTrafficGantry({ roadType: "NS", roadCenter: 140, roadWidth: 14, stopPos: -10, facingDir: "-Z", streetName: "COMMERCE SOUTH", phaseGroup: "A" });
    createApproachTrafficGantry({ roadType: "NS", roadCenter: 140, roadWidth: 14, stopPos: 10, facingDir: "+Z", streetName: "COMMERCE NORTH", phaseGroup: "A" });
    createApproachTrafficGantry({ roadType: "EW", roadCenter: 0, roadWidth: 16, stopPos: 131, facingDir: "-X", streetName: "CENTRAL BLVD EAST", phaseGroup: "B" });
    createApproachTrafficGantry({ roadType: "EW", roadCenter: 0, roadWidth: 16, stopPos: 149, facingDir: "+X", streetName: "CENTRAL BLVD WEST", phaseGroup: "B" });

    // 5. West Central Hub (-140, 0)
    createApproachTrafficGantry({ roadType: "NS", roadCenter: -140, roadWidth: 14, stopPos: -10, facingDir: "-Z", streetName: "TECH SOUTH", phaseGroup: "A" });
    createApproachTrafficGantry({ roadType: "NS", roadCenter: -140, roadWidth: 14, stopPos: 10, facingDir: "+Z", streetName: "TECH NORTH", phaseGroup: "A" });
    createApproachTrafficGantry({ roadType: "EW", roadCenter: 0, roadWidth: 16, stopPos: -131, facingDir: "+X", streetName: "CENTRAL BLVD WEST", phaseGroup: "B" });
    createApproachTrafficGantry({ roadType: "EW", roadCenter: 0, roadWidth: 16, stopPos: -149, facingDir: "-X", streetName: "CENTRAL BLVD EAST", phaseGroup: "B" });
  }

  updateTrafficLights(time) {
    if (!this.trafficLightSets || this.trafficLightSets.length === 0) return;

    const cycle = (time || performance.now() * 0.001) % 24.0;
    for (const tl of this.trafficLightSets) {
      let isRed = false;
      let isYellow = false;
      let isGreen = false;

      if (tl.phase === "A") {
        if (cycle < 9.5) {
          isGreen = true;
        } else if (cycle < 12.0) {
          isYellow = true;
        } else {
          isRed = true;
        }
      } else {
        if (cycle < 12.0) {
          isRed = true;
        } else if (cycle < 21.5) {
          isGreen = true;
        } else {
          isYellow = true;
        }
      }

      tl.redMat.emissiveIntensity = isRed ? 3.0 : 0.04;
      tl.yellowMat.emissiveIntensity = isYellow ? 3.0 : 0.04;
      tl.greenMat.emissiveIntensity = isGreen ? 3.0 : 0.04;

      if (tl.light) {
        if (isGreen) {
          tl.light.color.setHex(0x10b981);
          tl.light.intensity = 0.9;
        } else if (isYellow) {
          tl.light.color.setHex(0xf59e0b);
          tl.light.intensity = 0.9;
        } else {
          tl.light.color.setHex(0xef4444);
          tl.light.intensity = 0.9;
        }
      }
    }
  }


  // 5. CENTRAL CITY COMMONS PARK (SOUTH-EAST INNER BLOCK: X: 16-62, Z: 20-64)
  buildCentralCityPark() {
    const parkGroup = new THREE.Group();
    parkGroup.position.set(38, 0, 42);

    const grassMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 });
    const plazaPavingMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
    const stoneWallMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.8 });
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

    const lawn = new THREE.Mesh(new THREE.BoxGeometry(40, 0.3, 40), grassMat);
    lawn.position.y = 0.15;
    lawn.receiveShadow = true;
    parkGroup.add(lawn);

    const plazaRing = new THREE.Mesh(new THREE.CircleGeometry(9.0, 32), plazaPavingMat);
    plazaRing.rotateX(-Math.PI / 2);
    plazaRing.position.y = 0.31;
    plazaRing.receiveShadow = true;
    parkGroup.add(plazaRing);

    const basin = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 6.2, 1.2, 32), marbleMat);
    basin.position.y = 0.6;
    basin.castShadow = true;
    parkGroup.add(basin);

    const fWater = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.2, 32), waterMat);
    fWater.position.y = 1.1;
    parkGroup.add(fWater);

    const spireBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.0, 1.8, 16), marbleMat);
    spireBase.position.y = 1.8;
    parkGroup.add(spireBase);

    const upperTier = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 1.0, 0.4, 16), marbleMat);
    upperTier.position.y = 2.8;
    parkGroup.add(upperTier);

    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    finial.position.y = 3.4;
    parkGroup.add(finial);

    const parkTreeCoords = [
      [-14, -14], [14, -14], [-14, 14], [14, 14],
      [0, -14], [0, 14], [-14, 0], [14, 0]
    ];
    parkTreeCoords.forEach(([tx, tz]) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.8, 8), trunkMat);
      trunk.position.set(tx, 1.4, tz);
      trunk.castShadow = true;
      parkGroup.add(trunk);

      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.9, 1), foliageMat);
      crown.position.set(tx, 3.6, tz);
      crown.castShadow = true;
      parkGroup.add(crown);
    });

    this.scene.add(parkGroup);
    this.collision.addCircle(38, 42, 6.4, "central_fountain");
  }


  // 6. COMPREHENSIVE DENSE METROPOLITAN ARCHITECTURE (ZERO OVERLAPS)
  buildCitySkyscrapersAndBlocks() {
    const windowTexBlue = this.createWindowTexture("#0a1120", "#38bdf8", 14, 5, "#fef08a");
    const windowTexCyan = this.createWindowTexture("#0b1120", "#22d3ee", 14, 5, "#67e8f9");
    const windowTexGold = this.createWindowTexture("#0f172a", "#f59e0b", 12, 4, "#fef3c7");
    const windowTexEmerald = this.createWindowTexture("#06120e", "#34d399", 14, 4, "#a7f3d0");
    const windowTexDark = this.createWindowTexture("#020617", "#94a3b8", 12, 4, "#cbd5e1");

    const helipadTex = this.createHelipadTexture();
    const helipadMat = new THREE.MeshStandardMaterial({ map: helipadTex, roughness: 0.6 });

    // Billboard Textures (Soft Skills & Mindset)
    const bbSkillKomunikasi = this.createBillboardTexture("KOMUNIKASI EFEKTIF", "Menyampaikan Solusi & Arsitektur Teknis Secara Lugas", "COLLABORATION", "#38bdf8", "#60a5fa", "💬");
    const bbSkillTeamwork = this.createBillboardTexture("KERJA SAMA TIM", "Kolaborasi Aktif, Sinergi, & Saling Mendukung", "TEAMWORK", "#818cf8", "#38bdf8", "🤝");
    const bbSkillProblemSolving = this.createBillboardTexture("PROBLEM SOLVING", "Pendekatan Analitis Menemukan Solusi Efisien", "CRITICAL THINKING", "#f59e0b", "#ef4444", "💡");
    const bbSkillCleanCode = this.createBillboardTexture("KETELITIAN & DETAIL", "Membangun Kode Bersih, Terstruktur, & Teruji", "ENGINEERING", "#10b981", "#34d399", "✨");
    const bbSkillSelfLearning = this.createBillboardTexture("KEMAUAN BELAJAR", "Cepat Beradaptasi & Eksplorasi Teknologi Baru", "GROWTH", "#ec4899", "#f43f5e", "🚀");

    const bbCleanArch = this.createBillboardTexture("CLEAN CODE MANTRA", "Readable Code Is Better Than Clever Code", "DEV CULTURE", "#10b981", "#38bdf8", "📐");
    const bbCreativeCode = this.createBillboardTexture("CREATIVE TECH LAB", "Eksplorasi WebGL 3D, Grafika Interaktif, & Fisika", "INNOVATION", "#6366f1", "#38bdf8", "⚡");
    const bbEducation = this.createBillboardTexture("SMKN 71 JAKARTA", "Konsentrasi Rekayasa Perangkat Lunak (RPL)", "EDUCATION", "#38bdf8", "#fbbf24", "🎓");
    const bbDev = this.createBillboardTexture("PORTFOLIO DEVELOPER", "Rafriel Raditya Widodo • Game & Web Developer", "PROFILE", "#38bdf8", "#f43f5e", "🎮");
    const bbContact = this.createBillboardTexture("MARI BERDISKUSI", "rafriel.developer@gmail.com • GitHub: Rafriel", "CONNECT", "#06b6d4", "#a855f7", "✉️");

    const tickerCityFeed = this.createVerticalTickerTexture(["METROPOLIS LIVE", "WEATHER: 24°C CLEAR", "AIR QUALITY: GOOD", "DRIVE CAREFULLY"], "#38bdf8", "#10b981");
    const tickerDevTips = this.createVerticalTickerTexture(["DEV DAILY TIPS", "COMMIT OFTEN", "WRITE CLEAN LOGIC", "TEST THOROUGHLY"], "#f59e0b", "#38bdf8");
    const tickerValues = this.createVerticalTickerTexture(["CORE VALUES", "COMMUNICATION", "PROBLEM SOLVING", "TEAM COLLABORATION"], "#10b981", "#818cf8");

    // Materials
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
    const spireMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const lobbyGlassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.75 });
    const ledGoldAccentMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    // =========================================================================
    // BUILDER 1: TRIANGULAR FLATIRON WEDGE BUILDING (South Broadway Fork)
    // =========================================================================
    const createFlatironBuilding = (x, z, rotY, length = 32, width = 16, height = 58, name = "flatiron") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      const shape = new THREE.Shape();
      shape.moveTo(0, length / 2);
      shape.lineTo(width / 2, -length / 2);
      shape.lineTo(-width / 2, -length / 2);
      shape.closePath();

      const extrudeSettings = { depth: height, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.4, bevelThickness: 0.4 };
      const wedgeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      wedgeGeo.rotateX(Math.PI / 2);

      const wedgeMesh = new THREE.Mesh(wedgeGeo, matSandstone);
      wedgeMesh.position.y = height;
      wedgeMesh.castShadow = true;
      wedgeMesh.receiveShadow = true;
      g.add(wedgeMesh);

      const baseGeo = new THREE.ExtrudeGeometry(shape, { depth: 7.0, bevelEnabled: true, bevelSize: 0.6, bevelThickness: 0.5 });
      baseGeo.rotateX(Math.PI / 2);
      const baseMesh = new THREE.Mesh(baseGeo, matGraniteDark);
      baseMesh.position.y = 7.0;
      g.add(baseMesh);

      const lobby = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 4.0, 12), lobbyGlassMat);
      lobby.position.set(0, 2.0, length / 2 - 1.2);
      g.add(lobby);

      const roofCap = new THREE.Mesh(new THREE.BoxGeometry(width + 1.0, 1.2, length + 1.0), matCorporateWhite);
      roofCap.position.set(0, height + 0.6, 0);
      g.add(roofCap);

      const wtTank = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.5, 12), matBrick);
      wtTank.position.set(0, height + 3.0, -length * 0.25);
      g.add(wtTank);

      this.scene.add(g);
      this.collision.addBox(x, z, width, length * 0.8, name);
    };

    // =========================================================================
    // BUILDER 2: METRO BISTRO & CAFE WITH OUTDOOR PATIO
    // =========================================================================
    const createMetroBistro = (x, z, rotY, name = "metro_bistro") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      const body = new THREE.Mesh(new THREE.BoxGeometry(16, 9, 12), matBrick);
      body.position.y = 4.5;
      body.castShadow = true;
      g.add(body);

      const cornice = new THREE.Mesh(new THREE.BoxGeometry(16.6, 0.6, 12.6), matCorporateWhite);
      cornice.position.y = 9.3;
      g.add(cornice);

      const door = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.2, 0.3), lobbyGlassMat);
      door.position.set(0, 1.6, -6.15);
      g.add(door);

      const awningMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.6 });
      const awning = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.3, 2.4), awningMat);
      awning.position.set(0, 3.8, -7.2);
      awning.rotation.x = -0.2;
      g.add(awning);

      const signTex = this.createSignTexture("METRO BISTRO & CAFE", "#022c22", "#34d399", "FINE DINING & ESPRESSO");
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.6), new THREE.MeshBasicMaterial({ map: signTex }));
      signMesh.position.set(0, 5.8, -6.15);
      signMesh.rotation.y = Math.PI;
      g.add(signMesh);

      // Outdoor Dining Patio
      const patioPaving = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 8),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 })
      );
      patioPaving.rotateX(-Math.PI / 2);
      patioPaving.position.set(0, 0.03, -10.0);
      patioPaving.receiveShadow = true;
      g.add(patioPaving);

      [-7.8, 7.8].forEach(px => {
        const planter = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 7.8), matCharcoal);
        planter.position.set(px, 0.3, -10.0);
        g.add(planter);

        const bush = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 7.6), foliageMat);
        bush.position.set(px, 0.7, -10.0);
        g.add(bush);
      });

      const umbrellaColors = [0xef4444, 0x0284c7, 0xf59e0b, 0x10b981, 0x8b5cf6];
      const tableCoords = [
        [-5, -8.5], [0, -8.5], [5, -8.5],
        [-2.5, -11.5], [2.5, -11.5]
      ];

      tableCoords.forEach(([tx, tz], i) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8), matCharcoal);
        leg.position.set(tx, 0.5, tz);
        g.add(leg);

        const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 16), matCorporateWhite);
        tableTop.position.set(tx, 1.0, tz);
        g.add(tableTop);

        [-0.9, 0.9].forEach(cx => {
          const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.45), matCharcoal);
          chairSeat.position.set(tx + cx, 0.55, tz);
          g.add(chairSeat);

          const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.05), matCharcoal);
          chairBack.position.set(tx + cx, 0.8, tz + (cx > 0 ? 0.2 : -0.2));
          g.add(chairBack);
        });

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8), matCharcoal);
        pole.position.set(tx, 1.3, tz);
        g.add(pole);

        const uMat = new THREE.MeshStandardMaterial({ color: umbrellaColors[i % umbrellaColors.length], roughness: 0.5 });
        const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.6, 12), uMat);
        umbrella.position.set(tx, 2.6, tz);
        g.add(umbrella);
      });

      this.scene.add(g);
      this.collision.addBox(x, z, 16, 12, name);
    };

    // =========================================================================
    // BUILDER 3: 24/7 CONVENIENCE STORE (MINIMARKET)
    // =========================================================================
    const createConvenienceStore = (x, z, rotY, name = "convenience_store") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      const body = new THREE.Mesh(new THREE.BoxGeometry(18, 5.8, 12), matCorporateWhite);
      body.position.y = 2.9;
      body.castShadow = true;
      g.add(body);

      const fasciaTex = this.createConvenienceFasciaTexture();
      const fasciaMesh = new THREE.Mesh(new THREE.PlaneGeometry(17.8, 1.4), new THREE.MeshBasicMaterial({ map: fasciaTex }));
      fasciaMesh.position.set(0, 5.0, -6.06);
      fasciaMesh.rotation.y = Math.PI;
      g.add(fasciaMesh);

      const glassFront = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.6), lobbyGlassMat);
      glassFront.position.set(0, 2.0, -6.05);
      glassFront.rotation.y = Math.PI;
      g.add(glassFront);

      [-6.5, -4.8].forEach((vx, idx) => {
        const vmMat = new THREE.MeshStandardMaterial({ color: idx === 0 ? 0xef4444 : 0x0284c7, metalness: 0.6 });
        const vm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.8), vmMat);
        vm.position.set(vx, 1.1, -6.6);
        g.add(vm);
      });

      const atm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.7), matCharcoal);
      atm.position.set(5.5, 1.1, -6.5);
      g.add(atm);

      this.scene.add(g);
      this.collision.addBox(x, z, 18, 12, name);
    };

    // =========================================================================
    // BUILDER 4: URBAN GAS & EV ULTRA-FAST CHARGING STATION
    // =========================================================================
    const createGasAndEVStation = (x, z, rotY, name = "gas_ev_station") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      const apron = new THREE.Mesh(
        new THREE.PlaneGeometry(28, 22),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 })
      );
      apron.rotateX(-Math.PI / 2);
      apron.position.y = 0.022;
      apron.receiveShadow = true;
      g.add(apron);

      const canopy = new THREE.Mesh(new THREE.BoxGeometry(24, 0.8, 14), matCorporateWhite);
      canopy.position.set(0, 5.8, 0);
      canopy.castShadow = true;
      g.add(canopy);

      const ledTrim = new THREE.Mesh(new THREE.BoxGeometry(24.2, 0.15, 14.2), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
      ledTrim.position.set(0, 5.8, 0);
      g.add(ledTrim);

      [-8, 8].forEach(px => {
        [-4, 4].forEach(pz => {
          const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5.8, 12), matCharcoal);
          pillar.position.set(px, 2.9, pz);
          pillar.castShadow = true;
          g.add(pillar);
        });
      });

      [-6, 6].forEach(ix => {
        [-3.5, 3.5].forEach(iz => {
          const curb = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.25, 1.2), matGraniteDark);
          curb.position.set(ix, 0.12, iz);
          g.add(curb);

          const pump = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.7), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5 }));
          pump.position.set(ix - 1.2, 1.25, iz);
          g.add(pump);

          const evPylon = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.4, 0.6), matCharcoal);
          evPylon.position.set(ix + 1.2, 1.35, iz);
          g.add(evPylon);

          const evRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 16), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
          evRing.position.set(ix + 1.2, 2.0, iz + 0.32);
          g.add(evRing);
        });
      });

      const totemTex = this.createGasPriceTexture();
      const totemPylon = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 5.2), new THREE.MeshBasicMaterial({ map: totemTex }));
      totemPylon.position.set(-12, 5.0, 10);
      g.add(totemPylon);

      const kiosk = new THREE.Mesh(new THREE.BoxGeometry(8, 3.8, 6), matCorporateWhite);
      kiosk.position.set(0, 1.9, -9);
      g.add(kiosk);

      this.scene.add(g);
      this.collision.addBox(x, z, 24, 18, name);
    };

    // =========================================================================
    // BUILDER 5: METROPOLIS GRAND CINEMA & THEATER
    // =========================================================================
    const createCityCinema = (x, z, rotY, name = "city_cinema") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      const body = new THREE.Mesh(new THREE.BoxGeometry(22, 24, 20), matGraniteDark);
      body.position.y = 12;
      body.castShadow = true;
      g.add(body);

      const marquee = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, 5.0), matCorporateWhite);
      marquee.position.set(0, 6.5, 11);
      g.add(marquee);

      const rim = new THREE.Mesh(new THREE.BoxGeometry(18.4, 0.3, 5.2), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
      rim.position.set(0, 6.5, 11);
      g.add(rim);

      const p1Tex = this.createCinemaPosterTexture("CYBER 2026", "SCI-FI ACTION", "#38bdf8");
      const p2Tex = this.createCinemaPosterTexture("SPEED DRIVE", "RACING THRILLER", "#f59e0b");
      const p3Tex = this.createCinemaPosterTexture("PIXEL NOIR", "MYSTERY CRIME", "#ec4899");

      const posters = [p1Tex, p2Tex, p3Tex];
      [-6, 0, 6].forEach((px, i) => {
        const poster = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 4.5), new THREE.MeshBasicMaterial({ map: posters[i] }));
        poster.position.set(px, 11, 10.15);
        g.add(poster);
      });

      const bladeSign = new THREE.Mesh(new THREE.BoxGeometry(1.6, 9.0, 0.8), matCharcoal);
      bladeSign.position.set(0, 28, 6.0);
      g.add(bladeSign);

      const neonTex = this.createSignTexture("C I N E M A", "#831843", "#f43f5e", "METROPOLIS");
      const neonMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 8.4), new THREE.MeshBasicMaterial({ map: neonTex }));
      neonMesh.position.set(0, 28, 6.45);
      g.add(neonMesh);

      this.scene.add(g);
      this.collision.addBox(x, z, 22, 20, name);
    };

    // =========================================================================
    // BUILDER 6: 5-STAR GRAND LUXURY HOTEL
    // =========================================================================
    const createGrandHotel = (x, z, rotY, name = "grand_hotel") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      const tower = new THREE.Mesh(new THREE.BoxGeometry(32, 68, 24), matGlassGold);
      tower.position.y = 34;
      tower.castShadow = true;
      g.add(tower);

      [-16, 16].forEach(wx => {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(3.2, 68, 24.4), matSandstone);
        wing.position.set(wx, 34, 0);
        g.add(wing);
      });

      const canopy = new THREE.Mesh(new THREE.BoxGeometry(18, 0.6, 10), matCorporateWhite);
      canopy.position.set(0, 5.2, 16);
      g.add(canopy);

      [-7.5, 7.5].forEach(px => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5.2, 12), matCharcoal);
        pillar.position.set(px, 2.6, 19.5);
        g.add(pillar);
      });

      const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 10), new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.9 }));
      carpet.rotateX(-Math.PI / 2);
      carpet.position.set(0, 0.03, 16);
      g.add(carpet);

      const skyLounge = new THREE.Mesh(new THREE.BoxGeometry(34, 5.0, 26), lobbyGlassMat);
      skyLounge.position.set(0, 68 + 2.5, 0);
      g.add(skyLounge);

      const signTex = this.createSignTexture("THE GRAND METROPOLIS", "#0f172a", "#f59e0b", "5-STAR LUXURY HOTEL");
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(16, 2.2), new THREE.MeshBasicMaterial({ map: signTex }));
      signMesh.position.set(0, 73, 13.1);
      g.add(signMesh);

      this.scene.add(g);
      this.collision.addBox(x, z, 32, 24, name);
    };

    // =========================================================================
    // BUILDER 7: L-SHAPED RESIDENTIAL & COMMERCIAL COURTYARD COMPLEX
    // =========================================================================
    const createLShapedComplex = (x, z, rotY, width = 30, depth = 30, height = 34, mat = matBrick, name = "l_complex") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      const wingThick = 12;
      const w1 = new THREE.Mesh(new THREE.BoxGeometry(width, height, wingThick), mat);
      w1.position.set(0, height / 2, -depth / 2 + wingThick / 2);
      w1.castShadow = true;
      g.add(w1);

      const w2Len = depth - wingThick;
      const w2 = new THREE.Mesh(new THREE.BoxGeometry(wingThick, height, w2Len), mat);
      w2.position.set(-width / 2 + wingThick / 2, height / 2, depth / 2 - w2Len / 2);
      w2.castShadow = true;
      g.add(w2);

      const cyW = width - wingThick;
      const cyD = depth - wingThick;
      const lawn = new THREE.Mesh(
        new THREE.PlaneGeometry(cyW, cyD),
        new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.9 })
      );
      lawn.rotateX(-Math.PI / 2);
      lawn.position.set(width / 2 - cyW / 2, 0.03, depth / 2 - cyD / 2);
      lawn.receiveShadow = true;
      g.add(lawn);

      const tree = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), foliageMat);
      tree.position.set(width / 2 - cyW / 2, 4.0, depth / 2 - cyD / 2);
      tree.castShadow = true;
      g.add(tree);

      this.scene.add(g);
      this.collision.addBox(x, z, width, depth, name);
    };

    // =========================================================================
    // BUILDER 8: TRANSPARENT GLASS AUTO SHOWROOM
    // =========================================================================
    const createAutoShowroom = (x, z, rotY, name = "auto_showroom") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      const roof = new THREE.Mesh(new THREE.BoxGeometry(22, 0.8, 16), matCharcoal);
      roof.position.y = 8.0;
      g.add(roof);

      const glassWall = new THREE.Mesh(new THREE.BoxGeometry(21.6, 7.6, 15.6), lobbyGlassMat);
      glassWall.position.y = 3.8;
      g.add(glassWall);

      const turntable = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.4, 0.35, 32), matGraniteDark);
      turntable.position.set(0, 0.18, 0);
      g.add(turntable);

      const carMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9, roughness: 0.1 });
      const carBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 4.4), carMat);
      carBody.position.set(0, 0.65, 0);
      g.add(carBody);

      const signTex = this.createSignTexture("METRO EXOTIC SHOWROOM", "#020617", "#38bdf8", "SUPERCARS & HYPERCARS");
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.8), new THREE.MeshBasicMaterial({ map: signTex }));
      signMesh.position.set(0, 9.2, 8.05);
      g.add(signMesh);

      this.scene.add(g);
      this.collision.addBox(x, z, 22, 16, name);
    };

    // =========================================================================
    // BUILDER 9: TIMES SQUARE CYBER-SKYSCRAPER WITH LED SCREENS
    // =========================================================================
    const createTimesSquareTower = (x, z, width, depth, height, mat, name, opts = {}) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const podiumH = Math.min(18, height * 0.25);
      const podium = new THREE.Mesh(new THREE.BoxGeometry(width, podiumH, depth), matCorporateWhite);
      podium.position.y = podiumH / 2;
      podium.castShadow = true;
      g.add(podium);

      const shaftH = height - podiumH - 4;
      const shaftW = width * 0.85;
      const shaftD = depth * 0.85;
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(shaftW, shaftH, shaftD), mat);
      shaft.position.y = podiumH + shaftH / 2;
      shaft.castShadow = true;
      g.add(shaft);

      if (opts.mainBillboard) {
        const bbW = width * 0.9;
        const bbH = bbW * 0.52;
        const mainScreen = new THREE.Mesh(new THREE.PlaneGeometry(bbW, bbH), new THREE.MeshBasicMaterial({ map: opts.mainBillboard }));
        mainScreen.position.set(0, podiumH + bbH / 2 + 1, depth / 2 + 0.15);
        if (opts.billboardSide === "N") {
          mainScreen.position.z = -depth / 2 - 0.15;
          mainScreen.rotation.y = Math.PI;
        }
        g.add(mainScreen);
      }

      if (opts.verticalTicker) {
        const vtW = 3.6;
        const vtH = 14.0;
        const vertScreen = new THREE.Mesh(new THREE.PlaneGeometry(vtW, vtH), new THREE.MeshBasicMaterial({ map: opts.verticalTicker }));
        vertScreen.position.set(width * 0.38, podiumH + vtH / 2 + 1, depth / 2 + 0.18);
        if (opts.billboardSide === "N") {
          vertScreen.position.z = -depth / 2 - 0.18;
          vertScreen.rotation.y = Math.PI;
        }
        g.add(vertScreen);
      }

      this.scene.add(g);
      this.collision.addBox(x, z, width, depth, name);
    };

    // =========================================================================
    // BUILDER 10: MULTI-TIER SUPER SKYSCRAPER
    // =========================================================================
    const createSuperSkyscraper = (x, z, width, depth, height, mat, name, opts = {}) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const podiumH = Math.min(12, height * 0.2);
      const podium = new THREE.Mesh(new THREE.BoxGeometry(width, podiumH, depth), matCorporateWhite);
      podium.position.y = podiumH / 2;
      podium.castShadow = true;
      g.add(podium);

      const shaft1H = (height - podiumH) * 0.6;
      const shaft1W = width * 0.85;
      const shaft1D = depth * 0.85;
      const shaft1 = new THREE.Mesh(new THREE.BoxGeometry(shaft1W, shaft1H, shaft1D), mat);
      shaft1.position.y = podiumH + shaft1H / 2;
      shaft1.castShadow = true;
      g.add(shaft1);

      const shaft2H = (height - podiumH) * 0.4;
      const shaft2W = shaft1W * 0.8;
      const shaft2D = shaft1D * 0.8;
      const shaft2 = new THREE.Mesh(new THREE.BoxGeometry(shaft2W, shaft2H, shaft2D), mat);
      shaft2.position.y = podiumH + shaft1H + shaft2H / 2;
      shaft2.castShadow = true;
      g.add(shaft2);

      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 12, 8), spireMat);
      spire.position.y = height + 6;
      g.add(spire);

      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), beaconMat);
      beacon.position.y = height + 12.2;
      g.add(beacon);

      this.scene.add(g);
      this.collision.addBox(x, z, width, depth, name);
    };

    // =========================================================================
    // BUILDER 11: DIAGRID STRUCTURAL LATTICE TOWER
    // =========================================================================
    const createDiagridTower = (x, z, width, depth, height, mat, name) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const shaft = new THREE.Mesh(new THREE.BoxGeometry(width, height - 8, depth), mat);
      shaft.position.y = (height - 8) / 2;
      shaft.castShadow = true;
      g.add(shaft);

      const crown = new THREE.Mesh(new THREE.ConeGeometry(width * 0.55, 8, 8), matCorporateWhite);
      crown.position.y = height - 4;
      g.add(crown);

      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 10, 8), spireMat);
      spire.position.y = height + 4;
      g.add(spire);

      this.scene.add(g);
      this.collision.addBox(x, z, width, depth, name);
    };

    // =========================================================================
    // BUILDER 12: ROTUNDA CYLINDRICAL GLASS SKYSCRAPER
    // =========================================================================
    const createCylinderSkyscraper = (x, z, radius, height, mat, name) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 24), mat);
      shaft.position.y = height / 2;
      shaft.castShadow = true;
      g.add(shaft);

      const helipad = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, 0.4, 24), helipadMat);
      helipad.position.y = height;
      g.add(helipad);

      this.scene.add(g);
      this.collision.addCircle(x, z, radius + 0.5, name);
    };

    // =========================================================================
    // BUILDER 13: CASCADING TERRACED ECO-TOWER
    // =========================================================================
    const createTerracedTower = (x, z, width, depth, height, mat, name) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const t1H = height * 0.45;
      const t1 = new THREE.Mesh(new THREE.BoxGeometry(width, t1H, depth), mat);
      t1.position.y = t1H / 2;
      t1.castShadow = true;
      g.add(t1);

      const t2H = height * 0.55;
      const t2W = width - 4;
      const t2D = depth - 4;
      const t2 = new THREE.Mesh(new THREE.BoxGeometry(t2W, t2H, t2D), mat);
      t2.position.set(2, t1H + t2H / 2, 0);
      t2.castShadow = true;
      g.add(t2);

      const garden = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, depth * 0.8), foliageMat);
      garden.position.set(-width / 2 + 1.8, t1H + 0.2, 0);
      g.add(garden);

      this.scene.add(g);
      this.collision.addBox(x, z, width, depth, name);
    };

    // =========================================================================
    // BUILDER 14: NYC BRICK LOFT WITH FIRE ESCAPES
    // =========================================================================
    const createLoftWithFireEscapes = (x, z, width, depth, height, mat = matBrick, name = "brick_loft") => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
      body.position.y = height / 2;
      body.castShadow = true;
      g.add(body);

      const floors = Math.floor(height / 5.0);
      for (let f = 1; f < floors; f++) {
        const fy = f * 5.0;
        const platform = new THREE.Mesh(new THREE.BoxGeometry(width * 0.45, 0.15, 1.2), matCharcoal);
        const px = (f % 2 === 0 ? -1 : 1) * (width * 0.2);
        platform.position.set(px, fy, depth / 2 + 0.65);
        g.add(platform);
      }

      this.scene.add(g);
      this.collision.addBox(x, z, width, depth, name);
    };

    // =========================================================================
    // BUILDER 15: HIGHWAY MONOLITH BILLBOARD (SET BACK SAFELY ON PLAZAS)
    // =========================================================================
    const createHighwayMonolithBillboard = (x, z, rotY, billboardTex, name) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 11, 8), matCharcoal);
      col.position.y = 5.5;
      col.castShadow = true;
      g.add(col);

      const bW = 11.0;
      const bH = 5.5;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.6, bH + 0.6, 0.6), matCharcoal);
      frame.position.set(0, 11 + bH / 2, 0);
      g.add(frame);

      const frontScreen = new THREE.Mesh(new THREE.PlaneGeometry(bW, bH), new THREE.MeshBasicMaterial({ map: billboardTex }));
      frontScreen.position.set(0, 11 + bH / 2, 0.32);
      g.add(frontScreen);

      const backScreen = new THREE.Mesh(new THREE.PlaneGeometry(bW, bH), new THREE.MeshBasicMaterial({ map: billboardTex }));
      backScreen.position.set(0, 11 + bH / 2, -0.32);
      backScreen.rotation.y = Math.PI;
      g.add(backScreen);

      this.scene.add(g);
      this.collision.addCircle(x, z, 1.2, name);
    };

    // =========================================================================
    // BUILDER 16: DISTANT SKYLINE TOWER
    // =========================================================================
    const createSkylineTower = (x, z, width, depth, height, mat) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
      body.position.y = height / 2;
      body.castShadow = true;
      g.add(body);

      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 12, 6), spireMat);
      spire.position.y = height + 6;
      g.add(spire);

      this.scene.add(g);
    };

    // =========================================================================
    // PLACEMENT: DENSE, BUSTLING, ZERO-OVERLAP METROPOLIS ARCHITECTURE
    // =========================================================================

    // DISTRICT 1: DOWNTOWN FINANCIAL CORE (North-East: X: 18 to 65, Z: -52 to -18)
    createTimesSquareTower(28, -36, 16, 16, 86, matGlassBlue, "ts_tower_ne", {
      mainBillboard: bbSkillKomunikasi,
      verticalTicker: tickerValues,
      billboardSide: "S"
    });
    createSuperSkyscraper(52, -36, 16, 16, 88, matGlassCyan, "skyscraper_ne_zenithar");
    createCylinderSkyscraper(52, -20, 7.5, 68, matGlassGold, "rotunda_ne_gateway");
    createLoftWithFireEscapes(28, -20, 14, 10, 28, matBrick, "loft_ne_waterfront");

    // DISTRICT 2: DOWNTOWN MEDIA & ARTS CORE (North-West: X: -65 to -18, Z: -52 to -18)
    createTimesSquareTower(-28, -36, 16, 16, 84, matGlassCyan, "ts_tower_nw", {
      mainBillboard: bbSkillProblemSolving,
      verticalTicker: tickerDevTips,
      billboardSide: "S"
    });
    createCityCinema(-52, -36, 0, "cinema_entertainment_quarter");
    createCylinderSkyscraper(-52, -20, 7.5, 64, matGlassDark, "rotunda_nw_techcenter");
    createLoftWithFireEscapes(-28, -20, 14, 10, 26, matSandstone, "loft_nw_studios");

    // DISTRICT 3: CENTRAL COMMONS & DINING PROMENADE (South-East: X: 18 to 65, Z: 18 to 65)
    createMetroBistro(38, 18, 0, "bistro_parkside_patio");
    createSuperSkyscraper(54, 38, 15, 15, 78, matGlassBlue, "skyscraper_se_parkview");
    createCylinderSkyscraper(54, 56, 7.5, 70, matGlassGold, "rotunda_se_parkside");

    // DISTRICT 4: WELCOME & LIFESTYLE DISTRICT (South-West: X: -65 to -18, Z: 18 to 65)
    createConvenienceStore(-50, 24, 0, "convenience_mart_west");
    createTimesSquareTower(-28, 52, 16, 16, 80, matGlassGold, "ts_tower_sw", {
      mainBillboard: bbSkillTeamwork,
      verticalTicker: tickerCityFeed,
      billboardSide: "N"
    });
    createLoftWithFireEscapes(-50, 52, 16, 12, 30, matBrick, "loft_sw_residences");

    // DISTRICT 5: NORTH UPTOWN WATERFRONT CORRIDOR (Z: -72 to -130)
    // East side of Main Ave
    createSuperSkyscraper(28, -85, 16, 16, 76, matGlassBlue, "skyscraper_nu_e1");
    createDiagridTower(52, -85, 16, 16, 84, matGlassCyan, "diagrid_nu_e2");
    createCylinderSkyscraper(28, -112, 7.5, 66, matGlassGold, "rotunda_nu_e3");
    createTerracedTower(52, -112, 16, 16, 68, matCorporateWhite, "terraced_nu_e4");
    // West side of Main Ave
    createDiagridTower(-28, -85, 16, 16, 80, matGlassGold, "diagrid_nu_w1");
    createSuperSkyscraper(-52, -85, 16, 16, 74, matGlassCyan, "skyscraper_nu_w2");
    createTerracedTower(-28, -112, 16, 16, 66, matCorporateWhite, "terraced_nu_w3");
    createCylinderSkyscraper(-52, -112, 7.5, 64, matGlassBlue, "rotunda_nu_w4");

    // DISTRICT 6: SOUTH METROPOLIS HIGH-RISE CORRIDOR (Z: 72 to 130)
    // East side of Main Ave
    createSuperSkyscraper(28, 85, 16, 16, 82, matGlassGold, "skyscraper_su_e1");
    createCylinderSkyscraper(52, 85, 7.5, 70, matGlassBlue, "rotunda_su_e2");
    createTerracedTower(28, 112, 16, 16, 68, matCorporateWhite, "terraced_su_e3");
    createSuperSkyscraper(52, 112, 16, 16, 72, matGlassEmerald, "skyscraper_su_e4");
    // West side of Main Ave
    createSuperSkyscraper(-28, 85, 16, 16, 78, matGlassBlue, "skyscraper_su_w1");
    createTerracedTower(-52, 85, 16, 16, 66, matCorporateWhite, "terraced_su_w2");
    createDiagridTower(-28, 112, 16, 16, 82, matGlassDark, "diagrid_su_w3");
    createSuperSkyscraper(-52, 112, 16, 16, 70, matGlassDark, "skyscraper_su_w4");

    // DISTRICT 7: SOUTH BROADWAY FORK & THE FLATIRON WEDGE BUILDING
    // Berdiri megah di percabangan antara Main Ave South dan South Broadway (X: 24, Z: 165)
    createFlatironBuilding(16, 96, -0.785, 30, 16, 58, "flatiron_crescent_prow");

    // DISTRICT 8: EAST MIDTOWN COMMERCIAL STRIP (X: 135 to 250, Z: -130 to 130)
    createTimesSquareTower(135, -35, 16, 16, 76, matGlassCyan, "ts_tower_em", {
      mainBillboard: bbSkillCleanCode,
      verticalTicker: tickerDevTips,
      billboardSide: "S"
    });
    createGrandHotel(175, 45, -Math.PI / 2, "hotel_grand_metropolis");
    createGasAndEVStation(175, -80, 0, "gas_ev_oasis_east");
    createAutoShowroom(175, -115, 0, "showroom_supercars");
    createDiagridTower(175, 95, 16, 16, 82, matGlassBlue, "diagrid_em_1");
    createSuperSkyscraper(215, 45, 18, 18, 86, matGlassGold, "skyscraper_em_2");
    createTerracedTower(215, -80, 18, 18, 70, matCorporateWhite, "terraced_em_3");
    createCylinderSkyscraper(215, -115, 8.0, 72, matGlassEmerald, "rotunda_em_4");
    createLShapedComplex(215, 95, 0, 30, 30, 36, matSandstone, "l_complex_se");

    // DISTRICT 9: WEST CREATIVE TECH STRIP (X: -250 to -135, Z: -130 to 130)
    createTimesSquareTower(-135, 35, 16, 16, 78, matGlassBlue, "ts_tower_wm", {
      mainBillboard: bbSkillSelfLearning,
      verticalTicker: tickerCityFeed,
      billboardSide: "N"
    });
    createLShapedComplex(-175, 75, 0, 30, 30, 36, matBrick, "l_complex_sw1");
    createLShapedComplex(-175, -75, Math.PI / 2, 30, 30, 36, matCharcoal, "l_complex_sw2");
    createSuperSkyscraper(-215, 0, 18, 18, 84, matGlassDark, "skyscraper_wm_1");
    createDiagridTower(-215, 75, 18, 18, 86, matGlassCyan, "diagrid_wm_2");
    createTerracedTower(-215, -75, 18, 18, 72, matCorporateWhite, "terraced_wm_3");
    createRotundaTower(-175, -115, 8.0, 68, matGlassBlue, "rotunda_wm_4");
    createLoftWithFireEscapes(-215, -115, 18, 14, 30, matBrick, "loft_wm_5");

    function createRotundaTower(x, z, r, h, m, n) {
      createCylinderSkyscraper(x, z, r, h, m, n);
    }

    // DISTRICT 10: FAR NORTH PARKWAY HIGH-RISE CORRIDOR (Z: -200)
    const northParkwayX = [-215, -165, -115, -65, -28, 28, 65, 115, 165, 215];
    northParkwayX.forEach((px, i) => {
      const h = 72 + (i % 4) * 8;
      const m = [matGlassBlue, matGlassCyan, matGlassGold, matGlassEmerald][i % 4];
      if (i % 3 === 0) {
        createDiagridTower(px, -200, 18, 18, h, m, `parkway_n_diag_${i}`);
      } else if (i % 3 === 1) {
        createCylinderSkyscraper(px, -200, 8.0, h, m, `parkway_n_rot_${i}`);
      } else {
        createSuperSkyscraper(px, -200, 18, 18, h, m, `parkway_n_sky_${i}`);
      }
    });

    // DISTRICT 11: FAR SOUTH PARKWAY HIGH-RISE CORRIDOR (Z: 200)
    const southParkwayX = [-215, -165, -115, -65, -28, 65, 115, 165, 215];
    southParkwayX.forEach((px, i) => {
      const h = 74 + (i % 4) * 7;
      const m = [matGlassGold, matGlassBlue, matGlassEmerald, matGlassCyan][i % 4];
      if (i % 2 === 0) {
        createSuperSkyscraper(px, 200, 18, 18, h, m, `parkway_s_sky_${i}`);
      } else {
        createTerracedTower(px, 200, 18, 18, h, matCorporateWhite, `parkway_s_ter_${i}`);
      }
    });

    // DISTRICT 12: HIGHWAY MONOLITH BILLBOARDS (SAFELY POSITIONED ON PLAZAS, NEVER IN LANES!)
    createHighwayMonolithBillboard(18, -95, 0, bbEducation, "monolith_bb_education");
    createHighwayMonolithBillboard(-18, 95, Math.PI, bbContact, "monolith_bb_contact");
    createHighwayMonolithBillboard(95, 18, Math.PI / 2, bbCleanArch, "monolith_bb_cleanarch");
    createHighwayMonolithBillboard(-95, -18, -Math.PI / 2, bbSkillProblemSolving, "monolith_bb_problem_solving");

    createHighwayMonolithBillboard(18, -185, 0, bbSkillKomunikasi, "monolith_bb_komunikasi");
    createHighwayMonolithBillboard(-18, 185, Math.PI, bbSkillTeamwork, "monolith_bb_teamwork");
    createHighwayMonolithBillboard(185, 18, Math.PI / 2, bbSkillCleanCode, "monolith_bb_cleancode");
    createHighwayMonolithBillboard(-185, -18, -Math.PI / 2, bbSkillSelfLearning, "monolith_bb_selflearning");

    // DISTRICT 13: 360-DEGREE PERIMETER SKYLINE PANORAMA (AT +-330m)
    const skylineMats = [matGlassBlue, matGlassCyan, matGlassGold, matGlassEmerald, matGlassDark];
    [-300, -250, -200, -150, -100, -50, 0, 50, 100, 150, 200, 250, 300].forEach((pos, i) => {
      const h1 = 60 + (i % 5) * 12 + Math.sin(i * 1.5) * 8;
      createSkylineTower(pos, -330, 20, 20, h1, skylineMats[i % skylineMats.length]);

      const h2 = 62 + ((i + 2) % 5) * 11 + Math.cos(i * 1.3) * 8;
      createSkylineTower(pos, 330, 20, 20, h2, skylineMats[(i + 1) % skylineMats.length]);

      const h3 = 58 + ((i + 1) % 5) * 12 + Math.sin(i * 1.7) * 8;
      createSkylineTower(330, pos, 20, 20, h3, skylineMats[(i + 2) % skylineMats.length]);

      const h4 = 60 + ((i + 3) % 5) * 10 + Math.cos(i * 1.9) * 8;
      createSkylineTower(-330, pos, 20, 20, h4, skylineMats[(i + 3) % skylineMats.length]);
    });
  }


  // 7. URBAN INFRASTRUCTURE & STREET FURNITURE
  buildUrbanInfrastructureAndStreetFurniture() {
    const metalDark = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
    const glassShelterMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, transparent: true, opacity: 0.65 });
    const woodBenchMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
    const hydrantMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.6, roughness: 0.3 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });

    const createHighwayGantry = (x, z, rotY, line1, line2) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      [-9.5, 9.5].forEach(mx => {
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 8.2, 8), metalDark);
        mast.position.set(mx, 4.1, 0);
        g.add(mast);
      });

      const truss = new THREE.Mesh(new THREE.BoxGeometry(19.5, 0.9, 0.9), metalDark);
      truss.position.set(0, 7.6, 0);
      g.add(truss);

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

    createHighwayGantry(0, -115, 0, "↑ DOWNTOWN CORE", "↗ APEXSIONS REALM");
    createHighwayGantry(0, 115, Math.PI, "↑ METROPOLIS SOUTH", "↖ DEV HQ & STUDIO");
    createHighwayGantry(115, 0, -Math.PI / 2, "↑ EAST RING EXP", "↗ POS KASIR STORE");
    createHighwayGantry(-115, 0, Math.PI / 2, "↑ WEST RING EXP", "↖ PORORO CAFE");

    const createBusStop = (x, z, rotY = 0) => {
      const g = new THREE.Group();
      g.position.set(x, 0.15, z);
      g.rotation.y = rotY;

      [-1.8, 1.8].forEach(px => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6), metalDark);
        post.position.set(px, 1.6, -0.6);
        g.add(post);
      });

      const backGlass = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 0.1), glassShelterMat);
      backGlass.position.set(0, 1.6, -0.6);
      g.add(backGlass);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 2.2), glassShelterMat);
      roof.position.set(0, 3.1, 0.2);
      g.add(roof);

      const bench = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 0.6), woodBenchMat);
      bench.position.set(0, 0.65, -0.2);
      g.add(bench);

      this.scene.add(g);
      this.collision.addBox(x, z, 4.4, 2.4, "bus_stop_shelter");
    };

    createBusStop(11.8, -44, -Math.PI / 2);
    createBusStop(-11.8, -44, Math.PI / 2);
    createBusStop(11.8, 36, -Math.PI / 2);
    createBusStop(-11.8, 36, Math.PI / 2);

    const createFireHydrant = (x, z) => {
      const g = new THREE.Group();
      g.position.set(x, 0.15, z);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.9, 10), hydrantMat);
      barrel.position.y = 0.45;
      barrel.castShadow = true;
      g.add(barrel);

      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), brassMat);
      dome.position.y = 0.9;
      g.add(dome);

      this.scene.add(g);
    };

    const hydrantCoords = [
      [11.5, -45], [-11.5, -45], [11.5, 45], [-11.5, 45],
      [45, 11.5], [-45, 11.5], [45, -11.5], [-45, -11.5]
    ];
    hydrantCoords.forEach(([hx, hz]) => createFireHydrant(hx, hz));
  }

  // 8. OFF-STREET PARKING LOTS (ADJACENT TO PLAZAS)
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

    // Dedicated Parking Lot 1: POS Kasir Shopping Plaza (Set back safely at Z: -15)
    const lot1 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 20), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
    lot1.position.set(90, 0.05, -16);
    lot1.receiveShadow = true;
    this.scene.add(lot1);

    createCar(88, -12, Math.PI / 2, "vanWhite");
    createCar(88, -16, Math.PI / 2, "taxi");
    createCar(88, -20, Math.PI / 2, "sedanBlue");

    // Dedicated Parking Lot 2: PoRoRo Gelato Cafe (Z: -125)
    const lot2 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 20), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
    lot2.position.set(-90, 0.05, -125);
    lot2.receiveShadow = true;
    this.scene.add(lot2);

    createCar(-88, -120, Math.PI / 2, "taxi");
    createCar(-88, -125, Math.PI / 2, "sportsRed");
    createCar(-88, -130, Math.PI / 2, "sedanSilver");

    // Dedicated Parking Lot 3: Developer HQ Courtyard (Z: 125)
    const lot3 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 20), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
    lot3.position.set(90, 0.05, 125);
    lot3.receiveShadow = true;
    this.scene.add(lot3);

    createCar(88, 120, Math.PI / 2, "sedanBlue");
    createCar(88, 125, Math.PI / 2, "sportsRed");
    createCar(88, 130, Math.PI / 2, "sedanSilver");
  }

  // 9. STREETLIGHTS & TREES ALIGNED NEATLY ON OUTER SIDEWALKS
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

    const lampCoords = [
      [11.5, -35], [-11.5, -35], [11.5, -100], [-11.5, -100],
      [11.5, 35], [-11.5, 35], [11.5, 100], [-11.5, 100],
      [35, 11.5], [35, -11.5], [100, 11.5], [100, -11.5],
      [-35, 11.5], [-35, -11.5], [-100, 11.5], [-100, -11.5]
    ];
    lampCoords.forEach(([x, z]) => createCleanLamp(x, z));

    const createSidewalkTree = (x, z) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0.15, z);

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
      [11.5, -48], [-11.5, -48], [11.5, -85], [-11.5, -85],
      [11.5, 48], [-11.5, 48], [11.5, 85], [-11.5, 85],
      [48, 11.5], [48, -11.5], [85, 11.5], [85, -11.5],
      [-48, 11.5], [-48, -11.5], [-85, 11.5], [-85, -11.5]
    ];
    treeCoords.forEach(([x, z]) => createSidewalkTree(x, z));
  }

  // 10. ROTATING WIND TURBINES ON OUTER HILLS
  buildWindTurbines() {
    const turbinePositions = [
      [310, -180],
      [-310, -180],
      [310, 180],
      [-310, 180]
    ];

    const towerMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });

    turbinePositions.forEach(([x, z]) => {
      const turbineGroup = new THREE.Group();
      turbineGroup.position.set(x, 0, z);

      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.8, 34, 10), towerMat);
      tower.position.y = 17;
      turbineGroup.add(tower);

      const nacelle = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 4.5), towerMat);
      nacelle.position.set(0, 34, 0);
      turbineGroup.add(nacelle);

      const hub = new THREE.Group();
      hub.position.set(0, 34, 2.4);

      const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.6, 10), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
      noseCone.rotation.x = Math.PI / 2;
      hub.add(noseCone);

      for (let b = 0; b < 3; b++) {
        const bladeArm = new THREE.Group();
        bladeArm.rotation.z = (b * Math.PI * 2) / 3;

        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.5, 13, 0.15), bladeMat);
        blade.position.y = 6.5;
        bladeArm.add(blade);

        hub.add(bladeArm);
      }

      turbineGroup.add(hub);
      this.scene.add(turbineGroup);
      this.collision.addCircle(x, z, 2.2, "wind_turbine_base");

      this.windTurbines.push({ hub, speed: 1.0 + Math.random() * 0.6 });
    });
  }

  // 11. EXPANDED PERIMETER FENCE SIZED FOR 720 x 720
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

  // 12. CLOUDS & SKY
  buildClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      transparent: true,
      opacity: 0.82
    });

    for (let i = 0; i < 36; i++) {
      const cloud = new THREE.Group();
      const numBlobs = 3 + Math.floor(Math.random() * 4);

      for (let b = 0; b < numBlobs; b++) {
        const radius = 6 + Math.random() * 8;
        const blobGeo = new THREE.DodecahedronGeometry(radius, 1);
        const blob = new THREE.Mesh(blobGeo, cloudMat);
        blob.position.set(
          (b - numBlobs / 2) * 6 + (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 4
        );
        cloud.add(blob);
      }

      cloud.position.set(
        (Math.random() - 0.5) * CONFIG.WORLD.WIDTH,
        75 + Math.random() * 35,
        (Math.random() - 0.5) * CONFIG.WORLD.DEPTH
      );

      this.scene.add(cloud);
      this.clouds.push({
        group: cloud,
        speed: 1.0 + Math.random() * 2.0
      });
    }
  }

  // 13. FRAME UPDATE
  update(time, deltaTime) {
    if (deltaTime === undefined) {
      deltaTime = time;
      time = performance.now() * 0.001;
    }

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

    this.updateTrafficLights(time);
  }
}
