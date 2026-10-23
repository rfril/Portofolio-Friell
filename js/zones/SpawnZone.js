/**
 * AREA 1: SPAWN / INTRODUCTION
 * Titik awal pemain: Bundaran jalan utama (Roundabout) yang lapang,
 * monumen inti hologram di pulau tengah, dan paviliun panduan kontrol di tepi trotoar (off-road).
 * Jalur kendaraan 100% BEBAS RINTANGAN ke segala arah.
 */

import { BaseZone } from "./BaseZone.js";
import { profileData } from "../data/profileData.js";

export class SpawnZone extends BaseZone {
  constructor(scene, collisionSystem) {
    // Diposisikan di Plaza Sambutan barat daya (X: -24, Z: 24), off-road dan bersih dari jalur kendaraan & kanal
    super("spawn", "Welcome Pavilion", "Introduction & Guide", new THREE.Vector3(-24, 0, 24), 9.0, scene, collisionSystem);
    this.coreMesh = null;
    this.buildArchitecture();
  }

  buildArchitecture() {
    const obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.2
    });

    const neonMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.6,
      roughness: 0.2
    });

    // 1. Welcome Plaza Foundation Plinth (10 x 0.2 x 10m)
    const plazaPlinth = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.2, 10),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    );
    plazaPlinth.position.y = 0.1;
    plazaPlinth.receiveShadow = true;
    this.mesh.add(plazaPlinth);

    // 2. Welcome Kiosk & Controls Info Billboard
    const welcomeGroup = new THREE.Group();
    welcomeGroup.position.set(0, 0, 0);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 8), obsidianMat);
    post.position.set(0, 1.6, 0);
    welcomeGroup.add(post);

    const board = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.6, 0.25), obsidianMat);
    board.position.set(0, 3.0, 0);
    welcomeGroup.add(board);

    const boardFace = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 2.3), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
    boardFace.position.set(0, 3.0, 0.14);
    welcomeGroup.add(boardFace);

    // Neon frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.3, 2.7, 0.1), neonMat);
    frame.position.set(0, 3.0, -0.05);
    welcomeGroup.add(frame);

    // 3. Floating Hologram Core above Kiosk
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 0);
    this.coreMesh = new THREE.Mesh(coreGeo, new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.4,
      wireframe: true
    }));
    this.coreMesh.position.set(0, 5.2, 0);
    welcomeGroup.add(this.coreMesh);

    this.mesh.add(welcomeGroup);
    this.collision.addBox(this.position.x, this.position.z, 4.4, 0.8, "spawn_welcome_kiosk");
  }

  update(time, deltaTime) {
    super.update(time, deltaTime);
    if (this.coreMesh) {
      this.coreMesh.rotation.x = time * 0.7;
      this.coreMesh.rotation.y = time * 0.9;
      this.coreMesh.position.y = 5.2 + Math.sin(time * 2.5) * 0.25;
    }
  }
}
