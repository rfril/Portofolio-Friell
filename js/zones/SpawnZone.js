/**
 * AREA 1: SPAWN / INTRODUCTION
 * Titik awal pemain: Archway megah, podium sambutan, papan instruksi kontrol,
 * dan ringkasan profil siswa RPL SMKN 71 Jakarta.
 */

import { BaseZone } from "./BaseZone.js";
import { profileData } from "../data/profileData.js";

export class SpawnZone extends BaseZone {
  constructor(scene, collisionSystem) {
    super("spawn", "Spawn Sanctum", "Introduction", new THREE.Vector3(0, 0, 0), 12.0, scene, collisionSystem);
    this.buildArchitecture();
  }

  buildArchitecture() {
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Slate obsidian
      metalness: 0.7,
      roughness: 0.25
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

    // 1. Welcome Arch Pillars (X -8 and X +8)
    const pillarGeo = new THREE.BoxGeometry(2.0, 7.5, 2.0);
    const leftPillar = new THREE.Mesh(pillarGeo, archMat);
    leftPillar.position.set(-8.5, 3.75, -6);
    leftPillar.castShadow = true;
    this.mesh.add(leftPillar);
    this.collision.addBox(this.position.x - 8.5, this.position.z - 6, 2.2, 2.2, "spawn_pillar_left");

    const rightPillar = leftPillar.clone();
    rightPillar.position.x = 8.5;
    this.mesh.add(rightPillar);
    this.collision.addBox(this.position.x + 8.5, this.position.z - 6, 2.2, 2.2, "spawn_pillar_right");

    // Horizontal Beam
    const beamGeo = new THREE.BoxGeometry(19.0, 1.4, 2.2);
    const beam = new THREE.Mesh(beamGeo, archMat);
    beam.position.set(0, 7.8, -6);
    beam.castShadow = true;
    this.mesh.add(beam);

    // Neon Accent Line
    const neonLine = new THREE.Mesh(new THREE.BoxGeometry(17.5, 0.25, 2.3), neonMat);
    neonLine.position.set(0, 8.2, -6);
    this.mesh.add(neonLine);

    // 2. Control Guideboard (Signpost)
    const boardGroup = new THREE.Group();
    boardGroup.position.set(7.5, 0, 5.5);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.8, 8), archMat);
    post.position.y = 1.4;
    boardGroup.add(post);

    const board = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 0.2), archMat);
    board.position.y = 2.6;
    boardGroup.add(board);

    const boardFace = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.0), new THREE.MeshBasicMaterial({ color: 0x1e293b }));
    boardFace.position.set(0, 2.6, 0.11);
    boardGroup.add(boardFace);

    this.mesh.add(boardGroup);
    this.collision.addCircle(this.position.x + 7.5, this.position.z + 5.5, 1.2, "control_board");

    // 3. Central Hologram Core (Rotating floating icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 0);
    this.coreMesh = new THREE.Mesh(coreGeo, new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      wireframe: true
    }));
    this.coreMesh.position.set(0, 4.2, 0);
    this.mesh.add(this.coreMesh);
  }

  update(time, deltaTime) {
    super.update(time, deltaTime);
    if (this.coreMesh) {
      this.coreMesh.rotation.x = time * 0.7;
      this.coreMesh.rotation.y = time * 0.9;
      this.coreMesh.position.y = 4.2 + Math.sin(time * 2.5) * 0.35;
    }
  }
}
