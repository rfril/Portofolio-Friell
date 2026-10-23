/**
 * AREA 3A: APEXSIONS MINECRAFT SERVER ZONE
 * Kastil Obsidian & Menara RPG faksi 3 Kerajaan (Zenithar, Solterra, Sylvamoor),
 * bola hologram BlueMap, dan portal dimensi Aetherion.
 */

import { BaseZone } from "./BaseZone.js";
import { projectsData } from "../data/projectsData.js";

export class ApexsionsZone extends BaseZone {
  constructor(scene, collisionSystem) {
    super("apexsions", "Apexsions RPG Fortress", "Flagship Minecraft Server", new THREE.Vector3(80, 0, -35), 14.5, scene, collisionSystem);
    this.projectData = projectsData.find(p => p.id === "apexsions");
    this.hologramGlobe = null;
    this.buildFortress();
  }

  buildFortress() {
    const obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x090d16, // Dark obsidian
      roughness: 0.35,
      metalness: 0.65
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Royal gold
      metalness: 0.85,
      roughness: 0.2
    });

    const cyanRuneMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.6
    });

    // 1. Central Fortress Keep
    const keep = new THREE.Mesh(new THREE.BoxGeometry(10.0, 7.0, 10.0), obsidianMat);
    keep.position.y = 3.5;
    keep.castShadow = true;
    keep.receiveShadow = true;
    this.mesh.add(keep);
    this.collision.addBox(this.position.x, this.position.z, 10.5, 10.5, "apexsions_keep");

    // Gold Parapets / Battlements
    const battlement = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.8, 10.6), goldMat);
    battlement.position.y = 7.4;
    battlement.castShadow = true;
    this.mesh.add(battlement);

    // 2. Corner Towers (4 corners)
    const towerOffsets = [
      [-5.5, -5.5], [5.5, -5.5], [-5.5, 5.5], [5.5, 5.5]
    ];

    towerOffsets.forEach(([ox, oz]) => {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 9.5, 8), obsidianMat);
      tower.position.set(ox, 4.75, oz);
      tower.castShadow = true;
      this.mesh.add(tower);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3.0, 8), goldMat);
      roof.position.set(ox, 11.0, oz);
      roof.castShadow = true;
      this.mesh.add(roof);

      this.collision.addCircle(this.position.x + ox, this.position.z + oz, 2.0, "fortress_tower");
    });

    // 3. Floating BlueMap 3D Hologram Globe
    const globeGeo = new THREE.SphereGeometry(2.4, 16, 16);
    this.hologramGlobe = new THREE.Mesh(globeGeo, cyanRuneMat);
    this.hologramGlobe.position.set(0, 11.5, 0);
    this.mesh.add(this.hologramGlobe);

    // Orbit Ring
    const orbitGeo = new THREE.RingGeometry(3.2, 3.5, 32);
    orbitGeo.rotateX(Math.PI / 3);
    this.orbitRing = new THREE.Mesh(orbitGeo, new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide
    }));
    this.orbitRing.position.set(0, 11.5, 0);
    this.mesh.add(this.orbitRing);

    // 4. Kingdom Banners (Zenithar Gold, Solterra Crimson, Sylvamoor Green)
    const bannerGeo = new THREE.BoxGeometry(1.4, 4.2, 0.15);
    const zMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // Zenithar
    const sMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // Solterra
    const mMat = new THREE.MeshStandardMaterial({ color: 0x10b981 }); // Sylvamoor

    const bZenithar = new THREE.Mesh(bannerGeo, zMat);
    bZenithar.position.set(-2.8, 4.2, 5.15);
    this.mesh.add(bZenithar);

    const bSolterra = new THREE.Mesh(bannerGeo, sMat);
    bSolterra.position.set(0, 4.2, 5.15);
    this.mesh.add(bSolterra);

    const bSylvamoor = new THREE.Mesh(bannerGeo, mMat);
    bSylvamoor.position.set(2.8, 4.2, 5.15);
    this.mesh.add(bSylvamoor);
  }

  update(time, deltaTime) {
    super.update(time, deltaTime);
    if (this.hologramGlobe) {
      this.hologramGlobe.rotation.y = time * 0.6;
      this.hologramGlobe.position.y = 11.5 + Math.sin(time * 2.2) * 0.35;
    }
    if (this.orbitRing) {
      this.orbitRing.rotation.z = time * 0.9;
      this.orbitRing.position.y = 11.5 + Math.sin(time * 2.2) * 0.35;
    }
  }
}
