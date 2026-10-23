/**
 * COLLISION SYSTEM
 * Mendeteksi dan menangani tumbukan antara kendaraan pemain dengan objek statis dunia
 * (bangunan proyek, tugu timeline, tiang lampu, dan pagar batas dunia).
 */

export class CollisionSystem {
  constructor(audioManager, particleSystem, cameraController) {
    this.audio = audioManager;
    this.particles = particleSystem;
    this.camera = cameraController;

    // List of static colliders: { type: 'circle'|'box', x, z, radius, width, depth }
    this.colliders = [];
  }

  addCircle(x, z, radius, name = "obstacle") {
    this.colliders.push({ type: "circle", x, z, radius, name });
  }

  addBox(x, z, width, depth, name = "building") {
    this.colliders.push({ type: "box", x, z, width, depth, name });
  }

  resolveCollision(carController) {
    const carPos = carController.mesh.position;
    const carRadius = carController.colliderRadius;

    for (const col of this.colliders) {
      if (col.type === "circle") {
        const dx = carPos.x - col.x;
        const dz = carPos.z - col.z;
        const distSq = dx * dx + dz * dz;
        const minDist = carRadius + col.radius;

        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq) || 0.001;
          const overlap = minDist - dist;
          const normalX = dx / dist;
          const normalZ = dz / dist;

          // Push car out of obstacle
          carPos.x += normalX * overlap;
          carPos.z += normalZ * overlap;

          // Rebound speed
          carController.speed *= -0.28;

          this.triggerImpact(carPos);
        }
      } else if (col.type === "box") {
        // Simple AABB vs Circle
        const halfW = col.width / 2;
        const halfD = col.depth / 2;

        const closestX = Math.max(col.x - halfW, Math.min(carPos.x, col.x + halfW));
        const closestZ = Math.max(col.z - halfD, Math.min(carPos.z, col.z + halfD));

        const dx = carPos.x - closestX;
        const dz = carPos.z - closestZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < carRadius * carRadius) {
          const dist = Math.sqrt(distSq) || 0.001;
          const overlap = carRadius - dist;
          const normalX = dx / dist;
          const normalZ = dz / dist;

          carPos.x += normalX * overlap;
          carPos.z += normalZ * overlap;

          carController.speed *= -0.28;

          this.triggerImpact(carPos);
        }
      }
    }
  }

  triggerImpact(position) {
    if (this.audio) this.audio.playBumpSound();
    if (this.particles) this.particles.emitImpact(position);
    if (this.camera) this.camera.triggerShake(0.35);
  }
}
