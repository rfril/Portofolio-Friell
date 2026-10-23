/**
 * BASE ZONE CLASS
 * Kelas induk untuk seluruh zona interaktif di Developer's World.
 * Menangani deteksi jarak, efek cincin tanah berdenyut, prompt aksi [E],
 * dan pelacakan status kunjungan (progression).
 */

export class BaseZone {
  constructor(id, name, category, position, radius, scene, collisionSystem) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.position = position;
    this.radius = radius;
    this.scene = scene;
    this.collision = collisionSystem;

    this.mesh = new THREE.Group();
    this.mesh.position.copy(position);

    this.isPlayerInside = false;
    this.isVisited = false;

    // Ground Indicator Ring
    this.ringMesh = null;
    this.createIndicatorRing();

    // Floating Interaction Prompt Mesh
    this.promptMesh = null;
    this.createPromptTag();

    this.scene.add(this.mesh);
  }

  createIndicatorRing() {
    const ringGeo = new THREE.RingGeometry(this.radius - 0.4, this.radius + 0.3, 36);
    ringGeo.rotateX(-Math.PI / 2);
    
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });

    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringMesh.position.y = 0.04;
    this.mesh.add(this.ringMesh);
  }

  createPromptTag() {
    // 3D Canvas Billboard Badge untuk prompt teks di atas zona
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.roundRect(10, 10, 492, 108, 24);
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#38bdf8";
    ctx.stroke();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 44px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("[E] Buka Info", 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0
    });

    this.promptSprite = new THREE.Sprite(spriteMat);
    this.promptSprite.scale.set(6.5, 1.6, 1);
    this.promptSprite.position.set(0, 7.5, 0);
    this.mesh.add(this.promptSprite);
  }

  checkProximity(playerPos) {
    const dx = playerPos.x - this.position.x;
    const dz = playerPos.z - this.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    const wasInside = this.isPlayerInside;
    this.isPlayerInside = dist <= this.radius;

    if (!wasInside && this.isPlayerInside) {
      this.isVisited = true;
      this.onEnter();
    } else if (wasInside && !this.isPlayerInside) {
      this.onLeave();
    }

    return this.isPlayerInside;
  }

  onEnter() {
    if (this.ringMesh) {
      this.ringMesh.material.opacity = 0.85;
      this.ringMesh.material.color.setHex(0xf59e0b); // Glow amber when active
    }
    if (this.promptSprite) {
      this.promptSprite.material.opacity = 1.0;
    }
  }

  onLeave() {
    if (this.ringMesh) {
      this.ringMesh.material.opacity = 0.35;
      this.ringMesh.material.color.setHex(0x38bdf8);
    }
    if (this.promptSprite) {
      this.promptSprite.material.opacity = 0;
    }
  }

  update(time, deltaTime) {
    // Idle pulsing animation for indicator ring
    if (this.ringMesh) {
      const pulse = 1.0 + Math.sin(time * 3.5) * 0.05;
      this.ringMesh.scale.set(pulse, 1, pulse);
    }
    // Bobbing prompt
    if (this.promptSprite && this.isPlayerInside) {
      this.promptSprite.position.y = 7.5 + Math.sin(time * 4) * 0.25;
    }
  }
}
