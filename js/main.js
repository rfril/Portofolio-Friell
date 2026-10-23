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

  // Initialize master game instance
  const game = new Game(canvas);
  window.__GAME__ = game;

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

  // Contact form submission demo in classic view
  const contactForm = document.getElementById("classicContactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Terima kasih! Pesan Anda telah tersimpan (Mode Demo). Untuk respon cepat, silakan klik tombol WhatsApp resmi kami.");
      contactForm.reset();
    });
  }
});
