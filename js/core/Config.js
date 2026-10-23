/**
 * GLOBAL CONFIGURATION & TUNING PARAMETERS
 * Mengatur skala dunia, parameter kinematika mobil mainan, kamera, dan grafik
 */

export const CONFIG = {
  // World Dimensions
  WORLD: {
    WIDTH: 460,
    DEPTH: 460,
    BOUND_PADDING: 15, // Jarak batas pagar dari tepi
    GRAVITY: 9.8,
    DAY_SKY_COLOR: 0xdbeafe,
    FOG_COLOR: 0xdbeafe,
    FOG_NEAR: 120,
    FOG_FAR: 440
  },

  // Toy Vehicle Kinematics (Bruno Simon Inspired Driving Feel + Smooth Tap-to-Drift)
  CAR: {
    MAX_SPEED_FORWARD: 48.0, // Kecepatan 106 km/h
    MAX_SPEED_REVERSE: 18.0,
    ACCELERATION: 36.0,
    BRAKE_FORCE: 36.0,       // Rem kaki & rem tangan saat kecepatan normal
    DRIFT_MIN_SPEED: 22.0,   // Ambang kecepatan tinggi untuk memicu drift (~48+ km/h)
    DRIFT_EXIT_SPEED: 14.0,  // Kecepatan minimal untuk mempertahankan drift
    DRIFT_STEER_BOOST: 1.35, // Kemudi stabil & halus saat drift (tidak terlalu cepat/liar)
    DRIFT_GRIP_RECOVERY: 5.0,// Pemulihan traksi setelah lurus
    HANDBRAKE_DECEL: 8.0,    // Deselerasi lembut saat powerslide
    NATURAL_FRICTION: 10.0,
    STEER_SPEED: 3.2,
    STEER_MAX_ANGLE: 0.62,   // ~35 derajat
    STEER_RETURN_SPEED: 4.8,
    DRIFT_SLIP_FACTOR: 0.94,
    BODY_ROLL_FACTOR: 0.10,  // Kemiringan bodi saat drift
    BODY_PITCH_FACTOR: 0.05,
    WHEEL_RADIUS: 0.65,
    RESPAWN_POSITION: { x: 0, y: 0.45, z: 0 },
    RESPAWN_ROTATION: 0
  },

  // Camera Settings
  CAMERA: {
    DEFAULT_MODE: "isometric", // "isometric" | "chase" | "topdown"
    MODES: {
      isometric: {
        offset: { x: 38, y: 44, z: 38 },
        fov: 40,
        lookOffset: { x: 0, y: 1.5, z: 0 },
        damping: 0.065
      },
      chase: {
        offset: { x: 0, y: 9, z: -18 },
        fov: 52,
        lookOffset: { x: 0, y: 2.2, z: 8 },
        damping: 0.09
      },
      topdown: {
        offset: { x: 0, y: 75, z: 0.001 },
        fov: 45,
        lookOffset: { x: 0, y: 0, z: 0 },
        damping: 0.08
      }
    }
  },

  // Graphics & Render Tuning
  GRAPHICS: {
    HIGH: {
      shadows: true,
      shadowMapSize: 2048,
      antialias: true,
      maxPixelRatio: 2.0,
      particles: true
    },
    LOW: {
      shadows: false,
      shadowMapSize: 512,
      antialias: false,
      maxPixelRatio: 1.0,
      particles: false
    }
  },

  // Collectibles & Gameplay
  GAMEPLAY: {
    TOTAL_DIAMONDS: 20,
    INTERACTION_RADIUS: 9.0, // Jarak memicu prompt interaksi
    COLLECTIBLE_MAGNET_RADIUS: 4.5
  }
};
