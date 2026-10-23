/**
 * PARTICLE SYSTEM
 * Menangani partikel asap knalpot, debu gesekan ban (skid dust),
 * percikan diamond collectible, dan partikel tumbukan.
 */

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.maxParticles = 120;

    // Shared reusable geometry & materials
    this.smokeGeo = new THREE.SphereGeometry(0.2, 5, 5);
    this.sparkleGeo = new THREE.DodecahedronGeometry(0.18);

    this.smokeMat = new THREE.MeshBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.6
    });

    this.sparkleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95
    });

    this.impactMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.9
    });
  }

  // Asap knalpot mobil saat akselerasi
  emitExhaust(position, direction) {
    if (this.particles.length >= this.maxParticles) return;

    const mesh = new THREE.Mesh(this.smokeGeo, this.smokeMat.clone());
    mesh.position.copy(position);
    mesh.position.x += (Math.random() - 0.5) * 0.2;
    mesh.position.y += 0.2;
    mesh.position.z += (Math.random() - 0.5) * 0.2;

    const vel = new THREE.Vector3(
      -direction.x * 2.5 + (Math.random() - 0.5) * 0.5,
      0.8 + Math.random() * 0.6,
      -direction.z * 2.5 + (Math.random() - 0.5) * 0.5
    );

    this.scene.add(mesh);
    this.particles.push({
      mesh,
      velocity: vel,
      life: 0.45,
      maxLife: 0.45,
      scaleSpeed: 2.5
    });
  }

  // Debu ban saat drift / belok tajam
  emitSkidDust(position) {
    if (this.particles.length >= this.maxParticles) return;

    const mesh = new THREE.Mesh(this.smokeGeo, this.smokeMat.clone());
    mesh.material.color.setHex(0xd1d5db);
    mesh.position.copy(position);
    mesh.position.y += 0.15;

    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 1.5,
      0.5 + Math.random() * 0.8,
      (Math.random() - 0.5) * 1.5
    );

    this.scene.add(mesh);
    this.particles.push({
      mesh,
      velocity: vel,
      life: 0.35,
      maxLife: 0.35,
      scaleSpeed: 2.2
    });
  }

  // Ledakan bintang partikel saat mengambil Diamond
  emitDiamondBurst(position) {
    const count = 14;
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.sparkleGeo, this.sparkleMat.clone());
      mesh.position.copy(position);

      const angle = (i / count) * Math.PI * 2;
      const speed = 4.5 + Math.random() * 3.5;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        2.5 + Math.random() * 4.0,
        Math.sin(angle) * speed
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        life: 0.75,
        maxLife: 0.75,
        scaleSpeed: -0.6 // Menyusut
      });
    }
  }

  // Percikan saat menabrak tembok / prop
  emitImpact(position) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.sparkleGeo, this.impactMat.clone());
      mesh.position.copy(position);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        1.5 + Math.random() * 3,
        (Math.random() - 0.5) * 5
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        life: 0.4,
        maxLife: 0.4,
        scaleSpeed: -0.8
      });
    }
  }

  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= deltaTime;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      // Update position
      p.mesh.position.addScaledVector(p.velocity, deltaTime);
      p.velocity.y -= 3.5 * deltaTime; // Sedikit gravitasi

      // Fade opacity
      const lifeRatio = p.life / p.maxLife;
      p.mesh.material.opacity = lifeRatio * 0.8;

      // Scale
      const scaleDelta = p.scaleSpeed * deltaTime;
      const currentScale = Math.max(0.01, p.mesh.scale.x + scaleDelta);
      p.mesh.scale.set(currentScale, currentScale, currentScale);
    }
  }
}
