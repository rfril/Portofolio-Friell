/**
 * COLLECTIBLE & PROGRESSION MANAGER
 * Mengelola 15 kristal Diamond tersembunyi di penjuru dunia 3D,
 * animasi rotasi & bobbing, deteksi pengambilan magnetis, efek suara chime,
 * serta pelacakan progres eksplorasi pemain.
 */

import { CONFIG } from "../core/Config.js";

export class CollectibleManager {
  constructor(scene, audioManager, particleSystem) {
    this.scene = scene;
    this.audio = audioManager;
    this.particles = particleSystem;

    this.diamonds = [];
    this.collectedCount = 0;
    this.totalDiamonds = CONFIG.GAMEPLAY.TOTAL_DIAMONDS;

    // Diamond 3D Geometry & Material
    this.geo = new THREE.OctahedronGeometry(0.65, 0);
    this.mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.4,
      metalness: 0.8,
      roughness: 0.1
    });

    this.spawnDiamonds();
  }

  spawnDiamonds() {
    // 15 Strategically placed Diamond positions
    const positions = [
      // Spawn Area (2)
      { x: -6, z: 6 },
      { x: 6, z: -6 },

      // Journey Boulevard & Zone (3)
      { x: 0, z: -35 },
      { x: -10, z: -70 },
      { x: 10, z: -80 },

      // Apexsions Fortress & East Road (3)
      { x: 40, z: 0 },
      { x: 75, z: -25 },
      { x: 88, z: -45 },

      // Kasir Digital Mart (2)
      { x: 75, z: 25 },
      { x: 86, z: 45 },

      // PoRoRo Gelato Cafe & West Road (2)
      { x: -40, z: 0 },
      { x: -75, z: -25 },

      // Skills Lab (2)
      { x: -75, z: 25 },
      { x: -88, z: 45 },

      // About Studio (1)
      { x: 35, z: 65 }
    ];

    positions.forEach((pos, idx) => {
      const mesh = new THREE.Mesh(this.geo, this.mat);
      mesh.position.set(pos.x, 1.3, pos.z);
      mesh.castShadow = true;
      this.scene.add(mesh);

      this.diamonds.push({
        id: idx,
        mesh,
        collected: false,
        baseY: 1.3,
        seed: Math.random() * 10
      });
    });
  }

  update(time, carPos) {
    for (const d of this.diamonds) {
      if (d.collected) continue;

      // Floating bobbing & spinning
      d.mesh.rotation.y = time * 2.2 + d.seed;
      d.mesh.rotation.x = Math.sin(time * 1.5 + d.seed) * 0.2;
      d.mesh.position.y = d.baseY + Math.sin(time * 3.0 + d.seed) * 0.25;

      // Check distance to player's car
      const dx = carPos.x - d.mesh.position.x;
      const dz = carPos.z - d.mesh.position.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < CONFIG.GAMEPLAY.COLLECTIBLE_MAGNET_RADIUS * CONFIG.GAMEPLAY.COLLECTIBLE_MAGNET_RADIUS) {
        this.collect(d);
      }
    }
  }

  collect(diamond) {
    diamond.collected = true;
    this.collectedCount++;

    // Audio Chime
    if (this.audio) {
      this.audio.playDiamondCollect(this.collectedCount);
    }

    // Sparkle Particle Burst
    if (this.particles) {
      this.particles.emitDiamondBurst(diamond.mesh.position);
    }

    // Shrink animation before removing
    const mesh = diamond.mesh;
    let s = 1.0;
    const shrinkInterval = setInterval(() => {
      s -= 0.15;
      if (s <= 0.05) {
        clearInterval(shrinkInterval);
        this.scene.remove(mesh);
      } else {
        mesh.scale.set(s, s, s);
      }
    }, 20);

    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent("diamondCollected", {
      detail: {
        count: this.collectedCount,
        total: this.totalDiamonds
      }
    }));
  }

  getScore() {
    return {
      collected: this.collectedCount,
      total: this.totalDiamonds,
      percent: Math.round((this.collectedCount / this.totalDiamonds) * 100)
    };
  }
}
