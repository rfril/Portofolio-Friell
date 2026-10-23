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

  // Toy Vehicle Kinematics (Bruno Simon Inspired Driving Feel)
  CAR: {
    MAX_SPEED_FORWARD: 38.0,
    MAX_SPEED_REVERSE: 16.0,
    ACCELERATION: 28.0,
    BRAKE_FORCE: 42.0,
    NATURAL_FRICTION: 12.0,
    STEER_SPEED: 2.8,
    STEER_MAX_ANGLE: 0.58, // Radian (~33 derajat)
    STEER_RETURN_SPEED: 4.5,
    DRIFT_SLIP_FACTOR: 0.92, // Kelembutan sliding saat belok tajam
    BODY_ROLL_FACTOR: 0.08,  // Kemiringan bodi saat belok
    BODY_PITCH_FACTOR: 0.05, // Kemiringan bodi saat akselerasi/rem
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
