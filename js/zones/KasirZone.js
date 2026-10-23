/**
 * AREA 3B: SISTEM KASIR ZONE (POS KASIR FRIEL v2.0)
 * Toko modern digital & terminal Point of Sale (POS) dengan hologram barcode,
 * keranjang belanja reaktif, dan integrasi Nuxt 4 + Laravel REST API.
 */

import { BaseZone } from "./BaseZone.js";
import { projectsData } from "../data/projectsData.js";

export class KasirZone extends BaseZone {
  constructor(scene, collisionSystem) {
    super("kasir", "POS Digital Store", "Nuxt 4 + Laravel REST API", new THREE.Vector3(80, 0, 35), 14.0, scene, collisionSystem);
    this.projectData = projectsData.find(p => p.id === "kasir");
    this.holoCart = null;
    this.buildStore();
  }

  buildStore() {
    const storeMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b, // Deep indigo
      roughness: 0.3,
      metalness: 0.7
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1
    });

    const neonPurple = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x9333ea,
      emissiveIntensity: 1.6
    });

    // 1. Main Store Building
    const building = new THREE.Mesh(new THREE.BoxGeometry(11.0, 6.0, 9.0), storeMat);
    building.position.y = 3.0;
    building.castShadow = true;
    building.receiveShadow = true;
    this.mesh.add(building);
    this.collision.addBox(this.position.x, this.position.z, 11.5, 9.5, "kasir_building");

    // Glass Display Facade
    const glassFacade = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.8, 0.4), glassMat);
    glassFacade.position.set(0, 2.5, 4.55);
    this.mesh.add(glassFacade);

    // Glowing Canopy / Awning
    const awning = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.6, 2.5), neonPurple);
    awning.position.set(0, 5.8, 4.8);
    this.mesh.add(awning);

    // 2. Giant Floating POS Cash Register / Hologram Cart
    const cartGroup = new THREE.Group();
    cartGroup.position.set(0, 9.5, 0);

    const monitor = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 0.3), storeMat);
    cartGroup.add(monitor);

    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    screen.position.set(0, 0, 0.16);
    cartGroup.add(screen);

    const scanner = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 0.9, 8), neonPurple);
    scanner.position.set(1.4, -0.4, 0.4);
    cartGroup.add(scanner);

    this.holoCart = cartGroup;
    this.mesh.add(this.holoCart);

    // 3. Inventory Boxes in Front
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    const box1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), boxMat);
    box1.position.set(-3.5, 0.7, 5.8);
    box1.castShadow = true;
    this.mesh.add(box1);

    const box2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), boxMat);
    box2.position.set(-3.5, 1.9, 5.8);
    box2.rotation.y = 0.3;
    box2.castShadow = true;
    this.mesh.add(box2);

    this.collision.addBox(this.position.x - 3.5, this.position.z + 5.8, 2.0, 2.0, "kasir_boxes");
  }

  update(time, deltaTime) {
    super.update(time, deltaTime);
    if (this.holoCart) {
      this.holoCart.rotation.y = time * 0.75;
      this.holoCart.position.y = 9.5 + Math.sin(time * 2.8) * 0.3;
    }
  }
}
