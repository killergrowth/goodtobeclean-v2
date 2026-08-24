/* Good To Be Clean v2 — main.js */
'use strict';

// ─── HCP Booking Modal ────────────────────────────────────────────────────────
// Safe wrapper that waits for HCPWidget to be ready before opening the modal.
// HCP script.js loads async — we cannot call HCPWidget.openModal() synchronously on load.
window.g2bcBook = function () {
  if (typeof HCPWidget !== 'undefined' && typeof HCPWidget.openModal === 'function') {
    HCPWidget.openModal();
    return;
  }
  // Retry up to 15× (every 300ms = 4.5s total) while HCP script finishes loading
  var tries = 0;
  var poll = setInterval(function () {
    tries++;
    if (typeof HCPWidget !== 'undefined' && typeof HCPWidget.openModal === 'function') {
      clearInterval(poll);
      HCPWidget.openModal();
    } else if (tries >= 15) {
      clearInterval(poll);
      // Fallback: direct booking URL
      window.open(
        'https://online-booking.housecallpro.com/book/?token=c16253424f6b4892b361c09f8540203f&orgName=Good-To-Be-Clean',
        '_blank'
      );
    }
  }, 300);
};

// Wire all .hcp-button elements after DOM loads — removes inline onclick and attaches safe handler
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.hcp-button').forEach(function (el) {
    el.removeAttribute('onclick');
    el.addEventListener('click', function (e) {
      e.preventDefault();
      window.g2bcBook();
    });
  });
});

// ─── Dynamic copyright year ───────────────────────────────────────────────────
(function () {
  var el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

// ─── Scroll-to-top button ─────────────────────────────────────────────────────
(function () {
  var btn = document.querySelector('.scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ─── Active nav link ──────────────────────────────────────────────────────────
(function () {
  var path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.g2bc-navbar .nav-link').forEach(function (a) {
    var href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
    if (path === href || (href !== '' && href !== '/' && path.startsWith(href + '/'))) {
      a.classList.add('active');
    }
  });
})();

// ─── Contact form (contact page) ──────────────────────────────────────────────
(function () {
  var form = document.getElementById('g2bc-contact-form');
  var statusEl = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    if (statusEl) { statusEl.style.display = 'none'; }

    var data = {
      name:    (form.querySelector('#contact-name') || {}).value || '',
      phone:   (form.querySelector('#contact-phone') || {}).value || '',
      email:   (form.querySelector('#contact-email') || {}).value || '',
      service: (form.querySelector('#contact-service') || {}).value || '',
      message: (form.querySelector('#contact-message') || {}).value || '',
      token:   (window.turnstile && window.turnstile.getResponse && window.turnstile.getResponse()) || ''
    };

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (res.success) {
        if (statusEl) {
          statusEl.style.cssText = 'display:block;background:#e8f5e9;color:#2e7d32;padding:16px;border-radius:6px;font-weight:600;margin-top:8px;';
          statusEl.textContent = '✓ Message sent! We\'ll be in touch soon.';
        }
        form.reset();
        if (window.turnstile && window.turnstile.reset) window.turnstile.reset();
      } else {
        throw new Error(res.error || 'Submission failed');
      }
    })
    .catch(function () {
      if (statusEl) {
        statusEl.style.cssText = 'display:block;background:#ffebee;color:#c62828;padding:16px;border-radius:6px;font-weight:600;margin-top:8px;';
        statusEl.textContent = 'Something went wrong. Please call us at (316) 320-6767.';
      }
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
    });
  });
})();
