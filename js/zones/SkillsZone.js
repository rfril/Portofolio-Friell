/**
 * AREA 4: SKILLS LAB ZONE
 * Laboratorium rekayasa teknologi tinggi dengan pilar kristal komputasi
 * yang mewakili Java, C++, Nuxt, Laravel, HTML/CSS, dan Developer Tools.
 */

import { BaseZone } from "./BaseZone.js";
import { technicalSkills } from "../data/skillsData.js";

export class SkillsZone extends BaseZone {
  constructor(scene, collisionSystem) {
    super("skills", "Developer Skills Lab", "Technical Competencies", new THREE.Vector3(-80, 0, 35), 14.0, scene, collisionSystem);
    this.crystals = [];
    this.buildLaboratory();
  }

  buildLaboratory() {
    const labBaseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.2
    });

    // 1. Central Server Rack Tower
    const serverRack = new THREE.Mesh(new THREE.BoxGeometry(3.5, 6.5, 3.5), labBaseMat);
    serverRack.position.y = 3.25;
    serverRack.castShadow = true;
    this.mesh.add(serverRack);
    this.collision.addBox(this.position.x, this.position.z, 4.0, 4.0, "skills_server_rack");

    // Server LED strips
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let i = 0; i < 6; i++) {
      const led = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 0.05), ledMat);
      led.position.set(0, 1.2 + i * 0.8, 1.78);
      serverRack.add(led);
    }

    // 2. 6 Surrounding Tech Crystal Pillars
    const colors = [
      0xf59e0b, // Java (Amber)
      0x38bdf8, // C++ (Cyan)
      0x10b981, // Nuxt (Emerald)
      0xef4444, // Laravel (Crimson)
      0xf97316, // HTML/CSS (Orange)
      0x8b5cf6  // Tools (Violet)
    ];

    const radiusDist = 8.5;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = Math.cos(angle) * radiusDist;
      const pz = Math.sin(angle) * radiusDist;

      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(px, 0, pz);

      // Base pedestal
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 1.4, 6), labBaseMat);
      ped.position.y = 0.7;
      ped.castShadow = true;
      pillarGroup.add(ped);

      // Floating tech crystal
      const crystalGeo = new THREE.OctahedronGeometry(0.85);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: colors[i],
        emissive: colors[i],
        emissiveIntensity: 1.2,
        roughness: 0.15,
        metalness: 0.6
      });

      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 2.4;
      crystal.castShadow = true;
      pillarGroup.add(crystal);
      this.crystals.push(crystal);

      this.mesh.add(pillarGroup);
      this.collision.addCircle(this.position.x + px, this.position.z + pz, 1.5, `skill_pillar_${i}`);
    }
  }

  update(time, deltaTime) {
    super.update(time, deltaTime);
    this.crystals.forEach((cry, idx) => {
      cry.rotation.y = time * 1.0 + idx * 0.6;
      cry.position.y = 2.4 + Math.sin(time * 3.0 + idx) * 0.2;
    });
  }
}
