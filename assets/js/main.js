/* Good To Be Clean v2 — main.js */

// Dynamic copyright year
(function () {
  var el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

// Scroll-to-top button
(function () {
  var btn = document.querySelector('.scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// Active nav link highlight
(function () {
  var path = window.location.pathname;
  var links = document.querySelectorAll('.g2bc-navbar .nav-link');
  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href !== '/' && path.startsWith(href)) {
      link.classList.add('active');
    } else if (href === '/' && path === '/') {
      link.classList.add('active');
    }
  });
})();

// Smooth anchor scrolling for on-page links
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
