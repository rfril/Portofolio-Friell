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
        name: "My Journey Promenade",
        category: "Linimasa Perjalanan",
        icon: "fa-solid fa-route",
        clue: "Kendarai mobil ke arah Barat Laut (Mid-West Block, X: -105, Z: -35) menuju Taman Linimasa Karir Siswa RPL."
      },
      apexsions: {
        id: "apexsions",
        name: "Apexsions RPG Fortress",
        category: "Proyek A (Flagship)",
        icon: "fa-solid fa-dungeon",
        clue: "Kendarai mobil ke arah Timur Laut (North-East Block, X: 105, Z: -105) menuju Benteng Kastil Obsidian RPG Apexsions."
      },
      kasir: {
        id: "kasir",
        name: "POS Kasir Digital Store",
        category: "Proyek B (Fullstack Web)",
        icon: "fa-solid fa-cash-register",
        clue: "Kendarai mobil ke arah Timur (Mid-East Block, X: 105, Z: -35) menuju POS Kasir Digital Store (Nuxt 4 + Laravel)."
      },
      pororo: {
        id: "pororo",
        name: "PoRoRo Gelato Cafe",
        category: "Proyek C (Nuxt 3 & Figma)",
        icon: "fa-solid fa-ice-cream",
        clue: "Kendarai mobil ke arah Barat Laut (Far North-West Block, X: -105, Z: -105) menuju Kedai Gelato PoRoRo berkanopi pastel."
      },
      skills: {
        id: "skills",
        name: "Developer Skills Lab",
        category: "Keahlian Teknis",
        icon: "fa-solid fa-laptop-code",
        clue: "Kendarai mobil ke arah Barat Daya (Mid-West Block, X: -105, Z: 35) menuju Developer Skills Lab & 6 Pilar Komputasi."
      },
      about: {
        id: "about",
        name: "Developer HQ & Studio",
        category: "Tentang Saya & Karakter",
        icon: "fa-solid fa-user-astronaut",
        clue: "Kendarai mobil ke arah Tenggara (South-East Block, X: 105, Z: 105) menuju Gedung Developer HQ & Studio Siswa RPL."
      },
      contact: {
        id: "contact",
        name: "Satellite Relay Hub",
        category: "Kontak & Komunikasi",
        icon: "fa-solid fa-satellite-dish",
        clue: "Kendarai mobil ke arah Barat Daya (Far South-West Block, X: -105, Z: 105) menuju Menara Antena Satelit Relay Hub."
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
