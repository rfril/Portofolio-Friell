/**
 * IN-GAME MODAL & EXHIBIT MANAGER (PROGRESSION & EXPLORATION ENABLED)
 * - Proyek disatukan ke dalam 1 halaman overview.
 * - Informasi lengkap proyek terbuka saat tombol "Buka Info Lengkap" ditekan.
 * - Sistem penguncian eksplorasi: Pengguna harus menjelajahi dunia 3D untuk membuka informasi.
 */

import { GameStates } from "../core/StateManager.js";
import { profileData } from "../data/profileData.js";
import { journeyTimeline } from "../data/journeyData.js";
import { projectsData } from "../data/projectsData.js";
import { technicalSkills } from "../data/skillsData.js";
import { contactData } from "../data/contactData.js";

export class ModalManager {
  constructor(stateManager, audioManager, progressionManager) {
    this.state = stateManager;
    this.audio = audioManager;
    this.progression = progressionManager;

    this.backdrop = document.getElementById("projectModalBackdrop");
    this.closeBtn = document.getElementById("modalCloseBtn");
    this.navTabs = document.getElementById("modalNavTabs");
    this.contentArea = document.getElementById("modalContentArea");

    this.activeTab = "about";
    this.selectedProjectId = null; // Ketika memilih 1 proyek untuk dibuka lengkap

    this.bindEvents();
  }

  bindEvents() {
    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }

    // Click outside backdrop to close
    if (this.backdrop) {
      this.backdrop.addEventListener("click", (e) => {
        if (e.target === this.backdrop) this.close();
      });
    }

    // Tab buttons
    if (this.navTabs) {
      this.navTabs.addEventListener("click", (e) => {
        const btn = e.target.closest(".modal-tab-btn");
        if (btn && btn.dataset.tabId) {
          this.switchTab(btn.dataset.tabId);
        }
      });
    }

    // Event delegation di content area untuk tombol proyek & aksi
    if (this.contentArea) {
      this.contentArea.addEventListener("click", (e) => {
        // Klik "Buka Info Lengkap" pada kartu proyek
        const openProjBtn = e.target.closest(".btn-open-project");
        if (openProjBtn && openProjBtn.dataset.projectId) {
          this.selectedProjectId = openProjBtn.dataset.projectId;
          this.renderContent();
          if (this.audio) this.audio.playInteractSound();
          return;
        }

        // Klik "Kembali ke Daftar Proyek"
        const backProjBtn = e.target.closest(".btn-back-to-projects");
        if (backProjBtn) {
          this.selectedProjectId = null;
          this.renderContent();
          if (this.audio) this.audio.playInteractSound();
          return;
        }

        // Buka Semua Area (Mode Aksesibilitas / Evaluator)
        const unlockAllBtn = e.target.closest(".btn-unlock-all-evaluator");
        if (unlockAllBtn) {
          this.progression.unlockAll();
          this.renderTabs();
          this.renderContent();
          if (this.audio) this.audio.playDiscoverySound();
          return;
        }

        // Reset Progres
        const resetProgBtn = e.target.closest(".btn-reset-progression");
        if (resetProgBtn) {
          this.progression.resetProgress();
          this.selectedProjectId = null;
          this.renderTabs();
          this.renderContent();
          if (this.audio) this.audio.playResetSound();
          return;
        }
      });
    }

    // Listen to progression changes
    window.addEventListener("zoneDiscovered", () => {
      this.renderTabs();
      if (this.isOpen()) {
        this.renderContent();
      }
    });

