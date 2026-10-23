/**
 * COLLISION SYSTEM
 * Mendeteksi dan menangani tumbukan antara kendaraan pemain dengan objek statis dunia
 * (bangunan proyek, tugu timeline, tiang lampu, dan pagar batas dunia).
 * Dilengkapi proteksi anti-spam tumbukan, penanganan penetrasi vektor normal,
 * dan kebebasan bergerak mundur saat bersentuhan dengan dinding.
 */

export class CollisionSystem {
  constructor(audioManager, particleSystem, cameraController) {
    this.audio = audioManager;
    this.particles = particleSystem;
    this.camera = cameraController;

    // List of static colliders: { type: 'circle'|'box', x, z, radius, width, depth }
    this.colliders = [];
    this.lastImpactTime = 0;
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
    const now = performance.now();

    // Vektor arah gerak mobil saat ini
    const forwardX = Math.sin(carController.mesh.rotation.y);
    const forwardZ = Math.cos(carController.mesh.rotation.y);
    const velX = forwardX * carController.speed;
    const velZ = forwardZ * carController.speed;

    for (const col of this.colliders) {
      let collided = false;
      let overlap = 0;
      let normalX = 0;
      let normalZ = 0;

      if (col.type === "circle") {
        const dx = carPos.x - col.x;
        const dz = carPos.z - col.z;
        const distSq = dx * dx + dz * dz;
        const minDist = carRadius + col.radius;

        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq) || 0.001;
          overlap = minDist - dist;
          normalX = dx / dist;
          normalZ = dz / dist;
          collided = true;
        }
      } else if (col.type === "box") {
        const halfW = col.width / 2;
        const halfD = col.depth / 2;

        const closestX = Math.max(col.x - halfW, Math.min(carPos.x, col.x + halfW));
        const closestZ = Math.max(col.z - halfD, Math.min(carPos.z, col.z + halfD));

        const dx = carPos.x - closestX;
        const dz = carPos.z - closestZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < carRadius * carRadius) {
          const dist = Math.sqrt(distSq) || 0.001;
          overlap = carRadius - dist;
          normalX = dx / dist;
          normalZ = dz / dist;
          collided = true;
        }
      }

      if (collided) {
        // Posisikan mobil tepat di luar batas rintangan tanpa lompatan buatan
        carPos.x += normalX * overlap;
        carPos.z += normalZ * overlap;

        // Dot product antara kecepatan mobil dengan normal dinding (normal mengarah keluar dari dinding)
        const dot = velX * normalX + velZ * normalZ;

        // Hanya tangani jika mobil bergerak MENEMBUS rintangan (dot < 0).
        // Jika mobil bergerak MENJAUHI rintangan (dot >= 0, misal mundur setelah tabrakan),
        // JANGAN batalkan kecepatan! Izinkan mobil langsung mundur bebas tanpa hambatan!
        if (dot < 0) {
          const speedAbs = Math.abs(carController.speed);

          // Tumbukan berkecepatan cukup tinggi (> 2.8 m/s)
          if (speedAbs > 2.8 && (now - this.lastImpactTime > 300)) {
            this.lastImpactTime = now;
            this.triggerImpact(carPos);

            // Pantulan lembut (recoil) sekali saja
            carController.speed = -Math.sign(carController.speed) * Math.min(2.5, speedAbs * 0.25);
          } else {
            // Ketika menempel dinding dan ditekan terus, nolkan kecepatan agar stabil tanpa jitter/spam getar
            carController.speed = 0;
          }
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
