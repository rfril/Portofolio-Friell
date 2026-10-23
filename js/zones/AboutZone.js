/**
 * AREA 5: ABOUT ME & SOFT SKILLS ZONE
 * Studio kerja kreatif developer: Meja komputer multi-monitor, kursi ergonomis,
 * dan 5 bola energi yang merepresentasikan Soft Skills utama.
 */

import { BaseZone } from "./BaseZone.js";
import { profileData } from "../data/profileData.js";

export class AboutZone extends BaseZone {
  constructor(scene, collisionSystem) {
    super("about", "Developer Studio", "About Me & Soft Skills", new THREE.Vector3(35, 0, 75), 13.0, scene, collisionSystem);
    this.softSkillOrbs = [];
    this.buildStudio();
  }

  buildStudio() {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

    // 1. Studio Platform Base
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(8.0, 8.5, 0.4, 24), new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8
    }));
    platform.position.y = 0.2;
    platform.receiveShadow = true;
    this.mesh.add(platform);

    // 2. Developer Desk (Curved / Angled L-Desk)
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.2, 2.4), woodMat);
    deskTop.position.set(0, 1.8, 0);
    deskTop.castShadow = true;
    this.mesh.add(deskTop);
    this.collision.addBox(this.position.x, this.position.z, 7.0, 3.0, "developer_desk");

    // Desk Legs
    const legGeo = new THREE.BoxGeometry(0.2, 1.8, 2.2);
    const legL = new THREE.Mesh(legGeo, woodMat);
    legL.position.set(-3.0, 0.9, 0);
    this.mesh.add(legL);

    const legR = legL.clone();
    legR.position.x = 3.0;
    this.mesh.add(legR);

    // 3. Multi-Monitor Rig (3 Curved Screens)
    const monGeo = new THREE.BoxGeometry(1.6, 1.1, 0.1);
    
    // Center Monitor
    const monCenter = new THREE.Mesh(monGeo, screenMat);
    monCenter.position.set(0, 2.6, 0.8);
    this.mesh.add(monCenter);

    // Left Monitor
    const monLeft = new THREE.Mesh(monGeo, screenMat);
    monLeft.position.set(-1.7, 2.6, 0.6);
    monLeft.rotation.y = 0.35;
    this.mesh.add(monLeft);

    // Right Monitor
    const monRight = new THREE.Mesh(monGeo, screenMat);
    monRight.position.set(1.7, 2.6, 0.6);
    monRight.rotation.y = -0.35;
    this.mesh.add(monRight);

    // 4. Ergonomic Chair
    const chair = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 1.2), chairMat);
    chair.position.set(0, 1.2, -1.4);
    chair.castShadow = true;
    this.mesh.add(chair);

    // 5. 5 Floating Soft Skill Orbs orbiting the workspace
    const orbColors = [0x38bdf8, 0xa855f7, 0xf59e0b, 0x10b981, 0xf43f5e];
    for (let i = 0; i < 5; i++) {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 12, 12),
        new THREE.MeshStandardMaterial({
          color: orbColors[i],
          emissive: orbColors[i],
          emissiveIntensity: 1.2
        })
      );
      this.mesh.add(orb);
      this.softSkillOrbs.push({
        mesh: orb,
        angleOffset: (i / 5) * Math.PI * 2,
        dist: 4.8
      });
    }
  }

  update(time, deltaTime) {
    super.update(time, deltaTime);
    // Orbiting Soft Skill Orbs
    this.softSkillOrbs.forEach((item, idx) => {
      const currentAngle = time * 0.8 + item.angleOffset;
      item.mesh.position.set(
        Math.cos(currentAngle) * item.dist,
        3.2 + Math.sin(time * 2.5 + idx) * 0.4,
        Math.sin(currentAngle) * item.dist
      );
    });
  }
}
