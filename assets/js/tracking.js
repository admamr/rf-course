// RF Global — consent-gated analytics and conversion tracking.

const RFTracking = (function () {
  'use strict';

  var GA4_MEASUREMENT_ID = 'G-8VHCLNJ5L0';
  var ga4Requested = false;

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

  function ensureGA4() {
    if (ga4Requested || !hasAnalyticsConsent(getConsent())) return;

    ga4Requested = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID);

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID;
    document.head.appendChild(script);
  }

  function track(eventName, data) {
    if (typeof console !== 'undefined') {
      console.log('[RF Tracking]', eventName, data);
    }

    var consent = getConsent();

    // GA4 is loaded only after analytics consent. purchase_click is a checkout
    // intent, never a verified purchase.
    if (hasAnalyticsConsent(consent)) {
      ensureGA4();
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName === 'purchase_click' ? 'begin_checkout' : eventName, {
          ...data,
          currency: 'ILS'
        });
      }
    }

    // Meta checkout intent is reserved for an actual purchase CTA click.
    if (eventName === 'purchase_click' && typeof window.fbq === 'function' && hasMarketingConsent(consent)) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: data.product_id,
        value: data.price,
        currency: 'ILS',
      });
    }
  }

  function bindCTAEvents() {
    document.querySelectorAll('[data-event]').forEach(function (el) {
      el.addEventListener('click', function () {
        track(this.getAttribute('data-event'), {
          product_id: this.getAttribute('data-product') || '',
          price: parseFloat(this.getAttribute('data-price')) || 0,
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

  function init() {
    document.addEventListener('rf:consent-updated', function (event) {
      if (event.detail && event.detail.analytics === true) ensureGA4();
    });

    document.addEventListener('DOMContentLoaded', function () {
      ensureGA4();
      bindCTAEvents();
      bindSectionViews();
    });
  }

  return { init: init, track: track };
})();

RFTracking.init();
