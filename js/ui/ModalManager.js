/**
 * IN-GAME MODAL & EXHIBIT MANAGER
 * Mengelola panel informasi portofolio interaktif:
 * - Tab switcher dinamis berdasarkan zona tempat pemain berdiri
 * - Rendering data proyek, timeline perjalanan, skills lab, profil, dan kontak
 * - Transisi game state (INTERACTING <-> PLAYING)
 */

import { GameStates } from "../core/StateManager.js";
import { profileData } from "../data/profileData.js";
import { journeyTimeline } from "../data/journeyData.js";
import { projectsData } from "../data/projectsData.js";
import { technicalSkills } from "../data/skillsData.js";
import { contactData } from "../data/contactData.js";

export class ModalManager {
  constructor(stateManager, audioManager) {
    this.state = stateManager;
    this.audio = audioManager;

    this.backdrop = document.getElementById("projectModalBackdrop");
    this.closeBtn = document.getElementById("modalCloseBtn");
    this.navTabs = document.getElementById("modalNavTabs");
    this.contentArea = document.getElementById("modalContentArea");

    this.activeTab = "apexsions";

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
  }

  open(preferredTab = "apexsions") {
    // Map zone id to tab id
    const zoneToTab = {
      spawn: "about",
      journey: "journey",
      apexsions: "apexsions",
      kasir: "kasir",
      pororo: "pororo",
      skills: "skills",
      about: "about",
      contact: "contact"
    };

    const targetTab = zoneToTab[preferredTab] || preferredTab || "apexsions";
    this.activeTab = targetTab;

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
    this.state.setState(GameStates.PLAYING);
  }

  isOpen() {
    return this.backdrop && this.backdrop.classList.contains("visible");
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    this.renderTabs();
    this.renderContent();
    if (this.audio) this.audio.playInteractSound();
  }

  renderTabs() {
    if (!this.navTabs) return;
    const tabs = [
      { id: "apexsions", icon: "fa-solid fa-dungeon text-gold", label: "Apexsions RPG" },
      { id: "kasir", icon: "fa-solid fa-cash-register text-purple", label: "POS Kasir Friel" },
      { id: "pororo", icon: "fa-solid fa-ice-cream text-pink", label: "PoRoRo Gelato" },
      { id: "journey", icon: "fa-solid fa-route text-cyan", label: "Perjalanan" },
      { id: "skills", icon: "fa-solid fa-laptop-code text-green", label: "Skills Lab" },
      { id: "about", icon: "fa-solid fa-user-astronaut text-indigo", label: "Tentang Saya" },
      { id: "contact", icon: "fa-solid fa-satellite-dish text-rose", label: "Kontak" }
    ];

    this.navTabs.innerHTML = tabs.map(t => `
      <button class="modal-tab-btn ${this.activeTab === t.id ? 'active' : ''}" data-tab-id="${t.id}">
        <i class="${t.icon}"></i>
        <span>${t.label}</span>
      </button>
    `).join("");
  }

  renderContent() {
    if (!this.contentArea) return;

    if (this.activeTab === "apexsions" || this.activeTab === "kasir" || this.activeTab === "pororo") {
      this.renderProjectDetail(this.activeTab);
    } else if (this.activeTab === "journey") {
      this.renderJourneyTimeline();
    } else if (this.activeTab === "skills") {
      this.renderSkillsLab();
    } else if (this.activeTab === "about") {
      this.renderAboutMe();
    } else if (this.activeTab === "contact") {
      this.renderContact();
    } else {
      this.renderProjectDetail("apexsions");
    }
  }

  renderProjectDetail(projectId) {
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
      linksHtml += `<a href="${project.liveLinks.detailPage}" target="_blank" class="btn btn-secondary btn-sm"><i class="fa-solid fa-file-lines"></i> Baca Halaman Lengkap</a>`;
    }

    this.contentArea.innerHTML = `
      <div class="modal-project-view">
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
          <h3><i class="fa-solid fa-circle-info text-cyan"></i> Ringkasan Proyek & Lokasi Sumber</h3>
          <p>${project.summary}</p>
          <p class="source-verified-pill"><i class="fa-solid fa-folder-check"></i> Sumber Terverifikasi: <code>${project.sourceLocation}</code></p>
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
      </div>
    `;
  }

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
          <span class="modal-badge badge-accent">Kronologi Nyata</span>
          <h2 class="modal-title">Perjalanan Saya: Dari Pemain ke Kreator</h2>
          <p class="modal-subtitle">Kronologi nyata proses belajar dan eksplorasi saya dari bermain Minecraft hingga membangun arsitektur game.</p>
        </div>
        <div class="modal-journey-timeline">${itemsHtml}</div>
      </div>
    `;
  }

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
          <h2 class="modal-title">Kemampuan Teknis & Bukti Penerapan</h2>
          <p class="modal-subtitle">Daftar teknologi berdasarkan penggunaan nyata pada proyek tanpa skor persentase buatan.</p>
        </div>
        <div class="modal-skills-grid">${skillsHtml}</div>
      </div>
    `;
  }

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
          <img src="${profileData.avatarUrl}" alt="${profileData.fullName}" class="modal-avatar">
          <div>
            <span class="modal-badge badge-accent">${profileData.status}</span>
            <h2 class="modal-title">${profileData.fullName}</h2>
            <p class="modal-subtitle">${profileData.major} &bull; Cita-cita: <strong>${profileData.goal}</strong></p>
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
          <h2 class="modal-title">Saluran Komunikasi Terverifikasi</h2>
          <p class="modal-subtitle">Tautan kontak aktif dan terverifikasi untuk diskusi pengembangan proyek game & software development.</p>
        </div>
        <div class="modal-contact-list">${channelsHtml}</div>
      </div>
    `;
  }
}
