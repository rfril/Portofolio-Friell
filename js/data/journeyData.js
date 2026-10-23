/**
 * DATA PERJALANAN KRONOLOGIS TERVERIFIKASI
 * Kronologi nyata eksplorasi coding dan modding game
 */

export const journeyTimeline = [
  {
    id: "era-covid",
    year: "2020 — 2021",
    phase: "Era Pandemi COVID-19",
    title: "Awal Ketertarikan Dunia Game",
    badge: "Eksplorasi Awal",
    icon: "fa-solid fa-gamepad",
    color: "#38bdf8",
    description: "Perjalanan saya bermula saat pandemi COVID-19. Menghabiskan waktu dengan sering bermain Minecraft membuka rasa penasaran saya: bagaimana dunia virtual ini bekerja di balik layar, bagaimana mekanik permainan dirancang, dan bagaimana game ini dapat dimodifikasi secara luas.",
    keyTakeaway: "Menyadari bahwa game bukan hanya untuk dinikmati, tetapi dapat dibongkar, dimodifikasi, dan diciptakan."
  },
  {
    id: "era-bedrock",
    year: "2021 — 2022",
    phase: "Eksplorasi Minecraft Bedrock",
    title: "Mempelajari Addon & Logika Dasar",
    badge: "Otodidak",
    icon: "fa-solid fa-cubes",
    color: "#a855f7",
    description: "Ketertarikan berkembang ke ekosistem Minecraft Bedrock Edition. Saya mulai membedah manifest, komponen behavior pack, dan resource pack secara mandiri. Mengamati cara kerja struktur addon dan eksperimen konfigurasi menjadi pintu gerbang pertama saya memahami logika komputasi secara otodidak.",
    keyTakeaway: "Mengenal hierarki data JSON, komponen entitas, serta dasar modding game C++ & Bedrock."
  },
  {
    id: "era-java-2023",
    year: "Awal 2023",
    phase: "Server Java & Dunia Plugin",
    title: "Eksperimen Server Minecraft Java",
    badge: "Java Exploration",
    icon: "fa-solid fa-server",
    color: "#f59e0b",
    description: "Pada awal tahun 2023, saya mulai mencoba membuat dan mengelola server Minecraft Java Edition sendiri. Di sinilah saya pertama kali mengenal plugin server yang dibangun menggunakan bahasa pemrograman Java. Daya tarik Java langsung terasa karena mampu mengubah perilaku sistem in-game secara dinamis.",
    keyTakeaway: "Memahami arsitektur client-server, event handling game loop, dan struktur runtime Java."
  },
  {
    id: "era-modifikasi",
    year: "2023 — 2025",
    phase: "Proses Belajar & Modifikasi",
    title: "Membedah Kode & Memodifikasi Plugin",
    badge: "Code Literacy",
    icon: "fa-solid fa-code-compare",
    color: "#10b981",
    description: "Seiring berjalannya waktu di bangku sekolah RPL SMKN 71 Jakarta, saya mulai melangkah lebih jauh dari sekadar konfigurasi: membaca source code, melakukan dekompilasi untuk riset pola desain, memahami API Paper/Spigot, serta memodifikasi fungsionalitas plugin buatan orang lain agar sesuai dengan konsep server yang diinginkan.",
    keyTakeaway: "Mengasah kemampuan membaca kode orang lain, mengisolasi bug, dan memahami pola OOP Java."
  },
  {
    id: "era-mandiri-2026",
    year: "Pertengahan 2026",
    phase: "Pengembangan Mandiri",
    title: "Membangun Plugin Suite Sendiri dari Nol",
    badge: "Game Developer",
    icon: "fa-solid fa-rocket",
    color: "#f43f5e",
    description: "Memasuki pertengahan tahun 2026, saya melangkah penuh ke tahap pengembangan mandiri. Saya merancang arsitektur monorepo, sistem 3 faksi kerajaan, dynamic economy, custom enchantments, dan pipeline kompilasi otomatis untuk ekosistem server Apexsions tanpa bergantung pada paket plugin publik.",
    keyTakeaway: "Membangun arsitektur modular, 9 plugin suite mandiri, integrasi SQLite/MySQL, dan portal web."
  }
];
