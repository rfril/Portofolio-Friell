/**
 * AREA 5: ABOUT ME & DEVELOPER HEADQUARTERS
 * Gedung Studio & Markas Developer kreatif Rafriel:
 * Terletak rapi di dalam komplek perkantoran kota (South-East Block), terpisah bersih dari jalan raya
 * sehingga tidak mengganggu arus lalu lintas kendaraan.
 * Menampilkan paviliun arsitektur modern, meja kerja multi-monitor, kursi ergonomis,
 * dan 5 kristal orbs yang merepresentasikan Soft Skills utama.
 */

import { BaseZone } from "./BaseZone.js";
import { profileData } from "../data/profileData.js";

export class AboutZone extends BaseZone {
  constructor(scene, collisionSystem) {
    // Diposisikan rapi di blok perkotaan (X: 105, Z: 105), aman dari badan jalan
    super("about", "Developer Headquarters & Studio", "About Me & Soft Skills", new THREE.Vector3(105, 0, 105), 15.0, scene, collisionSystem);
    this.softSkillOrbs = [];
    this.buildStudio();
  }

  buildStudio() {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.65 });

    // 1. Paviliun Arsitektur Modern HQ (Pondasi & Plaza Pribadi)
    const plazaBase = new THREE.Mesh(new THREE.BoxGeometry(22, 0.3, 20), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 }));
    plazaBase.position.y = 0.15;
    plazaBase.receiveShadow = true;
    this.mesh.add(plazaBase);

    // Dinding Kaca Belakang & Atap Kanopi HQ
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 6.5, 0.8), whiteMat);
    backWall.position.set(0, 3.25, -9.0);
    backWall.castShadow = true;
    this.mesh.add(backWall);
    this.collision.addBox(this.position.x, this.position.z - 9.0, 20.0, 0.8, "about_back_wall");

    // Atap Kanopi Melayang
    const roof = new THREE.Mesh(new THREE.BoxGeometry(21, 0.6, 18), whiteMat);
    roof.position.set(0, 6.8, -0.5);
    roof.castShadow = true;
    this.mesh.add(roof);

    // Pilar Penyangga Depan
    const pillarGeo = new THREE.CylinderGeometry(0.35, 0.35, 6.5, 8);
    const pillarL = new THREE.Mesh(pillarGeo, darkMat);
    pillarL.position.set(-9.5, 3.25, 7.5);
    pillarL.castShadow = true;
    this.mesh.add(pillarL);

    const pillarR = pillarL.clone();
    pillarR.position.x = 9.5;
    this.mesh.add(pillarR);
    this.collision.addBox(this.position.x - 9.5, this.position.z + 7.5, 0.7, 0.7, "about_pillar_l");
    this.collision.addBox(this.position.x + 9.5, this.position.z + 7.5, 0.7, 0.7, "about_pillar_r");

    // Papan Nama Gedung
    const signTex = this.createLocalSignTexture("RAFRIEL DEVELOPER HQ", "Studio & Karir Siswa RPL SMKN 71");
    const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(12, 2.0), new THREE.MeshBasicMaterial({ map: signTex }));
    signBoard.position.set(0, 7.5, 8.55);
    this.mesh.add(signBoard);

    // 2. Meja Kerja Developer (Terletak di dalam Paviliun)
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.25, 2.8), woodMat);
    deskTop.position.set(0, 1.8, -2.0);
    deskTop.castShadow = true;
    this.mesh.add(deskTop);
    this.collision.addBox(this.position.x, this.position.z - 2.0, 7.0, 2.8, "developer_desk");

    // Kaki Meja
    const legGeo = new THREE.BoxGeometry(0.25, 1.8, 2.6);
    const legL = new THREE.Mesh(legGeo, woodMat);
    legL.position.set(-3.2, 0.9, -2.0);
    this.mesh.add(legL);

    const legR = legL.clone();
    legR.position.x = 3.2;
    this.mesh.add(legR);

    // 3. Multi-Monitor Rig (3 Curved Displays)
    const monGeo = new THREE.BoxGeometry(1.8, 1.2, 0.1);
    
    // Center Monitor
    const monCenter = new THREE.Mesh(monGeo, screenMat);
    monCenter.position.set(0, 2.8, -1.2);
    this.mesh.add(monCenter);

    // Left Monitor
    const monLeft = new THREE.Mesh(monGeo, screenMat);
    monLeft.position.set(-1.9, 2.8, -1.4);
    monLeft.rotation.y = 0.35;
    this.mesh.add(monLeft);

    // Right Monitor
    const monRight = new THREE.Mesh(monGeo, screenMat);
    monRight.position.set(1.9, 2.8, -1.4);
    monRight.rotation.y = -0.35;
    this.mesh.add(monRight);

    // 4. Kursi Ergonomis
    const chair = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 1.4), chairMat);
    chair.position.set(0, 1.3, -3.8);
    chair.castShadow = true;
    this.mesh.add(chair);

    // 5. 5 Kristal Energi Soft Skills Berputar di Dalam Ruangan
    const orbColors = [0x38bdf8, 0xa855f7, 0xf59e0b, 0x10b981, 0xf43f5e];
    for (let i = 0; i < 5; i++) {
      const orb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.5, 0),
        new THREE.MeshStandardMaterial({
          color: orbColors[i],
          emissive: orbColors[i],
          emissiveIntensity: 1.5,
          roughness: 0.1
        })
      );
      this.mesh.add(orb);
      this.softSkillOrbs.push({
        mesh: orb,
        angleOffset: (i / 5) * Math.PI * 2,
        dist: 4.5
      });
    }

    // Tanaman Hias & Pot Bunga Sudut
    [-8, 8].forEach(px => {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.5, 1.2, 8), darkMat);
      pot.position.set(px, 0.6, 6);
      this.mesh.add(pot);

      const plant = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 1), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
      plant.position.set(px, 1.5, 6);
      this.mesh.add(plant);
    });
  }

  createLocalSignTexture(title, subtitle) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, canvas.width / 2, 48);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "600 20px sans-serif";
    ctx.fillText(subtitle, canvas.width / 2, 88);

    return new THREE.CanvasTexture(canvas);
  }

  update(time, deltaTime) {
    super.update(time, deltaTime);
    // Orbiting Soft Skill Orbs
    this.softSkillOrbs.forEach((item, idx) => {
      const currentAngle = time * 0.9 + item.angleOffset;
      item.mesh.position.set(
        Math.cos(currentAngle) * item.dist,
        3.4 + Math.sin(time * 2.5 + idx) * 0.4,
        -2.0 + Math.sin(currentAngle) * (item.dist * 0.7)
      );
      item.mesh.rotation.y = time * 2.0;
    });
  }
}
