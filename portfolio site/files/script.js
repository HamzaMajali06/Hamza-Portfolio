/* ==========================================================================
   HAMZA ALMAJALI — ARCHITECTURE PORTFOLIO
   Vanilla JS: scroll reveals, parallax, custom cursor, nav behaviour.
   No dependencies, no frameworks.
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     1. Staggered scroll reveals (IntersectionObserver)
     Elements are marked with class="reveal". A wrapping element with
     [data-reveal-group] either IS a .reveal item itself (a group of
     one — no stagger) or CONTAINS several .reveal children, which are
     indexed in DOM order and staggered via the --i custom property
     read by styles.css.
  ------------------------------------------------------------------ */
  function initReveals() {
    var groups = document.querySelectorAll('[data-reveal-group]');
    groups.forEach(function (group) {
      var items = group.classList.contains('reveal')
        ? [group]
        : Array.prototype.slice.call(group.querySelectorAll('.reveal'));
      items.forEach(function (el, i) {
        el.style.setProperty('--i', i);
      });
    });

    var revealEls = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      // Fallback: no observer support — just show everything.
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     2. Custom CAD-style crosshair cursor — fine pointer + hover only,
     so touch devices keep their normal behaviour untouched.
  ------------------------------------------------------------------ */
  function initCustomCursor() {
    var supportsFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!supportsFineHover) return;

    document.documentElement.classList.add('has-custom-cursor');

    var cursor = document.querySelector('[data-cursor]');
    if (!cursor) return;
    var label = cursor.querySelector('[data-cursor-label]');

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var curX = mouseX;
    var curY = mouseY;
    var hasMoved = false;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      hasMoved = true;
    });

    function loop() {
      var ease = prefersReducedMotion ? 1 : 0.2;
      curX += (mouseX - curX) * ease;
      curY += (mouseY - curY) * ease;
      if (hasMoved) {
        cursor.style.transform = 'translate3d(' + curX + 'px, ' + curY + 'px, 0)';
      }
      requestAnimationFrame(loop);
    }
    loop();

    var targets = document.querySelectorAll('[data-cursor-text]');
    targets.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursor.classList.add('is-active');
        if (label) label.textContent = el.getAttribute('data-cursor-text') || '';
      });
      el.addEventListener('mouseleave', function () {
        cursor.classList.remove('is-active');
        if (label) label.textContent = '';
      });
    });
  }

  /* ------------------------------------------------------------------
     3. Hero parallax — contained to the intro section, rAF-throttled.
  ------------------------------------------------------------------ */
  function initParallax() {
    if (prefersReducedMotion) return;
    var els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;

    var ticking = false;

    function update() {
      var y = window.scrollY;
      els.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        el.style.transform = 'translate3d(0,' + (y * speed) + 'px,0)';
      });
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------
     4. Sticky header — background state on scroll.
  ------------------------------------------------------------------ */
  function initHeaderState() {
    var header = document.querySelector('[data-header]');
    if (!header) return;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ------------------------------------------------------------------
     5. Scrollspy — highlights the nav link for the section in view.
  ------------------------------------------------------------------ */
  function initScrollspy() {
    var sections = document.querySelectorAll('main section[id]');
    if (!sections.length || !('IntersectionObserver' in window)) return;

    var navLinks = document.querySelectorAll('.nav a[href^="#"]');

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var link = document.querySelector('.nav a[href="#' + entry.target.id + '"]');
          if (!link) return;
          navLinks.forEach(function (l) { l.classList.remove('is-active'); });
          link.classList.add('is-active');
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ------------------------------------------------------------------
     6. Mobile navigation toggle.
  ------------------------------------------------------------------ */
  function initMobileNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) return;

    function closeNav() {
      document.documentElement.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var isOpen = document.documentElement.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ------------------------------------------------------------------
     7. Footer year.
  ------------------------------------------------------------------ */
  function initFooterYear() {
    var el = document.querySelector('[data-year]');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------
     Init
  ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initReveals();
    initCustomCursor();
    initParallax();
    initHeaderState();
    initScrollspy();
    initMobileNav();
    initFooterYear();
  });
})();
