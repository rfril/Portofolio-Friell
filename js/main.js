/**
 * ENTRY POINT & VIEW SWITCHER
 * Inisialisasi Game 3D dan pengendali beralih antara Mode Game 3D & Mode Web Portofolio Biasa.
 */

import { Game } from "./core/Game.js";

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas3d");
  if (!canvas) return;

  if (typeof THREE === "undefined") {
    console.error("Three.js is not loaded.");
    const fallback = document.getElementById("webglFallbackBanner");
    if (fallback) fallback.style.display = "flex";
    return;
  }

  // Initialize master game instance with robust error handling
  let game = null;
  try {
    game = new Game(canvas);
    window.__GAME__ = game;
    // Safety fallback: Ensure loader overlay is guaranteed to disappear smoothly
    setTimeout(() => {
      const loader = document.getElementById("gameLoader");
      if (loader && !loader.classList.contains("hidden")) {
        loader.classList.add("hidden");
      }
    }, 800);
  } catch (err) {
    console.error("Critical error during 3D initialization:", err);
    const loader = document.getElementById("gameLoader");
    if (loader) {
      loader.innerHTML = `
        <div style="text-align: center; color: #f43f5e; padding: 2rem; max-width: 500px;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; margin-bottom: 1rem;"></i>
          <h2 style="margin-bottom: 0.5rem; color: #fff;">Gagal Memuat Mode 3D</h2>
          <p style="color: #94a3b8; margin-bottom: 1.5rem; line-height: 1.5;">${err.message || 'Terjadi kendala akselerasi grafis.'}</p>
          <button class="btn btn-primary" onclick="window.location.hash='#classic'; window.location.reload();">
            <i class="fa-solid fa-file-lines"></i>
            <span>Buka Mode Dokumen Standar</span>
          </button>
        </div>
      `;
    }
    return;
  }

  // View Switcher: Game 3D vs Web Portofolio Biasa
  const gameViewContainer = document.getElementById("gameViewContainer");
  const classicViewContainer = document.getElementById("classicViewContainer");
  const switchToClassicBtn = document.getElementById("switchToClassicBtn");
  const switchToGameBtn = document.getElementById("switchToGameBtn");

  const showClassicView = () => {
    if (gameViewContainer && classicViewContainer) {
      gameViewContainer.style.display = "none";
      classicViewContainer.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const showGameView = () => {
    if (gameViewContainer && classicViewContainer) {
      classicViewContainer.style.display = "none";
      gameViewContainer.style.display = "block";
      game.onResize();
    }
  };

  if (switchToClassicBtn) {
    switchToClassicBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showClassicView();
    });
  }

  if (switchToGameBtn) {
    switchToGameBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showGameView();
    });
  }

  // Handle URL hash: #classic opens classic view directly
  if (window.location.hash === "#classic") {
    showClassicView();
  }

  // Copy code snippet button in classic hero IDE window
  const copyCodeBtn = document.getElementById("copyCodeBtn");
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener("click", () => {
      const codeElem = document.querySelector(".ide-code-content code");
      if (codeElem) {
        navigator.clipboard.writeText(codeElem.innerText).then(() => {
          copyCodeBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #10b981;"></i>';
          setTimeout(() => {
            copyCodeBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
          }, 2000);
        }).catch(() => {
          copyCodeBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
        });
      }
    });
  }

  // Contact form submission demo in classic view
  const contactForm = document.getElementById("classicContactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Terima kasih! Pesan Anda telah tersimpan (Mode Demo). Untuk diskusi teknis atau tawaran kerja sama, silakan kirim email ke kontak resmi: rafriel.developer@gmail.com.");
      contactForm.reset();
    });
  }
});
