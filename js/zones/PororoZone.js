/**
 * AREA 3C: PORORO ICE CREAM ZONE (PROJECT MKK KELOMPOK 6)
 * Kedai gelato artisan Cakung bergaya pastel dengan kanopi bergaris,
 * monumen es krim cone raksasa, meja teras dine-in, dan masterplan UI/UX Figma.
 */

import { BaseZone } from "./BaseZone.js";
import { projectsData } from "../data/projectsData.js";

export class PororoZone extends BaseZone {
  constructor(scene, collisionSystem) {
    super("pororo", "PoRoRo Gelato Cafe", "Nuxt 3 & Figma Masterplan", new THREE.Vector3(-80, 0, -35), 14.0, scene, collisionSystem);
    this.projectData = projectsData.find(p => p.id === "pororo");
    this.iceCreamCone = null;
    this.buildCafe();
  }

  buildCafe() {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xfdf4ff, // Soft pastel cream
      roughness: 0.6
    });

    const pinkMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6, // Soft gelato pink
      roughness: 0.4
    });

    const mintMat = new THREE.MeshStandardMaterial({
      color: 0x6ee7b7, // Pastel mint
      roughness: 0.4
    });

    const coneWaffleMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Waffle wafer gold
      roughness: 0.8
    });

    // 1. Cafe Main Building
    const cafe = new THREE.Mesh(new THREE.BoxGeometry(10.5, 5.5, 9.0), wallMat);
    cafe.position.y = 2.75;
    cafe.castShadow = true;
    cafe.receiveShadow = true;
    this.mesh.add(cafe);
    this.collision.addBox(this.position.x, this.position.z, 11.0, 9.5, "pororo_cafe");

    // Striped Awning (Canopy)
    const awningGroup = new THREE.Group();
    awningGroup.position.set(0, 4.8, 5.0);
    awningGroup.rotation.x = 0.25;

    for (let i = 0; i < 8; i++) {
      const stripeMat = i % 2 === 0 ? pinkMat : wallMat;
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.2, 2.2), stripeMat);
      stripe.position.x = -4.5 + i * 1.3;
      awningGroup.add(stripe);
    }
    this.mesh.add(awningGroup);

    // 2. Giant Floating Double-Scoop Ice Cream Cone Monument
    const coneGroup = new THREE.Group();
    coneGroup.position.set(0, 9.2, 0);

    // Waffle Cone (Inverted cone)
    const coneMesh = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.2, 12), coneWaffleMat);
    coneMesh.rotation.x = Math.PI; // Invert cone point down
    coneGroup.add(coneMesh);

    // Scoop 1 (Pistachio Mint)
    const scoop1 = new THREE.Mesh(new THREE.SphereGeometry(1.4, 14, 14), mintMat);
    scoop1.position.y = 2.0;
    coneGroup.add(scoop1);

    // Scoop 2 (Strawberry Pink)
    const scoop2 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 14, 14), pinkMat);
    scoop2.position.set(0.3, 3.2, 0.2);
    coneGroup.add(scoop2);

    this.iceCreamCone = coneGroup;
    this.mesh.add(this.iceCreamCone);

    // 3. Outdoor Patio Dining Table & Beach Umbrella
    const patio = new THREE.Group();
    patio.position.set(4.2, 0, 5.8);

    const table = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.1, 12), wallMat);
    table.position.y = 1.0;
    patio.add(table);

    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.0, 8), wallMat);
    tableLeg.position.y = 0.5;
    patio.add(tableLeg);

    const umbrellaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), pinkMat);
    umbrellaPole.position.y = 1.6;
    patio.add(umbrellaPole);

    const umbrellaTop = new THREE.Mesh(new THREE.ConeGeometry(2.4, 0.9, 12), pinkMat);
    umbrellaTop.position.y = 3.2;
    patio.add(umbrellaTop);

    this.mesh.add(patio);
    this.collision.addCircle(this.position.x + 4.2, this.position.z + 5.8, 1.6, "pororo_patio");
  }

  update(time, deltaTime) {
    super.update(time, deltaTime);
    if (this.iceCreamCone) {
      this.iceCreamCone.rotation.y = time * 0.7;
      this.iceCreamCone.position.y = 9.2 + Math.sin(time * 2.4) * 0.35;
    }
  }
}
