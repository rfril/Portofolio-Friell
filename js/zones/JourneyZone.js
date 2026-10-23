/**
 * AREA 2: MY JOURNEY (PROMENADE & OUTDOOR MUSEUM)
 * Terletak rapi di komplek barat laut (Mid-West Block: X: -105, Z: -35),
 * terpisah 35m dari jalan raya sehingga jalan raya Utara-Selatan 100% BERSIH.
 * Menampilkan paviliun taman linimasa dengan 5 monumen kristal era perjalanan karir:
 * - Era Pandemi COVID-19 (2020-2021): Eksplorasi Minecraft
 * - Eksplorasi Addon Bedrock (2021-2022): Belajar Otodidak
 * - Server Minecraft Java (2023): Setup Server & Eksplorasi Plugin
 * - Modifikasi Plugin (2023-2025): Membedah Logika Program
 * - Pengembangan Mandiri (Pertengahan 2026): Suite Plugin Java 21
 */

import { BaseZone } from "./BaseZone.js";
import { journeyTimeline } from "../data/journeyData.js";

export class JourneyZone extends BaseZone {
  constructor(scene, collisionSystem) {
    // Diposisikan rapi di blok barat (X: -105, Z: -35), jauh dari badan jalan
    super("journey", "My Journey Promenade", "Chronological Timeline", new THREE.Vector3(-105, 0, -35), 15.0, scene, collisionSystem);
    this.monuments = [];
    this.buildMuseumPlaza();
  }

  buildMuseumPlaza() {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const lawnMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.9 });
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });

    // 1. Paved Museum Plaza Base (38 x 26m)
    const plazaBase = new THREE.Mesh(new THREE.BoxGeometry(38, 0.2, 26), stoneMat);
    plazaBase.position.y = 0.1;
    plazaBase.receiveShadow = true;
    this.mesh.add(plazaBase);

    // Green grass border
    const lawnBorder = new THREE.Mesh(new THREE.BoxGeometry(42, 0.1, 30), lawnMat);
    lawnBorder.position.y = 0.05;
    this.mesh.add(lawnBorder);

    // 2. 5 Chronological Timeline Pedestals along the plaza walkway
    const colors = [0x38bdf8, 0xa855f7, 0xf59e0b, 0x10b981, 0xf43f5e];
    const offsets = [
      { x: -14, z: 0 },
      { x: -7,  z: 0 },
      { x: 0,   z: 0 },
      { x: 7,   z: 0 },
      { x: 14,  z: 0 }
    ];

    offsets.forEach((offset, idx) => {
      const group = new THREE.Group();
      group.position.set(offset.x, 0.2, offset.z);

      // Base pedestal
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.7, 1.2, 8), pillarMat);
      base.position.y = 0.6;
      base.castShadow = true;
      group.add(base);

      // Era Monument
      const gemGeo = idx === 0 
        ? new THREE.BoxGeometry(1.2, 1.2, 1.2) // Voxel Box
        : idx === 1
        ? new THREE.OctahedronGeometry(0.85) // Bedrock Node
        : idx === 2
        ? new THREE.CylinderGeometry(0.7, 0.7, 1.4, 6) // Java Server
        : idx === 3
        ? new THREE.TorusGeometry(0.7, 0.25, 8, 16) // Mod Ring
        : new THREE.IcosahedronGeometry(1.0); // 2026 Core

      const gemMat = new THREE.MeshStandardMaterial({
        color: colors[idx],
        emissive: colors[idx],
        emissiveIntensity: 1.2,
        metalness: 0.5,
        roughness: 0.15
      });

      const gem = new THREE.Mesh(gemGeo, gemMat);
      gem.position.y = 2.4;
      gem.castShadow = true;
      group.add(gem);

      this.monuments.push(gem);
      this.mesh.add(group);
      this.collision.addCircle(this.position.x + offset.x, this.position.z + offset.z, 1.8, `journey_monument_${idx}`);
    });

    // 3. Promenade Benches & Lampposts inside the plaza
    const bench1 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.5, 0.8), woodMat);
    bench1.position.set(-8, 0.45, 8);
    this.mesh.add(bench1);

    const bench2 = bench1.clone();
    bench2.position.x = 8;
    this.mesh.add(bench2);

    // Plaza boundary collision (Keeps car inside plaza grounds or guided around)
    this.collision.addBox(this.position.x, this.position.z - 13, 38, 1.0, "journey_north_edge");
  }

  update(time, deltaTime) {
    super.update(time, deltaTime);
    this.monuments.forEach((mon, idx) => {
      mon.rotation.y = time * 0.8 + idx * 0.5;
      mon.position.y = 2.4 + Math.sin(time * 2.5 + idx) * 0.2;
    });
  }
}
