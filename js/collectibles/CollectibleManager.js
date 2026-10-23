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
    // 17 Strategically placed Diamond positions across destination plazas and parks (Zero in driving lanes!)
    const positions = [
      // 1. Spawn Welcome Terrace
      { x: 18, z: -18 },

      // 2. Central Commons Park Fountain & Lawn
      { x: 38, z: 38 },
      { x: 26, z: 26 },

      // 3. Apexsions Fortress Courtyard
      { x: 105, z: -105 },
      { x: 92, z: -105 },

      // 4. POS Kasir Commercial Plaza
      { x: 105, z: -35 },
      { x: 90, z: -35 },

      // 5. PoRoRo Gelato Cafe Patio
      { x: -105, z: -105 },
      { x: -90, z: -105 },

      // 6. My Journey Museum Promenade
      { x: -105, z: -35 },
      { x: -119, z: -35 },

      // 7. Developer Skills Lab
      { x: -105, z: 35 },
      { x: -90, z: 35 },

      // 8. Developer HQ Studio
      { x: 105, z: 105 },
      { x: 90, z: 105 },

      // 9. Satellite Relay Hub
      { x: -105, z: 105 },
      { x: -105, z: 109 }
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
