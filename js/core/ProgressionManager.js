/**
 * PROGRESSION & EXPLORATION MANAGER
 * Melacak status penemuan 8 zona dunia 3D dan mengunci/membuka data portofolio.
 * Pemain harus menjelajahi dunia terlebih dahulu untuk membuka informasi lengkap.
 */

export class ProgressionManager {
  constructor() {
    this.storageKey = "rafriel_portfolio_discovered_zones";
    this.totalZones = 8;

    this.zoneInfo = {
      spawn: {
        id: "spawn",
        name: "Spawn Sanctum",
        category: "Introduction",
        icon: "fa-solid fa-archway",
        clue: "Titik awal permainan di tengah dunia."
      },
      journey: {
        id: "journey",
        name: "My Journey Avenue",
        category: "Linimasa Perjalanan",
        icon: "fa-solid fa-route",
        clue: "Kendarai mobil lurus ke arah Utara (North Boulevard) melintasi gapura linimasa."
      },
      apexsions: {
        id: "apexsions",
        name: "Apexsions RPG Fortress",
        category: "Proyek A (Flagship)",
        icon: "fa-solid fa-dungeon",
        clue: "Kendarai mobil ke arah Timur Laut (East-North) menuju Benteng Kastil Obsidian bersimbol emas."
      },
      kasir: {
        id: "kasir",
        name: "POS Kasir Digital Store",
        category: "Proyek B (Fullstack Web)",
        icon: "fa-solid fa-cash-register",
        clue: "Kendarai mobil ke arah Tenggara (East-South) menuju Supermarket Digital bernuansa ungu."
      },
      pororo: {
        id: "pororo",
        name: "PoRoRo Gelato Cafe",
        category: "Proyek C (Nuxt 3 & Figma)",
        icon: "fa-solid fa-ice-cream",
        clue: "Kendarai mobil ke arah Barat Laut (West-North) menuju Kafe Gelato berkanopi pastel."
      },
      skills: {
        id: "skills",
        name: "Developer Skills Lab",
        category: "Keahlian Teknis",
        icon: "fa-solid fa-laptop-code",
        clue: "Kendarai mobil ke arah Barat Daya (West-South) menuju Laboratorium 6 Kristal Komputasi."
      },
      about: {
        id: "about",
        name: "Developer Studio",
        category: "Tentang Saya & Karakter",
        icon: "fa-solid fa-user-astronaut",
        clue: "Kendarai mobil ke arah Selatan Timur (South-East) menuju Studio Meja Kerja Multi-Monitor."
      },
      contact: {
        id: "contact",
        name: "Satellite Relay Hub",
        category: "Kontak & Komunikasi",
        icon: "fa-solid fa-satellite-dish",
        clue: "Kendarai mobil ke arah Selatan Barat (South-West) menuju Menara Transmisi Antena Satelit."
      }
    };

    // Load discovered zones from localStorage
    this.discoveredZones = new Set();
    this.loadProgress();
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach(id => this.discoveredZones.add(id));
        }
      }
    } catch (e) {
      console.warn("Gagal membaca progress dari storage:", e);
    }

    // Spawn selalu otomatis terbuka sejak awal
    this.discoveredZones.add("spawn");
  }

  saveProgress() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.discoveredZones)));
    } catch (e) {}
  }

  unlockZone(zoneId) {
    if (!this.zoneInfo[zoneId]) return false;

    const isNew = !this.discoveredZones.has(zoneId);
    if (isNew) {
      this.discoveredZones.add(zoneId);
      this.saveProgress();

      window.dispatchEvent(new CustomEvent("zoneDiscovered", {
        detail: {
          zoneId,
          zone: this.zoneInfo[zoneId],
          stats: this.getStats()
        }
      }));
    }
    return isNew;
  }

  isUnlocked(zoneId) {
    return this.discoveredZones.has(zoneId);
  }

  unlockAll() {
    Object.keys(this.zoneInfo).forEach(id => this.discoveredZones.add(id));
    this.saveProgress();

    window.dispatchEvent(new CustomEvent("allZonesUnlocked", {
      detail: { stats: this.getStats() }
    }));
  }

  resetProgress() {
    this.discoveredZones.clear();
    this.discoveredZones.add("spawn");
    this.saveProgress();

    window.dispatchEvent(new CustomEvent("progressReset", {
      detail: { stats: this.getStats() }
    }));
  }

  getStats() {
    const count = this.discoveredZones.size;
    return {
      discoveredCount: count,
      totalCount: this.totalZones,
      percent: Math.round((count / this.totalZones) * 100),
      isAllUnlocked: count >= this.totalZones
    };
  }

  getZoneInfo(zoneId) {
    return this.zoneInfo[zoneId] || null;
  }
}