    window.addEventListener("allZonesUnlocked", () => {
      this.renderTabs();
      if (this.isOpen()) {
        this.renderContent();
      }
    });
  }

  open(preferredZoneOrTab = "about") {
    // Jika pemain berinteraksi langsung di zona proyek 3D tertentu,
    // langsung buka proyek tersebut secara mendalam!
    if (["apexsions", "kasir", "pororo"].includes(preferredZoneOrTab)) {
      this.activeTab = "projects";
      this.selectedProjectId = preferredZoneOrTab;
      this.progression.unlockZone(preferredZoneOrTab);
    } else if (preferredZoneOrTab === "spawn") {
      this.activeTab = "about";
      this.selectedProjectId = null;
    } else {
      this.activeTab = preferredZoneOrTab || "about";
      this.selectedProjectId = null;
    }

    this.renderTabs();
    this.renderContent();

    if (this.backdrop) {
      this.backdrop.classList.add("visible");
    }

    this.state.setState(GameStates.INTERACTING);
    if (this.audio) this.audio.playInteractSound();
  }

  close() {
    if (this.backdrop) {
      this.backdrop.classList.remove("visible");
    }
    this.selectedProjectId = null;
    this.state.setState(GameStates.PLAYING);
  }

  isOpen() {
    return this.backdrop && this.backdrop.classList.contains("visible");
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    this.selectedProjectId = null; // Reset pilihan proyek jika pindah tab
    this.renderTabs();
    this.renderContent();
    if (this.audio) this.audio.playInteractSound();
  }

  renderTabs() {
    if (!this.navTabs) return;

    const stats = this.progression.getStats();

    // Susunan standar portofolio: Tentang Saya -> Keahlian -> Proyek -> Linimasa -> Kontak -> Radar
    const tabs = [
      { id: "about", icon: "fa-solid fa-user-astronaut text-indigo", label: "Tentang Saya", zoneId: "about" },
      { id: "skills", icon: "fa-solid fa-laptop-code text-green", label: "Skills Lab", zoneId: "skills" },
      { id: "projects", icon: "fa-solid fa-folder-open text-gold", label: "Proyek Portofolio", zoneId: null },
      { id: "journey", icon: "fa-solid fa-route text-cyan", label: "Linimasa Perjalanan", zoneId: "journey" },
      { id: "contact", icon: "fa-solid fa-satellite-dish text-rose", label: "Kontak", zoneId: "contact" },
      { id: "radar", icon: "fa-solid fa-compass text-cyan", label: `Radar (${stats.discoveredCount}/8)`, zoneId: null }
    ];

    this.navTabs.innerHTML = tabs.map(t => {
      const isLocked = t.zoneId ? !this.progression.isUnlocked(t.zoneId) : false;
      const lockIcon = isLocked ? `<i class="fa-solid fa-lock text-muted" style="font-size: 0.72rem; margin-left: 0.25rem;"></i>` : "";
      return `
        <button class="modal-tab-btn ${this.activeTab === t.id ? 'active' : ''} ${isLocked ? 'tab-locked' : ''}" data-tab-id="${t.id}">
          <i class="${t.icon}"></i>
          <span>${t.label}</span>
          ${lockIcon}
        </button>
      `;
    }).join("");
  }

  renderContent() {
    if (!this.contentArea) return;

    if (this.activeTab === "projects") {
      if (this.selectedProjectId) {
        this.renderSingleProjectDetail(this.selectedProjectId);
      } else {
        this.renderUnifiedProjectsList();
      }
    } else if (this.activeTab === "journey") {
      if (this.progression.isUnlocked("journey")) {
        this.renderJourneyTimeline();
      } else {
        this.renderLockedZoneView("journey");
      }
    } else if (this.activeTab === "skills") {
      if (this.progression.isUnlocked("skills")) {
        this.renderSkillsLab();
      } else {
        this.renderLockedZoneView("skills");
      }
    } else if (this.activeTab === "about") {
      if (this.progression.isUnlocked("about")) {
        this.renderAboutMe();
      } else {
        this.renderLockedZoneView("about");
      }
    } else if (this.activeTab === "contact") {
      if (this.progression.isUnlocked("contact")) {
        this.renderContact();
      } else {
        this.renderLockedZoneView("contact");
      }
    } else if (this.activeTab === "radar") {
      this.renderExplorationRadar();
    } else {
      this.renderUnifiedProjectsList();
    }
  }

  // 1. TAMPILAN PROYEK TERPADU (SEMUA 3 PROYEK DALAM 1 HALAMAN)
  renderUnifiedProjectsList() {
    const cardsHtml = projectsData.map(p => {
      const isUnlocked = this.progression.isUnlocked(p.id);

      if (!isUnlocked) {
        const zoneInfo = this.progression.getZoneInfo(p.id);
        return `
          <div class="project-summary-card card-locked">
            <div class="lock-overlay-content">
              <div class="lock-icon-badge"><i class="fa-solid fa-lock"></i></div>
              <div class="lock-card-info">
                <span class="modal-badge badge-locked">🔒 Belum Ditemukan</span>
                <h3 class="lock-title">${p.title}</h3>
                <p class="lock-category">${p.category}</p>
                <div class="lock-clue-box">
                  <i class="fa-solid fa-location-arrow text-gold"></i>
                  <span><strong>Petunjuk Eksplorasi:</strong> ${zoneInfo ? zoneInfo.clue : 'Jelajahi dunia 3D untuk menemukan zona ini.'}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Proyek Terbuka
      const techBadges = p.techStack.slice(0, 4).map(t => `<span class="modal-tech-badge">${t}</span>`).join("");

      return `
        <div class="project-summary-card">
          <div class="project-summary-img-wrap">
            <img src="${p.heroImage}" alt="${p.title}" class="project-summary-img">
            <span class="summary-status-pill"><i class="fa-solid fa-check"></i> Selesai &amp; Teruji</span>
          </div>
          <div class="project-summary-body">
            <div class="modal-badge-group">
              <span class="modal-badge">${p.code}</span>
              <span class="modal-badge badge-accent">${p.category}</span>
            </div>
            <h3 class="summary-project-title">${p.title}</h3>
            <p class="summary-project-subtitle">${p.subtitle}</p>
            <p class="summary-project-desc">${p.summary}</p>
            <div class="modal-tech-cloud" style="margin-bottom: 1.25rem;">${techBadges}</div>
            
            <div class="summary-actions-bar">
              <button class="btn btn-primary btn-open-project" data-project-id="${p.id}">
                <i class="fa-solid fa-circle-info"></i>
                <span>Buka Info Lengkap</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
              ${p.liveLinks.website ? `<a href="${p.liveLinks.website}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm"><i class="fa-solid fa-globe"></i> Website</a>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join("");

    this.contentArea.innerHTML = `
      <div class="modal-projects-unified-view">
        <div class="modal-project-header">
          <span class="modal-badge badge-accent">Koleksi Portofolio</span>
          <h2 class="modal-title">Daftar Proyek Unggulan</h2>
          <p class="modal-subtitle">Seluruh proyek utama dikelompokkan di sini. Kunjungi bangunan 3D di peta untuk membuka arsip proyek yang terkunci, lalu klik <strong>"Buka Info Lengkap"</strong> untuk rincian mendalam.</p>
        </div>

        <div class="projects-unified-grid">${cardsHtml}</div>
      </div>
    `;
  }

  // 2. TAMPILAN DETAIL LENGKAP SATU PROYEK (DENGAN TOMBOL KEMBALI)
  renderSingleProjectDetail(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    let galleryHtml = "";
    if (project.heroImage) {
      galleryHtml += `
        <div class="modal-gallery-card">
          <img src="${project.heroImage}" alt="${project.title}" class="modal-img">
        </div>
      `;
    }
    if (project.secondaryImage) {
      galleryHtml += `
        <div class="modal-gallery-card">
          <img src="${project.secondaryImage}" alt="${project.title} Preview" class="modal-img">
        </div>
      `;
    }
    if (project.tertiaryImage) {
      galleryHtml += `
        <div class="modal-gallery-card">
          <img src="${project.tertiaryImage}" alt="${project.title} Dokumentasi" class="modal-img">
        </div>
      `;
    }

    const techBadges = project.techStack.map(t => `<span class="modal-tech-badge">${t}</span>`).join("");

    const featuresList = project.verifiedFeatures.map(f => `
      <div class="modal-feature-item">
        <strong><i class="fa-solid fa-check text-cyan"></i> ${f.title}:</strong>
        <p>${f.desc}</p>
      </div>
    `).join("");

    let linksHtml = "";
    if (project.liveLinks.website) {
      linksHtml += `<a href="${project.liveLinks.website}" target="_blank" rel="noopener" class="btn btn-primary btn-sm"><i class="fa-solid fa-globe"></i> Buka ${project.liveLinks.website}</a>`;
    }
    if (project.liveLinks.serverIp) {
      linksHtml += `<div class="server-ip-pill"><span class="ip-label">IP:</span> <code>${project.liveLinks.serverIp}</code></div>`;
    }
    if (project.liveLinks.detailPage) {
      linksHtml += `<a href="${project.liveLinks.detailPage}" target="_blank" class="btn btn-secondary btn-sm"><i class="fa-solid fa-file-lines"></i> Buka di Tab Baru</a>`;
    }

    this.contentArea.innerHTML = `
      <div class="modal-project-detail-view">
        <!-- Tombol Kembali ke Daftar Proyek -->
        <div style="margin-bottom: 1.25rem;">
          <button class="btn btn-secondary btn-sm btn-back-to-projects">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Kembali ke Daftar Seluruh Proyek</span>
          </button>
        </div>

        <div class="modal-project-header">
          <div class="modal-badge-group">
            <span class="modal-badge">${project.code}</span>
            <span class="modal-badge badge-accent">${project.category}</span>
            <span class="modal-badge badge-status">${project.status}</span>
          </div>
          <h2 class="modal-title">${project.title}</h2>
          <p class="modal-subtitle">${project.subtitle}</p>
          <div class="modal-links-row">${linksHtml}</div>
        </div>

        <div class="modal-gallery-grid">${galleryHtml}</div>

        <div class="modal-section-card">
          <h3><i class="fa-solid fa-circle-info text-cyan"></i> Ringkasan &amp; Arsitektur Proyek</h3>
          <p>${project.summary}</p>
          <p class="source-verified-pill"><i class="fa-solid fa-layer-group"></i> Arsitektur: <code>${project.sourceLocation}</code></p>
        </div>

        <div class="modal-section-card">
          <h3><i class="fa-solid fa-microchip text-gold"></i> Teknologi & Arsitektur</h3>
          <div class="modal-tech-cloud">${techBadges}</div>
        </div>

        <div class="modal-section-card">
          <h3><i class="fa-solid fa-list-check text-green"></i> Fitur-Fitur Terverifikasi</h3>
          <div class="modal-features-grid">${featuresList}</div>
        </div>

        <div class="modal-section-card">
          <h3><i class="fa-solid fa-user-gear text-purple"></i> Peran Pribadi & Kontribusi</h3>
          <p>${project.myRole}</p>
        </div>

        <div class="modal-section-card">
          <h3><i class="fa-solid fa-triangle-exclamation text-rose"></i> Tantangan Teknis</h3>
          <p>${project.technicalChallenges}</p>
        </div>

        <!-- Tombol Kembali Bawah -->
        <div style="margin-top: 1.5rem; text-align: right;">
          <button class="btn btn-secondary btn-back-to-projects">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Kembali ke Daftar Proyek</span>
          </button>
        </div>
      </div>
    `;
  }

  // 3. TAMPILAN AREA YANG MASIH TERKUNCI (BELUM DIEKSPLORASI)
  renderLockedZoneView(zoneId) {
    const info = this.progression.getZoneInfo(zoneId);

    this.contentArea.innerHTML = `
      <div class="modal-locked-zone-view">
        <div class="locked-zone-box">
          <div class="lock-badge-circle">
            <i class="fa-solid fa-lock"></i>
          </div>
          <h2 class="locked-view-title">${info ? info.name : 'Area Terkunci'}</h2>
          <span class="modal-badge badge-locked" style="margin-bottom: 1rem;">🔒 Informasi Belum Terbuka</span>
          
          <p class="locked-view-desc">
            Informasi pada bagian ini belum dapat diakses. Anda harus mengendarai mobil dan menjelajahi dunia 3D untuk menemukan lokasi fisiknya.
          </p>

          <div class="locked-clue-card">
            <i class="fa-solid fa-compass text-gold" style="font-size: 1.5rem;"></i>
            <div>
              <strong>Petunjuk Arah Penjelajahan:</strong>
              <p>${info ? info.clue : 'Cari landmark di dunia 3D.'}</p>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: center; margin-top: 1.5rem;">
            <button class="btn btn-primary" onclick="document.getElementById('modalCloseBtn').click();">
              <i class="fa-solid fa-car-side"></i>
              <span>Kembali & Jelajahi Sekarang</span>
            </button>
            <button class="btn btn-secondary btn-unlock-all-evaluator" title="Buka seluruh informasi tanpa eksplorasi">
              <i class="fa-solid fa-unlock-keyhole"></i>
              <span>Buka Semua (Mode Evaluator)</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 4. RADAR & STATUS EKSPLORASI DUNIA
  renderExplorationRadar() {
    const stats = this.progression.getStats();

    const zonesListHtml = Object.values(this.progression.zoneInfo).map(z => {
      const isFound = this.progression.isUnlocked(z.id);
      return `
        <div class="radar-zone-item ${isFound ? 'found' : 'not-found'}">
          <div class="radar-zone-icon"><i class="${z.icon}"></i></div>
          <div class="radar-zone-details">
            <div class="radar-zone-name">${z.name}</div>
            <div class="radar-zone-cat">${z.category}</div>
            <div class="radar-zone-clue">${isFound ? '✅ Telah Ditemukan' : '🔒 ' + z.clue}</div>
          </div>
          <span class="radar-status-badge ${isFound ? 'badge-found' : 'badge-not-found'}">
            ${isFound ? 'Ditemukan' : 'Terkunci'}
          </span>
        </div>
      `;
    }).join("");

    this.contentArea.innerHTML = `
      <div class="modal-radar-view">
        <div class="modal-project-header">
          <span class="modal-badge badge-accent">Radar Eksplorasi</span>
          <h2 class="modal-title">Status Penjelajahan Dunia</h2>
          <p class="modal-subtitle">Jelajahi seluruh area di Developer's World untuk membuka arsip portofolio secara lengkap.</p>
        </div>

        <div class="radar-progress-bar-wrap">
          <div class="radar-progress-bar-fill" style="width: ${stats.percent}%;"></div>
          <span class="radar-progress-text">${stats.discoveredCount} dari ${stats.totalCount} Area Ditemukan (${stats.percent}%)</span>
        </div>

        <div class="radar-zones-list">${zonesListHtml}</div>

        <div class="radar-evaluator-card">
          <div>
            <h4><i class="fa-solid fa-key text-gold"></i> Mode Aksesibilitas Langsung (Evaluator / Guru)</h4>
            <p>Ingin memeriksa seluruh informasi portofolio langsung tanpa harus bermain game?</p>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm btn-unlock-all-evaluator">
              <i class="fa-solid fa-unlock-keyhole"></i>
              <span>Buka Semua Area</span>
            </button>
            <button class="btn btn-secondary btn-sm btn-reset-progression">
              <i class="fa-solid fa-rotate-left"></i>
              <span>Reset Progres</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 5. TIMELINE
  renderJourneyTimeline() {
    const itemsHtml = journeyTimeline.map(j => `
      <div class="modal-journey-item">
        <div class="journey-node" style="border-color: ${j.color};">
          <i class="${j.icon}" style="color: ${j.color};"></i>
        </div>
        <div class="journey-card">
          <div class="journey-year-tag">${j.year} &bull; ${j.badge}</div>
          <h4 class="journey-title">${j.title}</h4>
          <p class="journey-desc">${j.description}</p>
          <div class="journey-takeaway">
            <strong>Poin Penting:</strong> ${j.keyTakeaway}
          </div>
        </div>
      </div>
    `).join("");

    this.contentArea.innerHTML = `
      <div class="modal-journey-view">
        <div class="modal-project-header">
          <span class="modal-badge badge-accent">Linimasa Pembelajaran</span>
          <h2 class="modal-title">Perjalanan Belajar: Dari Pemain Menjadi Kreator</h2>
          <p class="modal-subtitle">Tahapan eksplorasi dari rasa ingin tahu bermain game hingga merancang arsitektur server dan aplikasi mandiri.</p>
        </div>
        <div class="modal-journey-timeline">${itemsHtml}</div>
      </div>
    `;
  }

  // 6. SKILLS
  renderSkillsLab() {
    const skillsHtml = technicalSkills.map(s => `
      <div class="modal-skill-card">
        <div class="skill-card-top">
          <div class="skill-icon-wrap" style="background: ${s.badgeColor}22; border-color: ${s.badgeColor};">
            <i class="${s.icon}" style="color: ${s.badgeColor};"></i>
          </div>
          <div>
            <h4 class="skill-title">${s.name}</h4>
            <span class="skill-status-tag">${s.status}</span>
          </div>
        </div>
        <p class="skill-usage"><strong>Penggunaan:</strong> ${s.practicalUsage}</p>
        <p class="skill-project"><strong>Kaitan Proyek:</strong> ${s.projectRelation}</p>
        <ul class="skill-caps-list">
          ${s.keyCapabilities.map(c => `<li><i class="fa-solid fa-angle-right text-cyan"></i> ${c}</li>`).join("")}
        </ul>
      </div>
    `).join("");

    this.contentArea.innerHTML = `
      <div class="modal-skills-view">
        <div class="modal-project-header">
          <span class="modal-badge badge-accent">Skills Lab</span>
          <h2 class="modal-title">Kemampuan Teknis &amp; Bukti Penerapan</h2>
          <p class="modal-subtitle">Daftar teknologi berdasarkan kompetensi dan implementasi nyata pada proyek yang telah dibangun.</p>
        </div>
        <div class="modal-skills-grid">${skillsHtml}</div>
      </div>
    `;
  }

  // 7. ABOUT ME
  renderAboutMe() {
    const softSkillsHtml = profileData.softSkills.map(s => `
      <div class="modal-soft-card">
        <i class="${s.icon} soft-icon text-cyan"></i>
        <div>
          <h4>${s.name}</h4>
          <p>${s.desc}</p>
        </div>
      </div>
    `).join("");

    this.contentArea.innerHTML = `
      <div class="modal-about-view">
        <div class="modal-about-top">
          <div class="modal-code-badge">
            <div class="modal-code-badge-bar">
              <span class="dot dot-red"></span>
              <span class="dot dot-yellow"></span>
              <span class="dot dot-green"></span>
              <span class="badge-title"><i class="fa-brands fa-java text-gold"></i> RafrielProfile.java</span>
            </div>
            <pre class="modal-code-badge-body"><code><span class="code-kw">class</span> <span class="code-class">Rafriel</span> {
  <span class="code-type">String</span> role = <span class="code-str">"Game Developer"</span>;
  <span class="code-type">String</span> school = <span class="code-str">"SMKN 71 Jakarta (RPL)"</span>;
  <span class="code-type">double</span> targetTPS = <span class="code-num">20.0</span>;
  <span class="code-type">int</span> customPlugins = <span class="code-num">9</span>;
}</code></pre>
          </div>
          <div>
            <span class="modal-badge badge-accent">${profileData.status}</span>
            <h2 class="modal-title">${profileData.fullName}</h2>
            <p class="modal-subtitle">${profileData.major} &bull; Target: <strong>${profileData.goal}</strong></p>
            <p class="modal-tagline">${profileData.tagline}</p>
          </div>
        </div>

        <div class="modal-section-card">
          <h3><i class="fa-solid fa-address-card text-gold"></i> Biografi Singkat</h3>
          <p>${profileData.summary}</p>
        </div>

        <div class="modal-section-card">
          <h3><i class="fa-solid fa-brain text-purple"></i> Soft Skills & Karakter Kerja</h3>
          <div class="modal-soft-grid">${softSkillsHtml}</div>
        </div>
      </div>
    `;
  }

  // 8. CONTACT
  renderContact() {
    const channelsHtml = contactData.verifiedChannels.map(c => `
      <a href="${c.link}" target="_blank" rel="noopener" class="modal-contact-row" style="border-left-color: ${c.color};">
        <div class="contact-icon-box" style="color: ${c.color};">
          <i class="${c.icon}"></i>
        </div>
        <div class="contact-text-box">
          <span class="contact-platform">${c.platform}</span>
          <strong class="contact-value">${c.value}</strong>
          <small class="contact-source"><i class="fa-solid fa-shield-check"></i> ${c.verifiedSource}</small>
        </div>
        <i class="fa-solid fa-arrow-up-right-from-square contact-arrow"></i>
      </a>
    `).join("");

    this.contentArea.innerHTML = `
      <div class="modal-contact-view">
        <div class="modal-project-header">
          <span class="modal-badge badge-accent">Hubungi Saya</span>
          <h2 class="modal-title">Mari Berdiskusi &amp; Berkolaborasi</h2>
          <p class="modal-subtitle">Saluran komunikasi terbuka untuk mendiskusikan pengembangan game, arsitektur sistem, maupun peluang kolaborasi.</p>
        </div>
        <div class="modal-contact-list">${channelsHtml}</div>
      </div>
    `;
  }
}
