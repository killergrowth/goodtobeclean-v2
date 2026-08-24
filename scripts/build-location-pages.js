'use strict';

/**
 * Good To Be Clean v2 — Location Page Builder
 * =============================================
 * Reads 275 MD files from sites/goodtobeclean/page-content/location-pages/
 * Parses frontmatter (slug, title, description) + body content
 * Converts markdown to clean HTML
 * Wraps in v2 service layout (partials already injected by caller)
 * Outputs to dist/ at the exact slug path from each MD file
 *
 * Called by build.js: buildLocationPages(partials, sitemapUrls, config)
 */

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// SERVICE CONFIG — maps service dir name to display metadata
// ---------------------------------------------------------------------------
const SERVICE_CONFIG = {
  'carpet-cleaning': {
    label:      'Carpet Cleaning',
    hubUrl:     '/services/carpet-cleaning/',
    phone:      '(316) 320-6767',
    siblings: [
      { label: 'Air Duct Cleaning',          url: '/services/air-duct-cleaning/' },
      { label: 'Water Damage Restoration',   url: '/services/water-damage-restoration/' },
      { label: 'Mold Remediation',           url: '/services/mold-remediation/' },
      { label: 'Fire & Smoke Restoration',   url: '/services/fire-smoke-restoration/' },
      { label: 'Soda Blasting',              url: '/services/soda-blasting/' },
      { label: 'Vapor Barrier',              url: '/services/vapor-barrier/' },
    ],
  },
  'air-duct-cleaning': {
    label:      'Air Duct Cleaning',
    hubUrl:     '/services/air-duct-cleaning/',
    phone:      '(316) 320-6767',
    siblings: [
      { label: 'Carpet Cleaning',            url: '/services/carpet-cleaning/' },
      { label: 'Water Damage Restoration',   url: '/services/water-damage-restoration/' },
      { label: 'Mold Remediation',           url: '/services/mold-remediation/' },
      { label: 'Fire & Smoke Restoration',   url: '/services/fire-smoke-restoration/' },
      { label: 'Soda Blasting',              url: '/services/soda-blasting/' },
      { label: 'Vapor Barrier',              url: '/services/vapor-barrier/' },
    ],
  },
  'water-damage-restoration': {
    label:      'Water Damage Restoration',
    hubUrl:     '/services/water-damage-restoration/',
    phone:      '(316) 320-6767',
    siblings: [
      { label: 'Carpet Cleaning',            url: '/services/carpet-cleaning/' },
      { label: 'Air Duct Cleaning',          url: '/services/air-duct-cleaning/' },
      { label: 'Mold Remediation',           url: '/services/mold-remediation/' },
      { label: 'Fire & Smoke Restoration',   url: '/services/fire-smoke-restoration/' },
      { label: 'Soda Blasting',              url: '/services/soda-blasting/' },
      { label: 'Vapor Barrier',              url: '/services/vapor-barrier/' },
    ],
  },
  'mold-remediation': {
    label:      'Mold Remediation',
    hubUrl:     '/services/mold-remediation/',
    phone:      '(316) 320-6767',
    siblings: [
      { label: 'Carpet Cleaning',            url: '/services/carpet-cleaning/' },
      { label: 'Air Duct Cleaning',          url: '/services/air-duct-cleaning/' },
      { label: 'Water Damage Restoration',   url: '/services/water-damage-restoration/' },
      { label: 'Fire & Smoke Restoration',   url: '/services/fire-smoke-restoration/' },
      { label: 'Soda Blasting',              url: '/services/soda-blasting/' },
      { label: 'Vapor Barrier',              url: '/services/vapor-barrier/' },
    ],
  },
  'fire-smoke-restoration': {
    label:      'Fire & Smoke Restoration',
    hubUrl:     '/services/fire-smoke-restoration/',
    phone:      '(316) 320-6767',
    siblings: [
      { label: 'Carpet Cleaning',            url: '/services/carpet-cleaning/' },
      { label: 'Air Duct Cleaning',          url: '/services/air-duct-cleaning/' },
      { label: 'Water Damage Restoration',   url: '/services/water-damage-restoration/' },
      { label: 'Mold Remediation',           url: '/services/mold-remediation/' },
      { label: 'Soda Blasting',              url: '/services/soda-blasting/' },
      { label: 'Vapor Barrier',              url: '/services/vapor-barrier/' },
    ],
  },
  'soda-blasting': {
    label:      'Soda Blasting',
    hubUrl:     '/services/soda-blasting/',
    phone:      '(316) 320-6767',
    siblings: [
      { label: 'Carpet Cleaning',            url: '/services/carpet-cleaning/' },
      { label: 'Air Duct Cleaning',          url: '/services/air-duct-cleaning/' },
      { label: 'Water Damage Restoration',   url: '/services/water-damage-restoration/' },
      { label: 'Mold Remediation',           url: '/services/mold-remediation/' },
      { label: 'Fire & Smoke Restoration',   url: '/services/fire-smoke-restoration/' },
      { label: 'Vapor Barrier',              url: '/services/vapor-barrier/' },
    ],
  },
  'vapor-barrier': {
    label:      'Vapor Barrier Installation',
    hubUrl:     '/services/vapor-barrier/',
    phone:      '(316) 320-6767',
    siblings: [
      { label: 'Carpet Cleaning',            url: '/services/carpet-cleaning/' },
      { label: 'Air Duct Cleaning',          url: '/services/air-duct-cleaning/' },
      { label: 'Water Damage Restoration',   url: '/services/water-damage-restoration/' },
      { label: 'Mold Remediation',           url: '/services/mold-remediation/' },
      { label: 'Fire & Smoke Restoration',   url: '/services/fire-smoke-restoration/' },
      { label: 'Soda Blasting',              url: '/services/soda-blasting/' },
    ],
  },
};

