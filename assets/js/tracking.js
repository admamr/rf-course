// RF Global — consent-gated analytics and conversion tracking.

const RFTracking = (function () {
  'use strict';

  var ga4Requested = false;
  var metaRequested = false;
  var DEBUG = false; // set true locally to see events in console

  function log() {
    if (DEBUG && typeof console !== 'undefined') {
      console.log.apply(console, ['[RF Tracking]'].concat([].slice.call(arguments)));
    }
  }

  function getConsent() {
    try {
      var stored = localStorage.getItem('rf_cookie_consent');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  }

  function hasAnalyticsConsent(consent) {
    return Boolean(consent && consent.analytics === true);
  }

  function hasMarketingConsent(consent) {
    return Boolean(consent && consent.marketing === true);
  }

  // Shared id so browser (Pixel) and server (CAPI) events deduplicate.
  function makeEventId(name) {
    return name + '.' + Date.now() + '.' + Math.random().toString(36).slice(2, 10);
  }

  /* ───────────────────────────── GA4 ───────────────────────────── */

  function getGA4Config() {
    var config = window.RF_GTAG_CONFIG;
    if (!config || typeof config.measurementId !== 'string' || typeof config.scriptUrl !== 'string') return null;
    return config;
  }

  function ensureGA4() {
    var config = getGA4Config();
    if (ga4Requested || !config || !hasAnalyticsConsent(getConsent())) return;

    ga4Requested = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', config.measurementId);

    var script = document.createElement('script');
    script.async = true;
    script.src = config.scriptUrl;
    document.head.appendChild(script);

    log('GA4 loaded');
  }

  /* ────────────────────────── META PIXEL ────────────────────────── */

  function getMetaConfig() {
    var config = window.RF_META_CONFIG;
    if (!config || typeof config.pixelId !== 'string') return null;
    return config;
  }

  function ensureMetaPixel() {
    var config = getMetaConfig();
    if (metaRequested || !config || !hasMarketingConsent(getConsent())) return;

    metaRequested = true;

    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', config.pixelId);
    window.fbq('track', 'PageView', {}, { eventID: makeEventId('PageView') });

    window.fbq('track', 'ViewContent', {
      content_name: config.pageName || document.title,
      content_category: 'Course',
      content_ids: ['entry-course'],
      content_type: 'product',
      value: 149.00,
      currency: 'ILS'
    }, { eventID: makeEventId('ViewContent') });

    log('Meta Pixel loaded', config.pixelId);
  }

  /* ──────────────────────────── TRACK ──────────────────────────── */

  function track(eventName, data) {
    log(eventName, data);

    var consent = getConsent();

    // GA4 is loaded only after analytics consent. purchase_click is a checkout
    // intent, never a verified purchase.
    if (hasAnalyticsConsent(consent)) {
      ensureGA4();
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName === 'purchase_click' ? 'begin_checkout' : eventName, {
          ...data,
          currency: data.currency || 'ILS'
        });
      }
    }

    // Meta checkout intent is reserved for an actual purchase CTA click.
    if (eventName === 'purchase_click' && hasMarketingConsent(consent)) {
      ensureMetaPixel();
      if (typeof window.fbq === 'function') {
        var courseId = (data.product_id || 'entry_course').replace(/_course$/, '');
        window.fbq('track', 'InitiateCheckout', {
          content_name: data.product_id || 'entry_course',
          content_ids: [courseId + '-course'],
          content_type: 'product',
          value: data.price || 149,
          currency: data.currency || 'ILS',
          num_items: 1
        }, { eventID: makeEventId('InitiateCheckout') });
      }
    }
  }

  /* ──────────────────────────── BINDINGS ───────────────────────── */

  function bindCTAEvents() {
    document.querySelectorAll('[data-event]').forEach(function (el) {
      el.addEventListener('click', function () {
        track(this.getAttribute('data-event'), {
          product_id: this.getAttribute('data-product') || '',
          price: parseFloat(this.getAttribute('data-price')) || 0,
          currency: this.getAttribute('data-currency') || 'ILS',
          cta_location: this.getAttribute('data-cta-location') || '',
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

  /* ───────────────────────────── INIT ──────────────────────────── */

  function init() {
    document.addEventListener('rf:consent-updated', function (event) {
      if (!event.detail) return;
      if (event.detail.analytics === true) ensureGA4();
      if (event.detail.marketing === true) ensureMetaPixel();
    });

    document.addEventListener('DOMContentLoaded', function () {
      ensureGA4();
      ensureMetaPixel();
      bindCTAEvents();
      bindSectionViews();
    });
  }

  return { init: init, track: track };
})();

RFTracking.init();
