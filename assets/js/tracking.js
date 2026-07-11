// RF Global — Event Tracking
// Drop GA4 / Meta Pixel / GTM into the integration points below.

const RFTracking = (function () {
  'use strict';

  function getConsent() {
    try {
      var stored = localStorage.getItem('rf_cookie_consent');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  }

  function track(eventName, data) {
    if (typeof console !== 'undefined') {
      console.log('[RF Tracking]', eventName, data);
    }

    var consent = getConsent();

    // GA4 — only when analytics consent is true
    if (typeof window.gtag === 'function' && consent && consent.analytics === true) {
      window.gtag('event', eventName, { ...data, currency: 'ILS' });
    }

    // Meta Pixel — only when marketing consent is true
    if (typeof window.fbq === 'function' && consent && consent.marketing === true) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: data.product_id,
        value: data.price,
        currency: 'ILS',
      });
    }

    // Google Tag Manager dataLayer
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...data });
    }
  }

  function bindCTAEvents() {
    document.querySelectorAll('[data-event]').forEach(function (el) {
      el.addEventListener('click', function () {
        track(this.getAttribute('data-event'), {
          product_id: this.getAttribute('data-product') || '',
          price: parseFloat(this.getAttribute('data-price')) || 0,
          label: this.textContent.trim().substring(0, 60),
        });
      });
    });
  }

  function bindSectionViews() {
    if (!window.IntersectionObserver) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            track('section_view', {
              section_id: entry.target.id,
              section_label: entry.target.getAttribute('data-section') || entry.target.id,
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    ['hero', 'method', 'offer', 'faq', 'final-cta'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  function init() {
    document.addEventListener('DOMContentLoaded', function () {
      bindCTAEvents();
      bindSectionViews();
    });
  }

  return { init: init, track: track };
})();

RFTracking.init();
