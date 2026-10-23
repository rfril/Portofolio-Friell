# 🎮 The Developer's World — Interactive 3D Game Developer Portfolio

> **Website Portofolio 3D Interaktif Pribadi** terinspirasi oleh eksplorasi fisika Bruno Simon, dirancang dan dibangun dengan arsitektur modular, informasi proyek terverifikasi, dan estetika visual modern.

---

## 👤 1. Profil Pengembang (Terverifikasi)

- **Nama Lengkap:** Rafriel Raditya Widodo (sering dipanggil Rafriel / Friel)
- **Status:** Siswa SMK Negeri 71 Jakarta
- **Jurusan:** Rekayasa Perangkat Lunak (RPL)
- **Cita-cita:** Game Developer & Systems Engineer
- **Kontak Terverifikasi:**
  - WhatsApp: `+62 858-8316-1047` *(Berdasarkan biodata tugas sekolah SMKN 71 Jakarta)*
  - Website Server: [web.apexsions.com](https://web.apexsions.com)
  - Alamat Server Minecraft: `apexsions.com:32348` *(Java & Bedrock Crossplay)*
  - GitHub: [github.com/Rafriel](https://github.com/Rafriel)

---

## 🧭 2. Kronologi Perjalanan (The Journey)

1. **2020 — 2021 (Era Pandemi COVID-19):** Memulai ketertarikan pada game melalui Minecraft; rasa penasaran tentang bagaimana logika game berjalan dan dapat dimodifikasi.
2. **2021 — 2022 (Eksplorasi Minecraft Bedrock):** Belajar otodidak membedah behavior pack, resource pack, file JSON, dan dasar modding C++.
3. **Awal 2023 (Eksperimen Server Java):** Membuat server Minecraft Java Edition dan mengenal plugin berbasis bahasa pemrograman Java.
4. **2023 — 2025 (Belajar Logika OOP & Modifikasi Plugin):** Membaca source code, dekompilasi JAR, memahami PaperMC/Spigot API, serta memodifikasi fungsionalitas plugin buatan orang lain.
5. **Pertengahan 2026 (Pengembangan Mandiri):** Merancang arsitektur ekosistem server mandiri, membangun 9 modul plugin Java sendiri dari nol untuk server **Apexsions**, serta otomasi compiler PowerShell.

---

## 📦 3. Ringkasan 3 Proyek Terverifikasi

### 👑 Proyek A — Apexsions Minecraft Server
- **Lokasi Sumber:** `C:\Apex Plugin`
- **Kategori:** Game Development & Server Architecture
- **Teknologi:** Java 21 LTS, PaperMC API, Spigot Engine, BlueMap 3D, SQLite/MySQL, PowerShell Automation, Kyori MiniMessage.
- **Fitur Unggulan:**
  - **Sistem 3 Kerajaan Berdaulat:** Faksi *Zenithar*, *Solterra*, dan *Sylvamoor* dengan buff/debuff atribut dan proteksi teritorial wilayah.
  - **9 Plugin Java Mandiri:** `ApexsionsCore`, `Chat`, `Economy` (Rupiah & Diamond), `Battlepass` 200 Level, `Shop` Dinamis, `Media`, `CustomEnchants`, `Crates`, dan `Fishing` Active Reel.
  - **Simulasi Dynamic Economy:** Formula harga barang fluktuatif berbasis cuaca dan bioma dengan price clamping (85%-120%) serta escrow auction house.
  - **Smart Turbo Compiler:** Otomasi kompilasi paralel melalui `build.ps1`.

### 🛒 Proyek B — POS Kasir Friel v2.0
- **Lokasi Sumber:** `C:\laragon\www\kasir-frontend` & `C:\laragon\www\crud-laravel`
- **Kategori:** Fullstack Web Application
- **Teknologi:** Nuxt 4, Vue 3 (Composition API), Tailwind CSS, Laravel 11 (PHP 8.2+), RESTful API, MySQL/SQLite.
- **Fitur Unggulan:**
  - **Antarmuka Kasir Cepat (`kasir.vue`):** Layout modern bertema gelap, filter instan, kalkulasi subtotal dan diskon otomatis secara real-time.
  - **CRUD Manajemen Produk (`barang.vue`):** Endpoint `/barang` untuk kelola harga modal, harga jual, dan stok minimum.
  - **Riwayat Penjualan (`riwayat.vue`):** Rekapitulasi transaksi nota dan audit penjualan harian.

### 🍨 Proyek C — PoRoRo Ice Cream
- **Lokasi Sumber:** `C:\Project MKK Kel 6\frontend`
- **Kategori:** Frontend Web & School Project (MKK Kelompok 6 SMKN 71 Jakarta)
- **Teknologi:** Nuxt 3, Vue 3 Modular Components, Figma (.fig) Design Tokens, Google Fonts (Fraunces & DM Sans).
- **Fitur Unggulan:**
  - **10 Komponen Modular Vue 3:** Centered floating pill navbar (glassmorphism blur 16px), HeroSection, FavoriteFlavors, IngredientPromise, WeekendPromotion, CraftProcess, CustomerStories, StoreLocation, OrderCta, dan SiteFooter.
  - **Brand Gelato Cakung:** Menampilkan katalog 18 rasa dengan susu lokal Puncak dan buah segar.
  - **Customer Journey Mapping:** Alur pengalaman pengguna dari ulasan media sosial (rating 4.9 dari 2.400+ ulasan) hingga pengiriman cooler bag beku 30 menit.

---

## 🏛️ 4. Arsitektur Perangkat Lunak Modular

Proyek ini dibangun secara modular menggunakan standar **ES Modules** tanpa file monolitik raksasa:

```text
C:\Portofolio Pribadi Friel\
├── index.html                  # Viewport Game 3D & Viewport Dokumen Biasa
├── project-apexsions.html      # Halaman detail mendalam Proyek Apexsions
├── project-kasir.html          # Halaman detail mendalam Proyek Kasir
├── project-pororo.html         # Halaman detail mendalam Proyek PoRoRo
├── JALANKAN-PORTOFOLIO.bat     # Launcher sekali klik di Windows
├── package.json                # Skrip npm dev & serve
├── README.md                   # Dokumentasi teknis proyek
├── assets/                     # Tangkapan layar proyek & foto profil
├── css/
│   ├── reset.css               # Design system tokens, variabel warna & typography
│   ├── game3d.css              # Viewport canvas 3D, HUD, speedo, announcer, mobile buttons
│   ├── modal.css               # Interactive exhibit modal dialogs & tab navigation
│   └── classic.css             # Layout dokumen portofolio aksesibilitas
└── js/
    ├── lib/
    │   └── three.min.js        # Three.js offline lokal mandiri
    ├── data/
    │   ├── profileData.js      # Biodata terverifikasi
    │   ├── journeyData.js      # Milestone kronologis
    │   ├── projectsData.js     # Spesifikasi 3 proyek
    │   ├── skillsData.js       # Keahlian teknis faktual
    │   └── contactData.js      # Saluran kontak terverifikasi
    ├── core/
    │   ├── Config.js           # Tuning parameter kecepatan, fisika, kamera & dunia
    │   ├── StateManager.js     # Finite State Machine (Loading, Playing, Interacting, Fallback)
    │   ├── AudioManager.js     # Web Audio API Procedural Synthesizer
    │   ├── InputManager.js     # Abstraksi input keyboard desktop & sentuh mobile
    │   ├── CameraController.js # Kamera isometrik, chase belakang mobil, dan top-down
    │   └── Game.js             # Master render loop & WebGL context loss recovery
    ├── entities/
    │   ├── CarController.js    # Kinematika mobil mainan, suspensi roll & rotasi 4 roda
    │   └── ParticleSystem.js   # Asap knalpot, debu skid ban, percikan diamond & tumbukan
    ├── world/
    │   ├── CollisionSystem.js  # Deteksi tumbukan AABB dan lingkaran dengan pantulan lembut
    │   ├── Environment.js      # Landasan, jaringan jalan raya, pepohonan, lampu, pagar, awan
    │   └── World.js            # Koordinator zona & populasi objek
    ├── zones/
    │   ├── BaseZone.js         # Kelas induk zona dengan cincin berdenyut & prompt [E]
    │   ├── SpawnZone.js        # Area 1: Titik awal & panduan kontrol
    │   ├── JourneyZone.js      # Area 2: Monumen linimasa kronologis
    │   ├── ApexsionsZone.js    # Area 3A: Benteng Obsidian & Bola Hologram BlueMap
    │   ├── KasirZone.js        # Area 3B: Digital Mart & Hologram POS Terminal
    │   ├── PororoZone.js       # Area 3C: Kafe Gelato & Monumen Es Krim Cone
    │   ├── SkillsZone.js       # Area 4: Laboratorium 6 pilar kristal komputasi
    │   ├── AboutZone.js        # Area 5: Studio kerja komputer & orb soft skills
    │   └── ContactZone.js      # Area 6: Menara transmisi satelit & kotak surat
    ├── collectibles/
    │   └── CollectibleManager.js # 15 Diamond tersembunyi dengan efek suara & partikel
    └── ui/
        ├── UIManager.js        # Speedometer, counter diamond, dan announcer
        ├── ModalManager.js     # In-game tabs switcher & content renderer
        └── MobileControls.js   # Tombol virtual layar sentuh
```

---

## 🕹️ 5. Mekanik Gameplay & Kontrol

### Desktop
- **W / Panah Atas:** Gas / Maju
- **S / Panah Bawah:** Rem / Mundur
- **A / Panah Kiri:** Belok Kiri
- **D / Panah Kanan:** Belok Kanan
- **Spasi:** Handbrake
- **E:** Interaksi objek proyek / zona
- **P:** Buka Buku Panduan Portofolio
- **C:** Ganti Sudut Pandang Kamera *(Isometrik $\rightarrow$ Belakang Mobil $\rightarrow$ Top-Down)*
- **H:** Bunyikan Klakson *(Dual-tone cheerful beep)*
- **R:** Reset posisi mobil kembali ke Spawn Sanctum
- **Esc:** Tutup dialog modal / pause

### Mobile / Layar Sentuh
- Kluster Tombol Kiri: **Belok Kiri** & **Belok Kanan**
- Kluster Tombol Kanan: **Gas**, **Rem**, **Tombol Interaksi [E]**, dan **Klakson**

---

## 🔊 6. Procedural Web Audio API

Website ini menggunakan sintesis gelombang audio prosedural native browser:
- **Suara Mesin Mobil:** Oscillator sawtooth dengan filter lowpass modulasi RPM dinamis.
- **Klakson Mobil:** Harmoni nada F chord (349.2 Hz & 440.0 Hz).
- **Chime Diamond:** Tangga nada sparkling ascending saat mengoleksi kristal.
- **Tumbukan:** Gelombang square frequency drop saat menabrak rintangan.
- **Mute Toggle:** Pengaturan tersimpan di `localStorage`.

---

## 🚀 7. Cara Menjalankan Proyek

### Cara 1: Menggunakan Launcher Batch (Paling Praktis di Windows)
Cukup klik dua kali file:
```cmd
C:\Portofolio Pribadi Friel\JALANKAN-PORTOFOLIO.bat
```
Browser akan otomatis membuka `http://localhost:3000`.

### Cara 2: Menggunakan Node.js / npx
```bash
cd "C:\Portofolio Pribadi Friel"
npm run dev
# atau:
npx serve -l 3000 .
```

### Cara 3: Menggunakan Python HTTP Server
```bash
cd "C:\Portofolio Pribadi Friel"
python -m http.server 3000
```

---

## ♿ 8. Aksesibilitas & Mode Non-Gameplay

Untuk pengguna yang menggunakan perangkat berspesifikasi rendah atau ingin langsung membaca portofolio secara cepat, klik tombol **"Mode Dokumen"** di pojok kanan atas HUD atau tambahkan hash `#classic` pada URL:
`http://localhost:3000/#classic`
Semua informasi disajikan dalam bentuk halaman web profesional yang terstruktur dan responsif.