// ---------------------------------------------------------------------------
// CITY DISPLAY NAMES — strip -ks suffix for display
// ---------------------------------------------------------------------------
function cityDisplay(slug) {
  return slug
    .replace(/-ks$/, '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// SIMPLE MARKDOWN → HTML CONVERTER
// Handles: headings, paragraphs, bold, links, hr, lists, emoji chars
// ---------------------------------------------------------------------------
function mdToHtml(md) {
  const lines = md.split('\n');
  const out   = [];
  let inList   = false;
  let inPara   = false;
  let buf      = [];

  const flushPara = () => {
    if (buf.length) {
      out.push(`<p>${buf.join(' ')}</p>`);
      buf = [];
      inPara = false;
    }
  };
  const flushList = () => {
    if (inList) { out.push('</ul>'); inList = false; }
  };

  const inline = (text) => text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/&amp;/g, '&')
    .trim();

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Heading
    const hMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (hMatch) {
      flushPara(); flushList();
      const level = Math.min(hMatch[1].length + 1, 4); // h2–h4 (h1 is the page hero)
      out.push(`<h${level} class="kg-section-title">${inline(hMatch[2])}</h${level}>`);
      continue;
    }

    // HR
    if (/^---+$/.test(line)) {
      flushPara(); flushList();
      out.push('<hr class="kg-divider">');
      continue;
    }

    // Unordered list item
    if (/^[\*\-]\s+/.test(line)) {
      flushPara();
      if (!inList) { out.push('<ul class="kg-content-list">'); inList = true; }
      out.push(`<li>${inline(line.replace(/^[\*\-]\s+/, ''))}</li>`);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushPara(); flushList();
      continue;
    }

    // Paragraph text — accumulate
    buf.push(inline(line));
    inPara = true;
  }
  flushPara();
  flushList();

  return out.join('\n');
}

// ---------------------------------------------------------------------------
// PARSE FRONTMATTER
// ---------------------------------------------------------------------------
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)/);
    if (kv) meta[kv[1].trim()] = kv[2].trim();
  }
  return { meta, body: match[2] };
}

// ---------------------------------------------------------------------------
// BUILD CITY LINKS SIDEBAR for a given service
// Uses only the -ks variant slugs for the sidebar list (canonical city links)
// ---------------------------------------------------------------------------
function buildCityLinks(svcDir, svcLabel, srcBase) {
  const svcPath = path.join(srcBase, svcDir);
  if (!fs.existsSync(svcPath)) return '';

  // Only list -ks files in the sidebar (canonical variant)
  const files = fs.readdirSync(svcPath)
    .filter(f => f.endsWith('-ks.md'))
    .sort();

  const items = files.map(f => {
    const citySlug = f.replace('.md', '');
    const display  = cityDisplay(citySlug);
    return `<li><a href="/${svcDir}/${citySlug}/">${display}</a></li>`;
  }).join('\n        ');

  return `<div class="kg-sidebar-box">
      <h6>${svcLabel} by City</h6>
      <ul class="kg-city-links">
        ${items}
      </ul>
    </div>`;
}

