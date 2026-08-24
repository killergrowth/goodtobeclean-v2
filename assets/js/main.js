/* Good To Be Clean v2 — Main JS */
'use strict';

// Scroll to top visibility
(function () {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
})();

// Mark active nav link
(function () {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.g2bc-navbar .nav-link').forEach(function (a) {
    const href = a.getAttribute('href');
    if (!href) return;
    const linkPath = href.replace(/\/$/, '') || '/';
    if (path === linkPath || (linkPath !== '' && path.startsWith(linkPath + '/'))) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
})();

// Contact form submission (if present)
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = form.querySelector('[type="submit"]');
    const status = document.getElementById('form-status');
    const originalText = btn ? btn.textContent : '';

    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    if (status) { status.textContent = ''; status.className = ''; }

    const data = {
      name: form.name ? form.name.value.trim() : '',
      email: form.email ? form.email.value.trim() : '',
      phone: form.phone ? form.phone.value.trim() : '',
      service: form.service ? form.service.value : '',
      message: form.message ? form.message.value.trim() : '',
    };

    // Get Turnstile token
    const tokenInput = form.querySelector('[name="cf-turnstile-response"]');
    if (tokenInput) data['cf-turnstile-response'] = tokenInput.value;

    try {
      const res = await fetch('/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json();
      if (res.ok && json.success) {
        if (status) { status.textContent = 'Thank you! We\'ll be in touch shortly.'; status.className = 'form-success'; }
        form.reset();
        if (window.turnstile) window.turnstile.reset();
      } else {
        throw new Error(json.error || 'Submission failed');
      }
    } catch (err) {
      if (status) { status.textContent = 'Something went wrong. Please call us at (316) 320-6767.'; status.className = 'form-error'; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
  });
})();
