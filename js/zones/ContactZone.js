/**
 * AREA 6: CONTACT & COMMUNICATION RELAY ZONE
 * Menara transmisi satelit & stasiun komunikasi digital
 * untuk membuka dialog kontak terverifikasi (WhatsApp, GitHub, Website Server).
 */

import { BaseZone } from "./BaseZone.js";
import { contactData } from "../data/contactData.js";

export class ContactZone extends BaseZone {
  constructor(scene, collisionSystem) {
    super("contact", "Satellite Relay Hub", "Communication & Contact", new THREE.Vector3(-35, 0, 75), 13.0, scene, collisionSystem);
    this.dish = null;
    this.buildRelay();
  }

  buildRelay() {
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.2
    });

    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.4,
      roughness: 0.3
    });

    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Glowing emerald beacon
      emissive: 0x059669,
      emissiveIntensity: 2.0
    });

    // 1. Antenna Lattice Tower
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.8, 9.0, 4), metalMat);
    tower.position.y = 4.5;
    tower.castShadow = true;
    this.mesh.add(tower);
    this.collision.addCircle(this.position.x, this.position.z, 2.4, "satellite_tower");

    // 2. Parabolic Satellite Dish on Top
    const dishGroup = new THREE.Group();
    dishGroup.position.set(0, 9.2, 0);

    const dishMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 0.4, 0.8, 16, 1, true), dishMat);
    dishMesh.rotation.x = Math.PI / 4;
    dishGroup.add(dishMesh);

    // Antenna feeder pin
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8), metalMat);
    pin.position.set(0, 0.4, 0.9);
    pin.rotation.x = Math.PI / 4;
    dishGroup.add(pin);

    // Beacon Top
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), beaconMat);
    beacon.position.set(0, 1.2, 1.6);
    dishGroup.add(beacon);

    this.dish = dishGroup;
    this.mesh.add(this.dish);

    // 3. Digital Mailbox Pedestal in Front
    const mailbox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 1.2), new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.6,
      roughness: 0.2
    }));
    mailbox.position.set(0, 1.1, 4.2);
    mailbox.castShadow = true;
    this.mesh.add(mailbox);
    this.collision.addBox(this.position.x, this.position.z + 4.2, 2.0, 1.6, "contact_mailbox");
  }

  update(time, deltaTime) {
    super.update(time, deltaTime);
    if (this.dish) {
      this.dish.rotation.y = Math.sin(time * 0.4) * 0.6; // Sweeping radar motion
    }
  }
}
