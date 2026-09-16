/**
 * KinotiX Official Web Experience Engine
 * Vanilla ES6 • Zero Dependencies • Fast & Accessible
 */

(function () {
  'use strict';

  // --- Mobile Navigation Drawer Toggle ---
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('mobile-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', function (e) {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains('mobile-open')) {
        navMenu.classList.remove('mobile-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --- Wallpaper Discovery Grid & Lightbox ---
  const gridContainer = document.getElementById('wallpaper-grid');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxBadge = document.getElementById('lightbox-badge');
  const lightboxAppBtn = document.getElementById('lightbox-app-btn');
  const lightboxDownloadBtn = document.getElementById('lightbox-download-btn');
  const lightboxClose = document.getElementById('lightbox-close');

  let currentWallpapers = [];

  // Fetch and initialize wallpaper gallery
  async function loadWallpapers() {
    if (!gridContainer) return;

    try {
      const res = await fetch('assets/js/wallpaper-data.json');
      if (!res.ok) throw new Error('Data load error');
      currentWallpapers = await res.json();
      renderGrid('all');
    } catch (err) {
      console.warn('Using embedded catalog fallback:', err);
    }
  }

  function renderGrid(filter) {
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    const filtered = filter === 'all'
      ? currentWallpapers
      : currentWallpapers.filter(w => w.category === filter);

    if (filtered.length === 0) {
      gridContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">No wallpapers found in this category.</div>';
      return;
    }

    filtered.forEach((wp) => {
      const card = document.createElement('div');
      card.className = 'wallpaper-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View ${wp.title}`);

      card.innerHTML = `
        <img src="${wp.url}" alt="${wp.title}" loading="lazy" decoding="async" onerror="if(this.dataset.triedFallback!=='true'){this.dataset.triedFallback='true';this.src='${wp.fallbackUrl}';}">
        <div class="wallpaper-card-overlay">
          <div class="wallpaper-card-title">${wp.title}</div>
          <div class="wallpaper-card-tag">${wp.type} • ${wp.category}</div>
        </div>
      `;

      card.addEventListener('click', () => openLightbox(wp));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(wp);
        }
      });

      gridContainer.appendChild(card);
    });
  }

  // Filter Tabs Event Listeners
  if (filterTabs.length > 0) {
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', function () {
        filterTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const category = this.getAttribute('data-filter') || 'all';
        renderGrid(category);
      });
    });
  }

  // Lightbox Modal Functions
  function openLightbox(wp) {
    if (!lightbox) return;

    if (lightboxImg) {
      lightboxImg.dataset.triedFallback = 'false';
      lightboxImg.onerror = function() {
        if (this.dataset.triedFallback !== 'true') {
          this.dataset.triedFallback = 'true';
          this.src = wp.fallbackUrl;
        }
      };
      lightboxImg.src = wp.url;
      lightboxImg.alt = wp.title;
    }
    if (lightboxTitle) lightboxTitle.textContent = wp.title;
    if (lightboxBadge) lightboxBadge.textContent = `${wp.type} • ${wp.category.toUpperCase()}`;
    if (lightboxAppBtn) lightboxAppBtn.href = `kinotix://i/${wp.id}`;
    if (lightboxDownloadBtn) {
      lightboxDownloadBtn.href = wp.fallbackUrl || wp.url;
      lightboxDownloadBtn.setAttribute('download', `${wp.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`);
    }

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    if (lightboxAppBtn) lightboxAppBtn.textContent = 'Open in KinotiX App';
    if (lightboxDownloadBtn) lightboxDownloadBtn.textContent = 'Download High-Res Asset';
  }

  // Bind Lightbox to Phone Screenshot Cards
  const phoneCards = document.querySelectorAll('.phone-card');
  if (phoneCards.length > 0) {
    phoneCards.forEach((card) => {
      const openCard = () => {
        const imgSrc = card.getAttribute('data-img');
        const title = card.getAttribute('data-title') || 'KinotiX Android App';
        const badge = card.getAttribute('data-badge') || 'Official Google Play Store';
        if (!lightbox || !imgSrc) return;

        if (lightboxImg) {
          lightboxImg.src = imgSrc;
          lightboxImg.alt = title;
        }
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxBadge) lightboxBadge.textContent = badge;
        if (lightboxAppBtn) {
          lightboxAppBtn.href = 'https://play.google.com/store/apps/details?id=com.kinotix.app';
          lightboxAppBtn.textContent = 'Install on Google Play';
        }
        if (lightboxDownloadBtn) {
          lightboxDownloadBtn.href = imgSrc;
          lightboxDownloadBtn.setAttribute('download', `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`);
          lightboxDownloadBtn.textContent = 'View Full Size';
        }

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      };

      card.addEventListener('click', openCard);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCard();
        }
      });
    });
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Initialize
  document.addEventListener('DOMContentLoaded', loadWallpapers);
})();
