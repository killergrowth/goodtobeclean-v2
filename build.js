/**
 * Good To Be Clean v2 — Build Script
 * ====================================
 * 1. Reads partials (_partials/head.html, header.html, footer.html)
 * 2. Injects them into every *.src.html template → dist/
 * 3. Generates dist/sitemap.xml from all pages (excluding noindex pages)
 * 4. Copies assets (css, js, fonts, images) into dist/
 * 5. Runs blog-build.js (blog post rendering)
 * 6. Applies noindex meta tag globally (flipped to index on Tyler N approval)
 *
 * Usage:
 *   node build.js              — build to ./dist
 *   node build.js --watch      — rebuild on file change (dev)
 *   NODE_ENV=production node build.js  — production build (still noindex until approved)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
const ROOT   = __dirname;
const DIST   = path.join(ROOT, 'dist');
const DOMAIN = 'https://goodtobeclean-v2.pages.dev'; // Switch to prod domain when live
const NOINDEX = true; // Set to false only when Tyler N approves indexing

const GTM_ID     = 'GTM-WQWXWSB9';
const HCP_TOKEN  = 'c16253424f6b4892b361c09f8540203f';

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

// Walk a directory, returning all files matching a pattern
function walkFiles(dir, ext = '.html', results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip partials, node_modules, dist, _data
      if (['_partials', 'node_modules', 'dist', '_data', 'blog-posts'].includes(entry.name)) continue;
      walkFiles(full, ext, results);
    } else if (entry.name.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// LOAD PARTIALS
// ---------------------------------------------------------------------------
function loadPartials() {
  const head   = readFile(path.join(ROOT, '_partials', 'head.html'));
  const header = readFile(path.join(ROOT, '_partials', 'header.html'));
  const footer = readFile(path.join(ROOT, '_partials', 'footer.html'));
  return { head, header, footer };
}

// ---------------------------------------------------------------------------
// INJECT PARTIALS INTO PAGE
// ---------------------------------------------------------------------------
function injectPartials(html, partials, meta = {}) {
  const {
    title        = 'Good To Be Clean | Professional Cleaning & Restoration in Kansas',
    description  = 'Professional air duct cleaning, carpet cleaning, mold remediation, water damage restoration, and more across Wichita, El Dorado, and south-central Kansas.',
    canonical    = '',
    ogType       = 'website',
    ogImage      = `${DOMAIN}/images/og-default.jpg`,
    schema       = '',
    robots       = NOINDEX ? 'noindex, nofollow' : 'index, follow',
  } = meta;

  const gtmHead = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');</script>
<!-- End Google Tag Manager -->`;

  const fullHead = `<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="${robots}">
${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
<!-- Open Graph -->
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="${ogType}">
${canonical ? `<meta property="og:url" content="${canonical}">` : ''}
<meta property="og:image" content="${ogImage}">
<meta property="og:site_name" content="Good To Be Clean">
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${ogImage}">
${gtmHead}
${partials.head}
${schema}`;

  return html
    .replace('<!-- HEAD -->', fullHead)
    .replace('<!-- HEADER -->', partials.header)
    .replace('<!-- FOOTER -->', partials.footer);
}

// ---------------------------------------------------------------------------
// PROCESS A SINGLE TEMPLATE FILE
// ---------------------------------------------------------------------------
function processTemplate(srcFile, partials, sitemapUrls) {
  let html = readFile(srcFile);

  // Extract meta from template <!-- BUILD:meta ... --> comments
  const metaMatch = html.match(/<!--\s*BUILD:meta\s*([\s\S]*?)-->/);
  const meta = {};
  if (metaMatch) {
    const raw = metaMatch[1];
    const extract = (key) => {
      const m = raw.match(new RegExp(key + ':\\s*(.+)'));
      return m ? m[1].trim() : null;
    };
    if (extract('title'))       meta.title       = extract('title');
    if (extract('description')) meta.description = extract('description');
    if (extract('canonical'))   meta.canonical   = extract('canonical');
    if (extract('ogType'))      meta.ogType      = extract('ogType');
    if (extract('ogImage'))     meta.ogImage     = extract('ogImage');
    if (extract('noindex'))     meta.robots      = 'noindex, nofollow';
    // Remove the meta comment from output
    html = html.replace(metaMatch[0], '');
  }

  // Apply canonical from file path if not set
  if (!meta.canonical) {
    // Convert src path to URL slug
    const rel = path.relative(ROOT, srcFile).replace(/\\/g, '/');
    const slug = rel
      .replace(/\.src\.html$/, '')
      .replace(/index$/, '')
      .replace(/\/$/, '');
    meta.canonical = `${DOMAIN}/${slug ? slug + '/' : ''}`;
  }

  // Determine if this page gets added to sitemap
  const isNoindex = NOINDEX || meta.robots === 'noindex, nofollow';
  if (!isNoindex && sitemapUrls) {
    sitemapUrls.push(meta.canonical);
  } else if (sitemapUrls) {
    // Still track URL for sitemap even during noindex phase — will be useful later
    sitemapUrls.push(meta.canonical);
  }

  // Inject partials
  html = injectPartials(html, partials, meta);

  // Determine output path
  const rel = path.relative(ROOT, srcFile).replace(/\\/g, '/');
  const outRel = rel.replace(/\.src\.html$/, '.html');
  const outPath = path.join(DIST, outRel);

  writeFile(outPath, html);
}

// ---------------------------------------------------------------------------
// GENERATE SITEMAP
// ---------------------------------------------------------------------------
function generateSitemap(urls) {
  const today = new Date().toISOString().split('T')[0];
  const urlEntries = [...new Set(urls)]
    .filter(u => u && u.startsWith('http'))
    .map(url => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  writeFile(path.join(DIST, 'sitemap.xml'), xml);
  console.log(`  ✓ sitemap.xml — ${urls.length} URLs`);
}

// ---------------------------------------------------------------------------
// BLOG BUILD
// ---------------------------------------------------------------------------
function runBlogBuild() {
  try {
    const { buildBlog } = require('C:/Users/KillerGrowth/.openclaw/workspace/tools/kg-site-builder/lib/blog-build');
    buildBlog({
      siteId: 'goodtobeclean-v2',
      srcDir: ROOT,
      distDir: DIST,
      domain: DOMAIN,
      siteName: 'Good To Be Clean',
      primaryColor: '#d32f2f',
    });
    console.log('  ✓ blog build complete');
  } catch (err) {
    console.warn('  ⚠ blog-build.js not available or errored:', err.message);
  }
}

// ---------------------------------------------------------------------------
// MAIN BUILD
// ---------------------------------------------------------------------------
function build() {
  console.log('\n🔨 Good To Be Clean v2 — Build starting…\n');

  // 1. Clean and prep dist
  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
  ensureDir(DIST);

  // 2. Load partials
  const partials = loadPartials();
  console.log('  ✓ partials loaded');

  // 3. Copy static assets
  copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));
  copyDir(path.join(ROOT, 'images'), path.join(DIST, 'images'));
  console.log('  ✓ assets copied');

  // 4. Copy static files (robots.txt, _routes.json, _worker.js, _headers, _redirects)
  for (const file of ['robots.txt', '_routes.json', '_worker.js', '_headers', '_redirects', 'favicon.ico']) {
    const src = path.join(ROOT, file);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DIST, file));
  }

  // 5. Process all .src.html templates
  const templates = walkFiles(ROOT, '.src.html');
  const sitemapUrls = [];

  console.log(`  Processing ${templates.length} page templates…`);
  for (const tpl of templates) {
    processTemplate(tpl, partials, sitemapUrls);
  }
  console.log(`  ✓ ${templates.length} pages built`);

  // 6. Generate sitemap
  generateSitemap(sitemapUrls);

  // 7. Blog build
  runBlogBuild();

  // 8. Write robots.txt if not already present
  const robotsDst = path.join(DIST, 'robots.txt');
  if (!fs.existsSync(robotsDst)) {
    const robotsTxt = NOINDEX
      ? 'User-agent: *\nDisallow: /\n\nSitemap: ' + DOMAIN + '/sitemap.xml\n'
      : 'User-agent: *\nAllow: /\n\nSitemap: ' + DOMAIN + '/sitemap.xml\n';
    writeFile(robotsDst, robotsTxt);
    console.log('  ✓ robots.txt written (' + (NOINDEX ? 'NOINDEX mode' : 'index mode') + ')');
  }

  console.log('\n✅ Build complete → dist/\n');
  if (NOINDEX) {
    console.log('  ⚠  NOINDEX=true — site is not indexable. Flip NOINDEX to false after Tyler N approval.\n');
  }
}

build();