// ---------------------------------------------------------------------------
// RENDER ONE LOCATION PAGE
// ---------------------------------------------------------------------------
function renderLocationPage(meta, bodyHtml, svc, citySlug, domain, noindex, gtmId) {
  const cfg       = SERVICE_CONFIG[svc];
  const canonical = `${domain}/${svc}/${citySlug}/`;
  const robots    = noindex ? 'noindex, nofollow' : 'index, follow';
  const cityName  = cityDisplay(citySlug);

  // Breadcrumb
  const breadcrumb = `<nav class="g2bc-breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/services/">Services</a></li>
        <li><a href="${cfg.hubUrl}">${cfg.label}</a></li>
        <li><span class="current">${cityName}</span></li>
      </ol>
    </nav>`;

  // Services sidebar list
  const serviceLinks = cfg.siblings.map(s =>
    `<li><a href="${s.url}">${s.label}</a></li>`
  ).join('\n        ');

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': `${cfg.label} in ${cityName}, KS`,
    'provider': {
      '@type': 'LocalBusiness',
      'name': 'Good To Be Clean',
      'telephone': '+13163206767',
      'url': domain,
    },
    'areaServed': {
      '@type': 'City',
      'name': cityName,
      'addressRegion': 'KS',
    },
  });

  const gtmHead = gtmId ? `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');</script>
<!-- End Google Tag Manager -->` : '';

  const gtmBody = gtmId ? `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->` : '';

  return `<!DOCTYPE html>
<html lang="en" id="top">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${meta.title || `${cfg.label} ${cityName} KS | Good To Be Clean`}</title>
<meta name="description" content="${meta.description || ''}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="/images/favicon.ico" type="image/x-icon">
<!-- Open Graph -->
<meta property="og:title" content="${meta.title || ''}">
<meta property="og:description" content="${meta.description || ''}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${domain}/images/og-default.jpg">
<meta property="og:site_name" content="Good To Be Clean">
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${meta.title || ''}">
<meta name="twitter:description" content="${meta.description || ''}">
<meta name="twitter:image" content="${domain}/images/og-default.jpg">
<script type="application/ld+json">${schema}</script>
${gtmHead}
<!-- PARTIALS:HEAD -->
</head>
<body>
${gtmBody}
<!-- PARTIALS:HEADER -->
<section class="page-hero">
  <div class="container">
    <h1>${meta.title ? meta.title.split('|')[0].trim() : `${cfg.label} in ${cityName}, KS`}</h1>
    <p class="hero-subtitle">${cfg.label} — IICRC-certified, locally owned, serving ${cityName} and surrounding communities.</p>
    ${breadcrumb}
  </div>
</section>
<main>
<div class="kg-service-layout">
  <article class="kg-location-content">
    ${bodyHtml}
  </article>
  <aside class="kg-service-sidebar">
    <div class="kg-sidebar-box kg-sidebar-cta">
      <h6>Call Us 24/7</h6>
      <a href="tel:+13163206767" class="kg-sidebar-phone">${cfg.phone}</a>
      <button data-token="c16253424f6b4892b361c09f8540203f" data-orgname="Good-To-Be-Clean" onclick="HCPWidget.openModal()" class="hcp-button kg-book-btn">Book Online</button>
    </div>
    <div class="kg-sidebar-box">
      <h6>Our Services</h6>
      <ul>
        <li><a href="${cfg.hubUrl}">${cfg.label}</a></li>
        ${serviceLinks}
      </ul>
    </div>
    <!-- CITY_LINKS_SIDEBAR -->
  </aside>
</div>
</main>
<!-- PARTIALS:FOOTER -->
<!-- HCP Widget -->
<script type="text/javascript" src="https://www.homeadvisor.com/static/v1/widget/hcpWidget.js"></script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
function buildLocationPages({ srcBase, distDir, domain, noindex, gtmId, partials, sitemapUrls }) {
  const services = Object.keys(SERVICE_CONFIG);
  let total = 0;

  for (const svc of services) {
    const svcSrcDir = path.join(srcBase, svc);
    if (!fs.existsSync(svcSrcDir)) {
      console.warn(`  ⚠  location-pages src missing: ${svc}`);
      continue;
    }

    // Pre-build the city links sidebar for this service
    const cityLinksSidebar = buildCityLinks(svc, SERVICE_CONFIG[svc].label, srcBase);

    const mdFiles = fs.readdirSync(svcSrcDir).filter(f => f.endsWith('.md')).sort();

    for (const mdFile of mdFiles) {
      const raw  = fs.readFileSync(path.join(svcSrcDir, mdFile), 'utf8');
      const { meta, body } = parseFrontmatter(raw);

      // slug from frontmatter: /carpet-cleaning/andover-ks/
      const slug     = (meta.slug || '').replace(/^\/|\/$/g, ''); // strip leading/trailing slashes
      if (!slug) { console.warn(`  ⚠  no slug in ${svc}/${mdFile}`); continue; }

      const citySlug = slug.split('/').pop(); // e.g. andover-ks
      const bodyHtml = mdToHtml(body);

      // Render full page HTML
      let html = renderLocationPage(meta, bodyHtml, svc, citySlug, domain, noindex, gtmId);

      // Inject shared partials
      html = html
        .replace('<!-- PARTIALS:HEAD -->', partials.head || '')
        .replace('<!-- PARTIALS:HEADER -->', partials.header || '')
        .replace('<!-- PARTIALS:FOOTER -->', partials.footer || '')
        .replace('<!-- CITY_LINKS_SIDEBAR -->', cityLinksSidebar);

      // Write to dist
      const outDir = path.join(distDir, ...slug.split('/'));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');

      // Add to sitemap
      if (sitemapUrls) sitemapUrls.push(`${domain}/${slug}/`);
      total++;
    }
    console.log(`  ✓ ${svc} — ${mdFiles.length} location pages`);
  }

  console.log(`  ✓ location pages total: ${total}`);
  return total;
}

module.exports = { buildLocationPages };
