/**
 * AREA 2: MY JOURNEY
 * Menampilkan kronologi perjalanan nyata dari pemain Minecraft hingga menjadi calon Game Developer:
 * - Era Pandemi COVID-19 (2020-2021)
 * - Eksplorasi Addon Bedrock & Otodidak (2021-2022)
 * - Server Minecraft Java (2023)
 * - Membedah Kode & Modifikasi Plugin (2023-2025)
 * - Pengembangan Mandiri Plugin Suite (Pertengahan 2026)
 */

import { BaseZone } from "./BaseZone.js";
import { journeyTimeline } from "../data/journeyData.js";

export class JourneyZone extends BaseZone {
  constructor(scene, collisionSystem) {
    super("journey", "My Journey Avenue", "Chronological Timeline", new THREE.Vector3(0, 0, -75), 14.0, scene, collisionSystem);
    this.monuments = [];
    this.buildTimelinePillars();
  }

  buildTimelinePillars() {
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2
    });

    const colors = [0x38bdf8, 0xa855f7, 0xf59e0b, 0x10b981, 0xf43f5e];

    // 5 Pedestals spaced along timeline
    const offsets = [
      { x: -16, z: -4 },
      { x: -8,  z: 2 },
      { x: 0,   z: -5 },
      { x: 8,   z: 2 },
      { x: 16,  z: -4 }
    ];

    offsets.forEach((offset, idx) => {
      const data = journeyTimeline[idx];
      const group = new THREE.Group();
      group.position.set(offset.x, 0, offset.z);

      // Base pedestal
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 1.2, 8), pillarMat);
      base.position.y = 0.6;
      base.castShadow = true;
      group.add(base);

      // Glowing crystal / geometric monument representing the era
      const gemGeo = idx === 0 
        ? new THREE.BoxGeometry(1.2, 1.2, 1.2) // Voxel Minecraft
        : idx === 1
        ? new THREE.OctahedronGeometry(0.85) // Bedrock node
        : idx === 2
        ? new THREE.CylinderGeometry(0.7, 0.7, 1.4, 6) // Java server
        : idx === 3
        ? new THREE.TorusGeometry(0.7, 0.25, 8, 16) // Code mod ring
        : new THREE.IcosahedronGeometry(1.0); // 2026 Launch core

      const gemMat = new THREE.MeshStandardMaterial({
        color: colors[idx],
        emissive: colors[idx],
        emissiveIntensity: 1.0,
        metalness: 0.5,
        roughness: 0.15
      });

      const gem = new THREE.Mesh(gemGeo, gemMat);
      gem.position.y = 2.4;
      gem.castShadow = true;
      group.add(gem);

      this.monuments.push(gem);

      this.mesh.add(group);
      this.collision.addCircle(this.position.x + offset.x, this.position.z + offset.z, 2.0, `journey_pillar_${idx}`);
    });
  }

  update(time, deltaTime) {
    super.update(time, deltaTime);
    // Floating & spinning animations for timeline monuments
    this.monuments.forEach((mon, idx) => {
      mon.rotation.y = time * 0.8 + idx * 0.5;
      mon.position.y = 2.4 + Math.sin(time * 2.5 + idx * 0.8) * 0.2;
    });
  }
}
