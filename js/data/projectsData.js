/**
 * DATA PROYEK TERVERIFIKASI DARI KODE SUMBER LOKAL
 * Proyek A: Apexsions (C:\Apex Plugin)
 * Proyek B: Sistem Kasir (C:\laragon\www\kasir-frontend & crud-laravel)
 * Proyek C: PoRoRo Ice Cream (C:\Project MKK Kel 6\frontend)
 */

export const projectsData = [
  {
    id: "apexsions",
    code: "PROJECT_A",
    title: "Apexsions Minecraft Server",
    subtitle: "Ekosistem Server Game RPG/MMO Teritorial & Dynamic Economy",
    category: "Game Development & Server Architecture",
    status: "Aktif & Dalam Pengembangan",
    heroImage: "assets/apexsions-preview.jpg",
    secondaryImage: "assets/apexsions-realms.jpg",
    icon: "fa-solid fa-dungeon",
    accentColor: "#f59e0b",
    
    sourceLocation: "C:\\Apex Plugin",
    
    liveLinks: {
      website: "https://web.apexsions.com",
      serverIp: "apexsions.com:32348",
      detailPage: "project-apexsions.html"
    },

    summary: "Proyek unggulan pribadi berupa server game Minecraft RPG berskala besar yang mengusung tema 3 faksi kerajaan berdaulat, simulasi ekonomi pasar bebas fluktuatif berbasis cuaca/bioma, sistem kedaulatan tanah dengan integrasi polygon BlueMap 3D, serta 9 modul plugin Java kustom mandiri.",

    techStack: [
      "Java 21 LTS",
      "PaperMC API",
      "Spigot Engine",
      "Event-Driven Architecture",
      "BlueMap 3D Engine",
      "SQLite & MySQL",
      "PowerShell Automation",
      "Kyori MiniMessage"
    ],

    verifiedFeatures: [
      {
        title: "Sistem 3 Kerajaan Berdaulat (Zenithar, Solterra, Sylvamoor)",
        desc: "Pemain memilih faksi kerajaan dengan atribut buff/debuff unik, proteksi PvP sesama warga di wilayah sendiri, dan titik spawn ibukota otomatis terintegrasi BlueMap."
      },
      {
        title: "Suite 9 Plugin Java Mandiri",
        desc: "ApexsionsCore, Chat, Economy (multi-currency Rupiah & Diamond), Battlepass 200 Level, Shop dinamis, Media multi-tile, CustomEnchants gacha, Crates, dan Fishing mini-game."
      },
      {
        title: "Simulasi Dynamic Economy & Price Clamping",
        desc: "Formula harga pasar bergerak dinamis mengikuti tren transaksi, cuaca in-game, dan bioma kerajaan dengan batas toleransi 85%-120% serta escrow claim lelang aman."
      },
      {
        title: "Kedaulatan Wilayah & Polygon BlueMap 3D",
        desc: "Sistem klaim tanah (/claim) dengan pajak upkeep harian progresif, visualisasi poligon wilayah transparan di browser web real-time BlueMap."
      },
      {
        title: "Crossplay Java & Bedrock Edition",
        desc: "Menghubungkan pemain komputer (PC Java) dan perangkat mobile/konsol (Bedrock) dalam satu dunia multiplayer tanpa batas."
      },
      {
        title: "Smart Turbo Multi-Compiler PowerShell",
        desc: "Skrip otomasi kompilasi cerdas build.ps1 untuk mem-build seluruh 9 plugin secara paralel dan deployment cepat."
      }
    ],

    myRole: "Lead Developer & Server Architect — Merancang konsep arsitektur dari nol, menulis kode logika dalam Java 21, menyeimbangkan algoritma ekonomi, dan mengelola alur operasional server.",

    technicalChallenges: "Memastikan performa server tetap stabil (20 TPS) saat menangani banyak event listener real-time, mengisolasi transaksi async ke database MySQL/SQLite tanpa race condition, dan sinkronisasi poligon peta 3D secara non-blocking."
  },

  {
    id: "kasir",
    code: "PROJECT_B",
    title: "POS Kasir Friel v2.0",
    subtitle: "Aplikasi Kasir Digital & Inventori Fullstack (Nuxt 4 + Laravel API)",
    category: "Fullstack Web Application",
    status: "Selesai (Diuji di Laragon)",
    heroImage: "assets/kasir-preview.png",
    secondaryImage: null,
    icon: "fa-solid fa-cash-register",
    accentColor: "#a855f7",

    sourceLocation: "C:\\laragon\\www\\kasir-frontend & C:\\laragon\\www\\crud-laravel",

    liveLinks: {
      localFrontend: "http://localhost:3000 (Nuxt)",
      localBackend: "http://crud-laravel.test/api (Laravel)",
      detailPage: "project-kasir.html"
    },

    summary: "Aplikasi Point of Sale (POS) modern yang dirancang untuk mengelola kasir toko retail, pencarian barang instan, kalkulasi subtotal dan diskon otomatis, pemotongan stok inventori, dan pencatatan riwayat transaksi penjualan terintegrasi REST API.",

    techStack: [
      "Nuxt 4",
      "Vue 3 (Composition API)",
      "Tailwind CSS",
      "Laravel 11 (PHP)",
      "RESTful API Protocol",
      "MySQL / SQLite",
      "Laragon Local Stack"
    ],

    verifiedFeatures: [
      {
        title: "Antarmuka Kasir Cepat (kasir.vue)",
        desc: "Layout kasir sentuh modern bertema gelap, filter barang cepat, keranjang belanja interaktif, kalkulasi kembalian otomatis, dan cetak struk."
      },
      {
        title: "Manajemen Data Barang CRUD (barang.vue & /barang)",
        desc: "Operasi Create, Read, Update, Delete produk lengkap dengan nama, kode barcode, harga beli/jual, kategori, dan batas stok minimum."
      },
      {
        title: "Riwayat Transaksi & Detail Penjualan (riwayat.vue & /riwayat)",
        desc: "Pencatatan nota transaksi, rekap total omset harian, rincian barang per transaksi, dan fitur audit/hapus data nota lama."
      },
      {
        title: "Arsitektur REST API Terpisah",
        desc: "Backend Laravel menyediakan endpoint terstruktur (/login, /barang, /transaksi, /riwayat, /data) dengan respons standar JSON dan validasi data request."
      }
    ],

    myRole: "Fullstack Developer — Mengembangkan antarmuka reaktif di Nuxt 4 dengan Tailwind CSS serta merancang controller backend Laravel untuk alur data transaksi dan manajemen stok.",

    technicalChallenges: "Sinkronisasi state keranjang belanja saat multi-item ditambahkan secara cepat, validasi ketersediaan stok produk sebelum transaksi difinalisasi, dan penanganan status error koneksi API dari client-side Nuxt."
  },

  {
    id: "pororo",
    code: "PROJECT_C",
    title: "PoRoRo Ice Cream",
    subtitle: "Website Showcase & Masterplan UI/UX Gelato Artisan Cakung",
    category: "Frontend Web & School Project (MKK Kel 6)",
    status: "Selesai (Diimplementasikan ke Nuxt 3)",
    heroImage: "assets/pororo-hero.png",
    secondaryImage: "assets/pororo-store.png",
    tertiaryImage: "assets/pororo-annotated.png",
    icon: "fa-solid fa-ice-cream",
    accentColor: "#ec4899",

    sourceLocation: "C:\\Project MKK Kel 6\\frontend",

    liveLinks: {
      figmaSource: "beranda.fig (PoRoRo Ice Cream Design)",
      detailPage: "project-pororo.html"
    },

    summary: "Proyek tugas sekolah Mata Pelajaran Konsentrasi Keahlian (MKK) Kelompok 6 berupa implementasi website gelato artisan Cakung berbasis Nuxt 3 & Vue 3 dari blueprint desain Figma. Menampilkan sistem token desain pastel, katalog 18 varian rasa, peta gerai dine-in, dan pemetaan customer journey.",

    techStack: [
      "Nuxt 3",
      "Vue 3 Modular Components",
      "Figma (.fig) Design System",
      "CSS Variables (Pastel Design Tokens)",
      "Google Fonts (Fraunces & DM Sans)",
      "Customer Journey Mapping"
    ],

    verifiedFeatures: [
      {
        title: "10 Komponen Modular Vue 3",
        desc: "Navbar kapsul melayang (glassmorphism blur 16px), HeroSection, FavoriteFlavors, IngredientPromise, WeekendPromotion, CraftProcess, CustomerStories, StoreLocation, OrderCta, dan SiteFooter."
      },
      {
        title: "Desain Berbasis Token Visual Figma",
        desc: "Penggunaan palet pastel terstandarisasi (Lavender, Peach, Sky Blue, Soft Yellow, Mint) dipadukan dengan tipografi serif elegan Fraunces dan sans-serif DM Sans."
      },
      {
        title: "Data-Driven Flavor Showcase",
        desc: "Katalog varian rasa dinamis (Pistachio, Strawberry Cheesecake, Matcha, Choco-Hazelnut, dll) menggunakan array reaktif Vue 3 yang siap diintegrasikan ke API eksternal."
      },
      {
        title: "Customer Journey & Delivery 30 Menit",
        desc: "Perancangan alur interaksi pengguna: Discovery dari ulasan sosial (rating 4.9 dari 2.400+ ulasan), eksplorasi bahan lokal susu Puncak, hingga opsi pemesanan cooler bag beku 30 menit."
      }
    ],

    myRole: "Frontend Developer & UI Implementer (Kelompok 6) — Mentranslasikan desain Figma beranda.fig ke arsitektur komponen Nuxt 3, mengoptimalkan tata letak responsif, dan menyusun styling token CSS.",

    technicalChallenges: "Memastikan centering sticky pill navbar tidak goyang saat scrolling, mempertahankan rasio visual aset fotografi gelato resolusi tinggi di berbagai ukuran layar smartphone, dan menyelaraskan nuansa artisan yang hangat."
  }
];
