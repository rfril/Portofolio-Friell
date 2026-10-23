/**
 * MASTER GAME CLASS
 * Inisialisasi engine Three.js, siklus render loop (requestAnimationFrame),
 * penanganan resize layar, kontrol kualitas grafis, dan pemulihan context WebGL.
 */

import { CONFIG } from "./Config.js";
import { StateManager, GameStates } from "./StateManager.js";
import { AudioManager } from "./AudioManager.js";
import { ProgressionManager } from "./ProgressionManager.js";
import { InputManager } from "./InputManager.js";
import { CameraController } from "./CameraController.js";
import { ParticleSystem } from "../entities/ParticleSystem.js";
import { CarController } from "../entities/CarController.js";
import { World } from "../world/World.js";
import { UIManager } from "../ui/UIManager.js";
import { ModalManager } from "../ui/ModalManager.js";
import { MobileControls } from "../ui/MobileControls.js";

export class Game {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.state = new StateManager(GameStates.LOADING);
    this.audio = new AudioManager();
    this.progression = new ProgressionManager();
    this.input = new InputManager(this.state);

    this.clock = new THREE.Clock();
    this.animationFrameId = null;

    this.initWebGL();
    this.initLights();

    this.particles = new ParticleSystem(this.scene);
    this.car = new CarController(this.scene, this.input, this.audio, this.particles);
    this.cameraController = new CameraController(this.camera, this.car.mesh);
    this.world = new World(this.scene, this.audio, this.particles, this.cameraController);

    this.ui = new UIManager(this);
    this.modal = new ModalManager(this.state, this.audio, this.progression);
    this.mobileControls = new MobileControls(this.input, this);

    this.bindActionEvents();
    this.bindWindowEvents();

    // Start game
    this.state.setState(GameStates.PLAYING);
    this.startLoop();

    // Hide loader overlay if present
    const loader = document.getElementById("gameLoader");
    if (loader) {
      setTimeout(() => loader.classList.add("hidden"), 300);
    }
  }

  initWebGL() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.WORLD.DAY_SKY_COLOR);
    this.scene.fog = new THREE.Fog(
      CONFIG.WORLD.FOG_COLOR,
      CONFIG.WORLD.FOG_NEAR,
      CONFIG.WORLD.FOG_FAR
    );

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(38, 44, 38);

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        powerPreference: "high-performance"
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } catch (e) {
      console.error("WebGL initialization failed:", e);
      this.state.setState(GameStates.FALLBACK);
      this.showFallbackBanner();
    }
  }

  initLights() {
    // Ambient Daylight
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.75);
    this.scene.add(ambientLight);

    // Hemisphere sky/ground bounce
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x86efac, 0.35);
    this.scene.add(hemiLight);

    // Warm Directional Sunlight with Shadows
    this.sunLight = new THREE.DirectionalLight(0xfffaea, 1.3);
    this.sunLight.position.set(70, 95, 60);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 480;

    const d = 220;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0004;
    this.scene.add(this.sunLight);

    // Soft Fill Light
    const fillLight = new THREE.DirectionalLight(0xa5f3fc, 0.3);
    fillLight.position.set(-60, 40, -50);
    this.scene.add(fillLight);
  }

  bindActionEvents() {
    // [E] Interact
    this.input.onAction("interact", () => this.triggerInteraction());

    // [R] Reset Position
    this.input.onAction("reset", () => this.car.reset());

    // [C] Camera Mode
    this.input.onAction("camera", () => {
      const next = this.cameraController.cycleMode();
      this.ui.updateCameraBtnText(next);
    });

    // [H] Horn
    this.input.onAction("horn", () => this.audio.playHorn());

    // [P] Portfolio Guidebook
    this.input.onAction("portfolio", () => {
      if (this.modal.isOpen()) {
        this.modal.close();
      } else {
        const activeZone = this.world.getActiveZone();
        if (activeZone) {
          this.modal.open(activeZone.id);
        } else {
          if (this.ui) {
            this.ui.showDiscoveryToast("Zona Terkunci", "Kendarai mobil ke lingkaran zona informasi untuk mengakses portofolio.");
          }
        }
      }
    });

    // [ESC] Escape / Close modal
    this.input.onAction("escape", () => {
      if (this.modal.isOpen()) {
        this.modal.close();
      }
    });
  }

  bindWindowEvents() {
    window.addEventListener("resize", () => this.onResize());

    // Progression: listen to zoneVisited from BaseZone
    window.addEventListener("zoneVisited", (e) => {
      const zoneId = e.detail?.zoneId;
      if (zoneId && this.progression) {
        const isNew = this.progression.unlockZone(zoneId);
        if (isNew) {
          this.audio.playDiscoverySound();
        }
      }
    });

    // AudioContext activation on first user interaction
    const unlockAudio = () => {
      this.audio.ensureContext();
      this.audio.startEngine();
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);

    // WebGL Context Lost handling
    this.canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      console.warn("WebGL Context Lost! Pausing loop...");
      cancelAnimationFrame(this.animationFrameId);
    }, false);

    this.canvas.addEventListener("webglcontextrestored", () => {
      console.log("WebGL Context Restored! Reinitializing...");
      this.initWebGL();
      this.startLoop();
    }, false);
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  triggerInteraction() {
    if (this.modal.isOpen()) {
      this.modal.close();
      return;
    }

    const activeZone = this.world.getActiveZone();
    if (activeZone) {
      if (this.progression) this.progression.unlockZone(activeZone.id);
      this.modal.open(activeZone.id);
    } else {
      // Hanya bisa membuka jika berada di dalam zona informasi 3D
      if (this.ui) {
        this.ui.showDiscoveryToast(
          "Lokasi Terbuka",
          "Kendarai mobil ke dalam lingkaran zona informasi (kuning/biru) untuk menekan [E]."
        );
      }
    }
  }

  startLoop() {
    if (this.animationFrameId) return;
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      this.update();
      this.render();
    };
    animate();
  }

  stopLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  update() {
    const deltaTime = Math.min(this.clock.getDelta(), 0.05); // Clamp dt to prevent tunneling
    const time = this.clock.getElapsedTime();

    // Update Car
    this.car.update(deltaTime);

    // Update Particles
    this.particles.update(deltaTime);

    // Update Camera
    this.cameraController.update(deltaTime, this.car.speed);

    // Update World & Collisions
    this.world.update(time, deltaTime, this.car);

    // Update HUD
    this.ui.updateSpeedometer(this.car.getSpeedKmh(), this.car.isDrifting);
  }

  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  showFallbackBanner() {
    const fallback = document.getElementById("webglFallbackBanner");
    if (fallback) fallback.style.display = "flex";
  }
}
