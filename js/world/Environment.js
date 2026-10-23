/**
 * ENVIRONMENT & WORLD PROPS
 * Membangun landasan dunia, jalan beraspal/berpetak yang menghubungkan seluruh area,
 * pagar batas perimeter, pepohonan low-poly, tiang lampu jalan, awan bergerak,
 * dan marka jalan penunjuk arah.
 */

import { CONFIG } from "../core/Config.js";

export class Environment {
  constructor(scene, collisionSystem) {
    this.scene = scene;
    this.collision = collisionSystem;
    this.clouds = [];

    this.buildTerrain();
    this.buildRoadNetwork();
    this.buildPerimeterFence();
    this.buildVegetation();
    this.buildStreetLamps();
    this.buildClouds();
  }

  buildTerrain() {
    // 1. Main Stylized Ground Plane
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

    // Subtle Grid Texture / Decorative Pattern
    const gridHelper = new THREE.GridHelper(CONFIG.WORLD.WIDTH - 20, 36, 0x10b981, 0xbbf7d0);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);
  }

  buildRoadNetwork() {
    // Material Jalan Aspal Stylized
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Dark slate asphalt
      roughness: 0.85
    });

    const curbMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.6
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
      const lineCount = Math.floor(length / 6);
      const lineGeo = new THREE.PlaneGeometry(0.3, 2.5);
      lineGeo.rotateX(-Math.PI / 2);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xfde047 }); // Yellow stripe

      for (let i = 0; i < lineCount; i++) {
        const line = new THREE.Mesh(lineGeo, lineMat);
        const offsetZ = -length / 2 + (i + 0.5) * 6;
        line.position.set(0, 0.03, offsetZ);
        road.add(line);
      }
    };

    // Central roundabout at spawn
    const circleGeo = new THREE.RingGeometry(0, 14, 32);
    circleGeo.rotateX(-Math.PI / 2);
    const roundAbout = new THREE.Mesh(circleGeo, roadMat);
    roundAbout.position.set(0, 0.02, 0);
    roundAbout.receiveShadow = true;
    this.scene.add(roundAbout);

    // Main Boulevards:
    // 1. Road North to Journey Zone (Z -75)
    createRoadSegment(0, -42, 10, 65, 0);

    // 2. Road East to Apexsions & Kasir (X +80)
    createRoadSegment(45, 0, 10, 75, Math.PI / 2);

    // 3. Road West to Skills Lab & PoRoRo (X -80)
    createRoadSegment(-45, 0, 10, 75, Math.PI / 2);

    // 4. Road South to About & Contact (Z +80)
    createRoadSegment(0, 45, 10, 75, 0);

    // Outer Circuit Connecting Districts
    createRoadSegment(75, -50, 8, 90, 0);
    createRoadSegment(-75, -50, 8, 90, 0);
    createRoadSegment(75, 50, 8, 90, 0);
    createRoadSegment(-75, 50, 8, 90, 0);
    createRoadSegment(0, -95, 8, 160, Math.PI / 2);
    createRoadSegment(0, 95, 8, 160, Math.PI / 2);
  }

  buildPerimeterFence() {
    const half = (CONFIG.WORLD.WIDTH / 2) - CONFIG.WORLD.BOUND_PADDING;
    const fenceMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Futuristic electric blue barrier
      metalness: 0.6,
      roughness: 0.2
    });

    const barrierGeo = new THREE.BoxGeometry(CONFIG.WORLD.WIDTH - 20, 1.8, 0.8);

    // North Fence
    const fNorth = new THREE.Mesh(barrierGeo, fenceMat);
    fNorth.position.set(0, 0.9, -half);
    fNorth.castShadow = true;
    this.scene.add(fNorth);
    this.collision.addBox(0, -half, CONFIG.WORLD.WIDTH - 20, 1.5, "fence_north");

    // South Fence
    const fSouth = new THREE.Mesh(barrierGeo, fenceMat);
    fSouth.position.set(0, 0.9, half);
    fSouth.castShadow = true;
    this.scene.add(fSouth);
    this.collision.addBox(0, half, CONFIG.WORLD.WIDTH - 20, 1.5, "fence_south");

    // East Fence
    const sideGeo = new THREE.BoxGeometry(0.8, 1.8, CONFIG.WORLD.DEPTH - 20);
    const fEast = new THREE.Mesh(sideGeo, fenceMat);
    fEast.position.set(half, 0.9, 0);
    fEast.castShadow = true;
    this.scene.add(fEast);
    this.collision.addBox(half, 0, 1.5, CONFIG.WORLD.DEPTH - 20, "fence_east");

    // West Fence
    const fWest = new THREE.Mesh(sideGeo, fenceMat);
    fWest.position.set(-half, 0.9, 0);
    fWest.castShadow = true;
    this.scene.add(fWest);
    this.collision.addBox(-half, 0, 1.5, CONFIG.WORLD.DEPTH - 20, "fence_west");
  }

  buildVegetation() {
    // Stylized low-poly pine & oak trees
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });

    const createTree = (x, z, scale = 1.0) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.45 * scale, 2.2 * scale, 6);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.1 * scale;
      trunk.castShadow = true;
      tree.add(trunk);

      // 3 Tier Cones
      const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2.0 * scale, 2.2 * scale, 7), foliageMat);
      cone1.position.y = 2.4 * scale;
      cone1.castShadow = true;
      tree.add(cone1);

      const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.6 * scale, 1.9 * scale, 7), foliageMat2);
      cone2.position.y = 3.6 * scale;
      cone2.castShadow = true;
      tree.add(cone2);

      const cone3 = new THREE.Mesh(new THREE.ConeGeometry(1.1 * scale, 1.5 * scale, 7), foliageMat);
      cone3.position.y = 4.6 * scale;
      cone3.castShadow = true;
      tree.add(cone3);

      this.scene.add(tree);
      this.collision.addCircle(x, z, 1.2 * scale, "tree");
    };

    // Plant trees along road borders and scenic groves
    const treePositions = [
      [-22, -25], [22, -25], [-22, 25], [22, 25],
      [-38, -60], [38, -60], [-38, 60], [38, 60],
      [-110, -35], [-125, -20], [-110, 45], [-125, 60],
      [110, -35], [125, -20], [110, 45], [125, 60],
      [-50, -110], [50, -110], [-50, 110], [50, 110],
      [-95, -95], [95, -95], [-95, 95], [95, 95]
    ];

    treePositions.forEach(([x, z]) => {
      const scale = 0.85 + Math.random() * 0.4;
      createTree(x, z, scale);
    });
  }

  buildStreetLamps() {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const createLamp = (x, z) => {
      const lamp = new THREE.Group();
      lamp.position.set(x, 0, z);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 4.2, 8), poleMat);
      pole.position.y = 2.1;
      pole.castShadow = true;
      lamp.add(pole);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), lampGlowMat);
      head.position.y = 4.3;
      lamp.add(head);

      const pointLight = new THREE.PointLight(0xfef08a, 0.6, 18, 1.5);
      pointLight.position.y = 4.3;
      lamp.add(pointLight);

      this.scene.add(lamp);
      this.collision.addCircle(x, z, 0.8, "lamp_post");
    };

    const lampPositions = [
      [-15, -15], [15, -15], [-15, 15], [15, 15],
      [-8, -55], [8, -55], [-8, 55], [8, 55],
      [-55, -8], [-55, 8], [55, -8], [55, 8]
    ];

    lampPositions.forEach(([x, z]) => createLamp(x, z));
  }

  buildClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      transparent: true,
      opacity: 0.85
    });

    for (let i = 0; i < 16; i++) {
      const cloud = new THREE.Group();
      const numBlobs = 4 + Math.floor(Math.random() * 4);

      for (let b = 0; b < numBlobs; b++) {
        const radius = 3.5 + Math.random() * 3.0;
        const blob = new THREE.Mesh(new THREE.SphereGeometry(radius, 7, 7), cloudMat);
        blob.position.set(
          (b - numBlobs / 2) * 3.8 + (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 3
        );
        cloud.add(blob);
      }

      cloud.position.set(
        (Math.random() - 0.5) * CONFIG.WORLD.WIDTH,
        32 + Math.random() * 15,
        (Math.random() - 0.5) * CONFIG.WORLD.DEPTH
      );

      this.scene.add(cloud);
      this.clouds.push({
        group: cloud,
        speed: 1.2 + Math.random() * 1.8
      });
    }
  }

  update(deltaTime) {
    // Drifting clouds animation
    const halfWidth = CONFIG.WORLD.WIDTH / 2;
    for (const c of this.clouds) {
      c.group.position.x += c.speed * deltaTime;
      if (c.group.position.x > halfWidth + 40) {
        c.group.position.x = -halfWidth - 40;
      }
    }
  }
}
