/**
 * DATA KEAHLIAN TEKNIS & SOFT SKILLS TERVERIFIKASI
 * Tidak menggunakan rating persentase palsu (90%/100%).
 * Menguraikan pengalaman nyata, peran dalam proyek, dan tingkat penguasaan faktual.
 */

export const technicalSkills = [
  {
    id: "java",
    name: "Java (JDK 21 LTS)",
    category: "Game Server & Backend",
    icon: "fa-brands fa-java",
    badge: "Fokus Utama",
    badgeColor: "#f59e0b",
    status: "Pengembangan Aktif & Mandiri",
    experienceYears: "2023 — Sekarang",
    
    practicalUsage: "Bahasa pemrograman utama yang saya gunakan untuk merancang dan membangun ekosistem 9 plugin Minecraft PaperMC/Spigot pada proyek Apexsions.",
    projectRelation: "Apexsions Minecraft Server (ApexsionsCore, Chat, Economy, Battlepass, Shop, Media, CustomEnchants, Crates, Fishing).",
    
    keyCapabilities: [
      "Pemrograman Berorientasi Objek (OOP) & Clean Code",
      "Event-Driven Architecture (PaperMC Listener & Custom Event Calling)",
      "Manajemen State Inventory GUI & NBT Item Tagging",
      "Asynchronous Task Execution (BukkitRunnable & CompletableFuture)",
      "Integrasi Database SQLite & MySQL JDBC",
      "Smart Turbo Multi-Compiler via PowerShell Automation"
    ]
  },

  {
    id: "cpp",
    name: "C++",
    category: "Game Modding & Systems",
    icon: "fa-solid fa-code",
    badge: "Eksplorasi Modding",
    badgeColor: "#38bdf8",
    status: "Eksplorasi & Tahap Belajar",
    experienceYears: "2021 — 2022 (Eksplorasi)",
    
    practicalUsage: "Digunakan saat mengeksplorasi struktur internal game dan addon Minecraft Bedrock Edition. Saya mempelajari bagaimana native module berinteraksi dengan runtime game.",
    projectRelation: "Eksplorasi Addon Minecraft Bedrock & Pemahaman Logika Native.",
    
    keyCapabilities: [
      "Memahami konsep memory pointers, references, dan compilation pipeline",
      "Membaca struktur file binary & native hooks",
      "Dasar syntax dan struktur kontrol C++",
      "Catatan: Dalam tahap pembelajaran berkelanjutan, bukan klaim penguasaan profesional penuh"
    ]
  },

  {
    id: "nuxt",
    name: "Nuxt (Nuxt 3 & Nuxt 4) / Vue 3",
    category: "Modern Frontend Framework",
    icon: "fa-brands fa-vuejs",
    badge: "Frontend Utama",
    badgeColor: "#10b981",
    status: "Implementasi Proyek Nyata",
    experienceYears: "2026 (Sekolah & Proyek Pribadi)",
    
    practicalUsage: "Framework frontend pilihan untuk membangun antarmuka web modern, reaktif, dan terstruktur. Digunakan pada proyek POS Kasir Friel v2.0 (Nuxt 4) dan PoRoRo Ice Cream (Nuxt 3).",
    projectRelation: "POS Kasir Friel v2.0 (kasir-frontend) & PoRoRo Ice Cream (Project MKK Kel 6).",
    
    keyCapabilities: [
      "Vue 3 Composition API (<script setup lang='ts'>)",
      "Auto-imported Modular Components",
      "Reactivity System (ref, reactive, computed, watch)",
      "Integrasi Tailwind CSS & Custom Design Tokens",
      "Komunikasi data client ke REST API backend menggunakan $fetch / useFetch",
      "Static Site Generation (SSG) & SSR Build"
    ]
  },

  {
    id: "laravel",
    name: "Laravel 11 (PHP 8.2+)",
    category: "Backend REST API",
    icon: "fa-brands fa-laravel",
    badge: "Backend Aplikasi",
    badgeColor: "#ef4444",
    status: "Implementasi Proyek Nyata",
    experienceYears: "2026 (Kurikulum RPL & Proyek)",
    
    practicalUsage: "Framework backend untuk merancang RESTful API yang melayani transaksi data barang, pencatatan nota kasir, dan autentikasi pengguna pada aplikasi kasir toko.",
    projectRelation: "POS Kasir Friel v2.0 (crud-laravel di Laragon).",
    
    keyCapabilities: [
      "Routing RESTful API (apiResource & Controller Mapping)",
      "Controller Logic (BarangController, TransaksiController, RiwayatController)",
      "Database Migrations & Schema Design (MySQL / SQLite)",
      "Validasi Input Request & Standardisasi JSON Response",
      "Operasi CRUD dengan Eloquent ORM & Query Builder"
    ]
  },

  {
    id: "html-css",
    name: "HTML5 & Modern CSS3",
    category: "Web Fundamentals & Styling",
    icon: "fa-brands fa-html5",
    badge: "Fondasi Web",
    badgeColor: "#f97316",
    status: "Mahir & Standar Semantik",
    experienceYears: "2022 — Sekarang",
    
    practicalUsage: "Pondasi utama untuk menyusun struktur dokumen semantik, tata letak antarmuka responsif, integrasi canvas WebGL 3D, dan desain grafis web.",
    projectRelation: "Portofolio 3D Interaktif, PoRoRo Ice Cream, dan tugas-tugas web RPL.",
    
    keyCapabilities: [
      "HTML5 Semantics & Accessibility (ARIA labels, landmark tags)",
      "Flexbox & CSS Grid Architecture",
      "CSS Custom Properties (Variables) & Theme Switching",
      "Glassmorphism Effects (backdrop-filter: blur, semi-transparent layers)",
      "Responsive Media Queries (Mobile, Tablet, Desktop, Ultrawide)",
      "CSS Keyframe Animations & GPU-accelerated Transitions"
    ]
  },

  {
    id: "tools",
    name: "Ecosystem Tools & Operasional",
    category: "Developer Tools",
    icon: "fa-solid fa-screwdriver-wrench",
    badge: "DevOps & Tools",
    badgeColor: "#8b5cf6",
    status: "Alat Kerja Harian",
    experienceYears: "2023 — Sekarang",
    
    practicalUsage: "Rangkaian perkakas pengembangan perangkat lunak untuk menjaga alur kerja tetap teratur, terdokumentasi, dan teruji.",
    projectRelation: "Seluruh proyek Apexsions, Kasir, dan PoRoRo.",
    
    keyCapabilities: [
      "Git & GitHub (Version control, commit hygiene, branch management)",
      "PowerShell Scripting (Smart Turbo Compiler build.ps1, deployment automation)",
      "Laragon & XAMPP Local Development Environment",
      "SFTP Protocol & Remote Server Deployment",
      "Figma (.fig) Design System & Token Extraction",
      "Decompiler JAR (CFR / JD-GUI) untuk riset arsitektur bytecode"
    ]
  }
];
