// RF Global, Main JS

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── Smooth Scroll ────────────────────────────────────────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var offset = 80;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    });
  }

  // ─── FAQ Accordion ────────────────────────────────────────────────────────────
  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var trigger = item.querySelector('.faq-trigger');
      var answer = item.querySelector('.faq-answer');
      if (!trigger || !answer) return;

      trigger.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');

        // Close all open items
        document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
          openItem.classList.remove('open');
          var a = openItem.querySelector('.faq-answer');
          if (a) a.style.maxHeight = '0';
          var t = openItem.querySelector('.faq-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });

        // Open clicked item if it was closed
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ─── Intersection Observer Reveal ────────────────────────────────────────────
  function initReveal() {
    if (reducedMotion) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    if (!window.IntersectionObserver) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  // ─── Count-Up Stats ───────────────────────────────────────────────────────────
  function countUp(el, target, duration, suffix, prefix) {
    if (reducedMotion) {
      el.textContent = (prefix || '') + target.toLocaleString() + (suffix || '');
      return;
    }
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(target * eased);
      el.textContent = (prefix || '') + current.toLocaleString() + (suffix || '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCountUp() {
    if (!window.IntersectionObserver) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var target = parseInt(el.getAttribute('data-count'), 10);
            var suffix = el.getAttribute('data-suffix') || '';
            var prefix = el.getAttribute('data-prefix') || '';
            var duration = parseInt(el.getAttribute('data-duration') || '1600', 10);
            countUp(el, target, duration, suffix, prefix);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('[data-count]').forEach(function (el) {
      observer.observe(el);
    });
  }

  // ─── Sticky Mobile CTA ────────────────────────────────────────────────────────
  function initStickyCTA() {
    var hero = document.getElementById('hero');
    var sticky = document.getElementById('sticky-cta');
    if (!hero || !sticky) return;

    function setStickyVisibility(isVisible) {
      sticky.classList.toggle('opacity-0', !isVisible);
      sticky.classList.toggle('pointer-events-none', !isVisible);
      sticky.classList.toggle('translate-y-full', !isVisible);
      sticky.classList.toggle('opacity-100', isVisible);
      sticky.classList.toggle('translate-y-0', isVisible);
      sticky.setAttribute('aria-hidden', String(!isVisible));
      document.documentElement.classList.toggle('has-sticky-cta', isVisible);
    }

    if (!window.IntersectionObserver) {
      setStickyVisibility(true);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          setStickyVisibility(!entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );

    observer.observe(hero);
  }

  // ─── Mobile Nav Toggle ────────────────────────────────────────────────────────
  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.contains('open');
      menu.classList.toggle('open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
      document.body.classList.toggle('overflow-hidden', !isOpen);
    });

    function closeMenu() {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('overflow-hidden');
    }

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Dedicated close control(s) inside the overlay
    menu.querySelectorAll('[data-nav-close]').forEach(function (el) {
      el.addEventListener('click', closeMenu);
    });
  }

  // ─── Cookie Consent ──────────────────────────────────────────────────────────
  function initCookieConsent() {
    var STORAGE_KEY = 'rf_cookie_consent';
    var banner = document.getElementById('cookie-banner');
    var modal = document.getElementById('cookie-modal');
    if (!banner) return;

    // Check if consent already stored
    var existing = null;
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) existing = JSON.parse(stored);
    } catch (e) {}

    if (existing) return; // consent already given

    // Show banner after a short delay
    setTimeout(function () {
      banner.classList.add('visible');
    }, 800);

    function saveConsent(analytics, marketing) {
      var consent = {
        analytics: analytics,
        marketing: marketing,
        timestamp: new Date().toISOString()
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
      } catch (e) {}
      document.dispatchEvent(new CustomEvent('rf:consent-updated', { detail: consent }));
    }

    function hideBanner() {
      banner.classList.remove('visible');
    }

    function hideModal() {
      if (modal) {
        modal.classList.remove('visible');
        // Return focus to manage button or banner
        var manageBtn = banner.querySelector('[data-cookie-manage]');
        if (manageBtn) manageBtn.focus();
      }
    }

    function showModal() {
      if (modal) {
        modal.classList.add('visible');
        // Focus close button
        var closeBtn = modal.querySelector('.cookie-modal-close');
        if (closeBtn) closeBtn.focus();
      }
    }

    // Accept all
    var acceptBtn = banner.querySelector('[data-cookie-accept]');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        saveConsent(true, true);
        hideBanner();
      });
    }

    // Reject all
    var rejectBtn = banner.querySelector('[data-cookie-reject]');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        saveConsent(false, false);
        hideBanner();
      });
    }

    // Manage preferences (open modal)
    var manageBtns = document.querySelectorAll('[data-cookie-manage]');
    manageBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        showModal();
      });
    });

    if (modal) {
      // Close modal
      var closeBtns = modal.querySelectorAll('[data-cookie-modal-close]');
      closeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          hideModal();
        });
      });

      // Close on overlay click
      modal.addEventListener('click', function (e) {
        if (e.target === modal) hideModal();
      });

      // Save preferences
      var saveBtn = modal.querySelector('[data-cookie-save]');
      if (saveBtn) {
        saveBtn.addEventListener('click', function () {
          var analyticsToggle = modal.querySelector('#cookie-analytics');
          var marketingToggle = modal.querySelector('#cookie-marketing');
          saveConsent(
            analyticsToggle ? analyticsToggle.checked : false,
            marketingToggle ? marketingToggle.checked : false
          );
          hideModal();
          hideBanner();
        });
      }

      // Escape key closes modal
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('visible')) {
          hideModal();
        }
      });
    }
  }

  // ─── Init ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initSmoothScroll();
    initFAQ();
    initReveal();
    initCountUp();
    initStickyCTA();
    initMobileNav();
    initCookieConsent();
  });
})();
