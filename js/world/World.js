/**
 * WORLD MANAGER
 * Koordinator seluruh elemen dunia 3D: Scene, Environment, Collision,
 * Zona-zona interaktif (Spawn, Journey, 3 Proyek, Skills, About, Contact),
 * dan Collectibles.
 */

import { Environment } from "./Environment.js";
import { CollisionSystem } from "./CollisionSystem.js";
import { SpawnZone } from "../zones/SpawnZone.js";
import { JourneyZone } from "../zones/JourneyZone.js";
import { ApexsionsZone } from "../zones/ApexsionsZone.js";
import { KasirZone } from "../zones/KasirZone.js";
import { PororoZone } from "../zones/PororoZone.js";
import { SkillsZone } from "../zones/SkillsZone.js";
import { AboutZone } from "../zones/AboutZone.js";
import { ContactZone } from "../zones/ContactZone.js";
import { CollectibleManager } from "../collectibles/CollectibleManager.js";

export class World {
  constructor(scene, audioManager, particleSystem, cameraController) {
    this.scene = scene;
    this.audio = audioManager;
    this.particles = particleSystem;
    this.camera = cameraController;

    // 1. Collision System
    this.collision = new CollisionSystem(this.audio, this.particles, this.camera);

    // 2. Terrain & Environment
    this.environment = new Environment(this.scene, this.collision);

    // 3. Interactive Zones
    this.zones = [
      new SpawnZone(this.scene, this.collision),
      new JourneyZone(this.scene, this.collision),
      new ApexsionsZone(this.scene, this.collision),
      new KasirZone(this.scene, this.collision),
      new PororoZone(this.scene, this.collision),
      new SkillsZone(this.scene, this.collision),
      new AboutZone(this.scene, this.collision),
      new ContactZone(this.scene, this.collision)
    ];

    // 4. Collectibles (15 Diamonds)
    this.collectibles = new CollectibleManager(this.scene, this.audio, this.particles);

    this.activeZone = null;
  }

  update(time, deltaTime, carController) {
    // 1. Update Environment (Clouds)
    this.environment.update(time, deltaTime);

    const carPos = carController.getPosition();

    // 2. Update Collectibles
    this.collectibles.update(time, carPos);

    // 3. Update Zones & Check Proximity
    let currentNearbyZone = null;

    for (const zone of this.zones) {
      zone.update(time, deltaTime);
      if (zone.checkProximity(carPos)) {
        currentNearbyZone = zone;
      }
    }

    if (this.activeZone !== currentNearbyZone) {
      this.activeZone = currentNearbyZone;
      window.dispatchEvent(new CustomEvent("zoneChanged", {
        detail: { zone: this.activeZone }
      }));
    }

    // 4. Resolve Car Collisions with World Obstacles
    this.collision.resolveCollision(carController);
  }

  getActiveZone() {
    return this.activeZone;
  }
}
