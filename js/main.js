/**
 * PURIVA Web Profile — Main Interactive Controller
 * Handles Lucide icons, scroll reveal animations, interactive Product Showcase gallery, and image lightbox.
 */
'use strict';

(function () {
  const SHOWCASE_ITEMS = [
    {
      kicker: 'Referensi Desain 01 / 03',
      badge: 'Tampilan Eksterior',
      title: 'Desain Fisik & Enclosure PURIVA',
      desc: 'Perangkat PURIVA dirancang menggunakan enclosure berbentuk kotak ringkas berwarna abu-abu gelap (dark charcoal) dengan tampilan industrial minimalis yang cocok untuk ruang keluarga, klinik, maupun ruang kelas.',
      img: 'assets/product/puriva-render.png',
      alt: 'Render 3D produk PURIVA Smart Air Purifier dengan LCD 16x2 di bagian depan dan kipas DC di samping',
      points: [
        '<strong>Housing Charcoal Ringkas:</strong> Struktur bodi kokoh dengan dudukan kaki berlubang baut untuk penempatan stabil.',
        '<strong>Layar LCD 16x2 di Panel Depan:</strong> Menampilkan informasi status perangkat dan pembacaan sensor secara langsung.',
        '<strong>Ventilasi Sirkular &amp; Kisi Sensor:</strong> Lubang sirkulasi udara di bagian depan serta kisi celah untuk paparan sensor lingkungan.',
        '<strong>Kipas Pendingin &amp; Sirkulasi Samping:</strong> Kipas DC terpasang di sisi samping dilengkapi pelindung jari (fan grille).'
      ]
    },
    {
      kicker: 'Referensi Desain 02 / 03',
      badge: 'Arsitektur Internal (Exploded View)',
      title: 'Tata Letak Komponen Hardware Internal',
      desc: 'Visualisasi exploded-view memperlihatkan susunan modul elektronik dan mekanis di dalam enclosure PURIVA, dirancang agar ringkas, mudah dirakit, dan memudahkan perawatan berkala.',
      img: 'assets/hardware/exploded-view.jpeg',
      alt: 'Ilustrasi exploded-view komponen internal PURIVA: BME680, MQ-135, ESP32, LCD 16x2, Relay, dan Kipas DC',
      points: [
        '<strong>ESP32 &amp; Relay di Ruang Utama:</strong> Papan mikrokontroler ESP32 dan modul Relay dipasang pada dudukan internal bagian bawah.',
        '<strong>Sensor BME680 &amp; MQ-135 di Area Atas:</strong> Ditempatkan strategis agar terekspos aliran udara yang masuk ke dalam perangkat.',
        '<strong>Panel Depan Modular:</strong> Memegang modul layar LCD 16x2 tepat pada jendela baca dan menyediakan kisi ventilasi udara.',
        '<strong>Rakitan Kipas DC Samping:</strong> Kipas sirkulasi dipasang beserta penutup grille berlubang baut untuk menjaga aliran udara.'
      ]
    },
    {
      kicker: 'Referensi Desain 03 / 03',
      badge: 'Skema Koneksi Elektronik',
      title: 'Diagram Pengkabelan (Wiring Diagram)',
      desc: 'Skema integrasi antarmuka elektronik yang menghubungkan mikrokontroler utama ESP32 dengan modul sensor lingkungan, layar penampil, dan modul kontrol daya.',
      img: 'assets/hardware/wiring-diagram.jpeg',
      alt: 'Diagram pengkabelan elektronik PURIVA antara ESP32, BME680, MQ-135, LCD 16x2, dan Relay Module',
      points: [
        '<strong>Jalur I2C (SDA &amp; SCL):</strong> Menghubungkan sensor BME680 dan layar LCD 16x2 ke pin komunikasi serial ESP32.',
        '<strong>Input Sensor MQ-135:</strong> Pin output sensor gas MQ-135 dihubungkan ke jalur pembacaan ESP32 beserta suplai daya VCC dan GND.',
        '<strong>Kontrol Modul Relay:</strong> Pin sinyal kontrol (IN) dari ESP32 mengatur aktivasi modul Relay untuk mengendalikan beban.',
        '<strong>Distribusi Daya Terpadu:</strong> Jalur catu daya VCC dan Ground (GND) terhubung secara terstruktur antar modul komponen.'
      ]
    }
  ];

  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function initScrollReveal() {
    document.documentElement.classList.add('js-ready');
    const elements = document.querySelectorAll('.reveal-up, .reveal-scale');

    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  }

  function initProductShowcase(openLightbox) {
    const tabs = Array.from(document.querySelectorAll('.showcase-tab'));
    const thumbs = Array.from(document.querySelectorAll('.sc-thumb'));
    const mainImg = document.getElementById('sc-main-img');
    const badgeEl = document.getElementById('sc-badge');
    const kickerEl = document.getElementById('sc-kicker');
    const titleEl = document.getElementById('sc-title');
    const descEl = document.getElementById('sc-desc');
    const pointsEl = document.getElementById('sc-points');
    const zoomBtn = document.getElementById('sc-zoom-btn');

    if (!mainImg || !tabs.length) return;

    let currentIndex = 0;

    function selectShowcase(index) {
      const item = SHOWCASE_ITEMS[index];
      if (!item) return;
      currentIndex = index;

      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });

      thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
      });

      mainImg.classList.add('switching');
      setTimeout(() => {
        mainImg.src = item.img;
        mainImg.alt = item.alt;
        if (badgeEl) badgeEl.textContent = item.badge;
        if (kickerEl) kickerEl.textContent = item.kicker;
        if (titleEl) titleEl.textContent = item.title;
        if (descEl) descEl.textContent = item.desc;
        if (pointsEl) {
          pointsEl.innerHTML = item.points.map((pt) => `<li>${pt}</li>`).join('');
        }
        mainImg.classList.remove('switching');
      }, 140);
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const idx = Number(tab.dataset.index || 0);
        selectShowcase(idx);
      });
    });

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const idx = Number(thumb.dataset.index || 0);
        selectShowcase(idx);
      });
    });

    if (zoomBtn && typeof openLightbox === 'function') {
      zoomBtn.addEventListener('click', () => {
        const item = SHOWCASE_ITEMS[currentIndex];
        openLightbox(item.img, item.title);
      });
    }

    mainImg.style.cursor = 'zoom-in';
    mainImg.addEventListener('click', () => {
      if (typeof openLightbox === 'function') {
        const item = SHOWCASE_ITEMS[currentIndex];
        openLightbox(item.img, item.title);
      }
    });
  }

  function initLightbox() {
    const modal = document.getElementById('lightbox-modal');
    const backdrop = document.getElementById('lightbox-backdrop');
    const closeBtn = document.getElementById('lightbox-close');
    const modalImg = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');
    const posterBtn = document.getElementById('view-poster-btn');

    if (!modal || !modalImg) return null;

    let lastFocused = null;

    function openLightbox(src, title) {
      lastFocused = document.activeElement;
      modalImg.src = src;
      modalImg.alt = title || 'Pratinjau Gambar PURIVA';
      if (captionEl) captionEl.textContent = title || 'Pratinjau Gambar';
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      modal.hidden = true;
      modalImg.src = '';
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (backdrop) backdrop.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) {
        closeLightbox();
      }
    });

    if (posterBtn) {
      posterBtn.addEventListener('click', () => {
        openLightbox(
          'assets/product/poster-puriva.jpeg',
          'Poster Resmi Proyek PURIVA — Smart Air Purifier Berbasis Biomimetik'
        );
      });
    }

    return openLightbox;
  }

  document.addEventListener('DOMContentLoaded', () => {
    initIcons();
    initScrollReveal();
    const openLightbox = initLightbox();
    initProductShowcase(openLightbox);
  });
})();
