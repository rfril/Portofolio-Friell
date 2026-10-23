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
    description: "Perjalanan bermula saat pandemi COVID-19. Menghabiskan waktu luang bermain Minecraft memunculkan rasa ingin tahu yang besar: bagaimana dunia virtual ini berjalan di balik layar, bagaimana mekanik permainan dirancang, dan bagaimana fitur game dapat dimodifikasi secara luas.",
    keyTakeaway: "Menyadari bahwa game bukan sekadar untuk dinikmati, melainkan dapat dipelajari logikanya, dimodifikasi, dan diciptakan."
  },
  {
    id: "era-bedrock",
    year: "2021 — 2022",
    phase: "Eksplorasi Minecraft Bedrock",
    title: "Mempelajari Addon & Logika Dasar",
    badge: "Otodidak",
    icon: "fa-solid fa-cubes",
    color: "#a855f7",
    description: "Ketertarikan berlanjut ke ekosistem Minecraft Bedrock Edition. Saya mulai membedah manifest, komponen behavior pack, dan resource pack secara mandiri. Mengamati struktur konfigurasi addon menjadi langkah awal saya dalam memahami hierarki data dan logika komputasi.",
    keyTakeaway: "Mengenal format data JSON, komponen entitas, serta dasar modding game C++ & Bedrock."
  },
  {
    id: "era-java-2023",
    year: "Awal 2023",
    phase: "Server Java & Dunia Plugin",
    title: "Eksperimen Server Minecraft Java",
    badge: "Java Exploration",
    icon: "fa-solid fa-server",
    color: "#f59e0b",
    description: "Pada awal tahun 2023, saya mulai mengelola server Minecraft Java Edition sendiri. Di sinilah saya pertama kali mengenal plugin server yang dibangun dengan Java. Daya tarik Java sangat kuat karena memungkinkan perubahan logika in-game secara terstruktur dan dinamis.",
    keyTakeaway: "Memahami arsitektur client-server, event handling game loop, dan struktur runtime Java."
  },
  {
    id: "era-modifikasi",
    year: "2023 — 2024",
    phase: "Pendalaman Java & PaperMC API",
    title: "Membedah Kode & Memodifikasi Plugin",
    badge: "Code Literacy",
    icon: "fa-solid fa-code-compare",
    color: "#10b981",
    description: "Sejalan dengan pembelajaran di jurusan RPL SMKN 71 Jakarta, saya melangkah lebih jauh: membaca kode sumber, mendalami PaperMC/Spigot API, mempelajari pola desain OOP, serta menyesuaikan logika plugin buatan komunitas agar selaras dengan kebutuhan server.",
    keyTakeaway: "Mengasah kemampuan membaca kode sumber, mengisolasi bug, dan menerapkan prinsip OOP Java."
  },
  {
    id: "era-mandiri-2026",
    year: "2025 — Sekarang",
    phase: "Pengembangan Sistem Mandiri",
    title: "Membangun Plugin Suite Sendiri dari Nol",
    badge: "Game Developer",
    icon: "fa-solid fa-rocket",
    color: "#f43f5e",
    description: "Memasuki tahap pengembangan mandiri secara penuh, saya merancang ekosistem server Apexsions dari nol: suite 9 plugin Java kustom, sistem 3 faksi kerajaan, dynamic economy, custom enchantments, integrasi database, dan pipeline otomatisasi kompilasi.",
    keyTakeaway: "Menguasai arsitektur modular, 9 suite plugin mandiri, integrasi SQLite/MySQL, dan portal web pendukung."
  }
];
