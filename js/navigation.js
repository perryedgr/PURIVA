/**
 * PURIVA Web Profile — Navigation & Scroll Controller
 * Handles sticky header, mobile drawer menu, keyboard navigation, and active section scroll-spy.
 */
'use strict';

(function () {
  const header = document.getElementById('site-header');
  const mainNav = document.getElementById('main-nav');
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  function setMenuOpen(isOpen) {
    if (!mainNav || !toggleBtn) return;
    mainNav.classList.toggle('open', isOpen);
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    toggleBtn.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    if (backdrop) {
      backdrop.hidden = !isOpen;
    }
  }

  function initMobileNav() {
    if (!toggleBtn || !mainNav) return;

    toggleBtn.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!expanded);
    });

    if (backdrop) {
      backdrop.addEventListener('click', () => setMenuOpen(false));
    }

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        setMenuOpen(false);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('open')) {
        setMenuOpen(false);
        toggleBtn.focus();
      }
    });
  }

  function initStickyHeader() {
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 16);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initScrollSpy() {
    const sections = navLinks
      .map((link) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return null;
        const target = document.querySelector(href);
        return target ? { link, target } : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    const updateActiveLink = () => {
      const scrollPos = window.scrollY + 140;
      let current = sections[0];

      for (const item of sections) {
        if (item.target.offsetTop <= scrollPos) {
          current = item;
        }
      }

      navLinks.forEach((l) => l.classList.remove('active'));
      if (current && current.link) {
        current.link.classList.add('active');
      }
    };

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initStickyHeader();
    initScrollSpy();
  });
})();
