/**
 * Good To Be Clean v2 — build.js
 * --------------------------------
 * 1. Reads all .html page templates from src/
 * 2. Injects _partials/head.html, header.html, footer.html
 * 3. Inserts GTM <head> script
 * 4. Applies noindex meta (until Tyler N flips to index)
 * 5. Copies assets (css, js, fonts, images, data)
 * 6. Generates /dist/sitemap.xml from all built pages
 * 7. Outputs built files to /dist/
 *
 * Usage:
 *   node build.js            → standard build (noindex ON)
 *   node build.js --index    → production build (noindex OFF, for Tyler N approval)
 *   node build.js --watch    → watch mode (not yet implemented)
 */

const fs   = require('fs');
const path = require('path');

// ─── Config ────────────────────────────────────────────────────────────────
const SITE_ROOT   = __dirname;
const SRC_DIR     = path.join(SITE_ROOT, 'src');
const DIST_DIR    = path.join(SITE_ROOT, 'dist');
const PARTIALS_DIR = path.join(SITE_ROOT, '_partials');

const SITE_URL    = 'https://goodtobeclean-v2.pages.dev'; // swap to live domain when promoted
const GTM_ID      = 'GTM-WQWXWSB9';
const HCP_TOKEN   = 'c16253424f6b4892b361c09f8540203f';

const APPLY_INDEX = process.argv.includes('--index');
const ROBOTS_CONTENT = APPLY_INDEX
  ? '<meta name="robots" content="index, follow">'
  : '<meta name="robots" content="noindex, nofollow">';

// ─── Helpers ───────────────────────────────────────────────────────────────
function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] File not found: ${filePath}`);
    return '';
  }
  return fs.readFileSync(filePath, 'utf8');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function walkHtml(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtml(fullPath, fileList);
    } else if (entry.name.endsWith('.html')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// Derive URL slug from dist file path
function fileToUrl(distFilePath) {
  let rel = path.relative(DIST_DIR, distFilePath).replace(/\\/g, '/');
  // /dist/index.html → /
  if (rel === 'index.html') return '/';
  // /dist/about/index.html → /about/
  if (rel.endsWith('/index.html')) {
    return '/' + rel.replace('/index.html', '') + '/';
  }
  // /dist/contact.html → /contact/
  return '/' + rel.replace('.html', '') + '/';
}

// ─── Load partials ──────────────────────────────────────────────────────────
const partialHead   = readFile(path.join(PARTIALS_DIR, 'head.html'));
const partialHeader = readFile(path.join(PARTIALS_DIR, 'header.html'));
const partialFooter = readFile(path.join(PARTIALS_DIR, 'footer.html'));

// GTM <head> snippet
const GTM_HEAD = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');</script>
<!-- End Google Tag Manager -->`;

// ─── Build one HTML file ────────────────────────────────────────────────────
function buildPage(srcFilePath) {
  let html = readFile(srcFilePath);

  // Determine relative path from src root
  const relPath = path.relative(SRC_DIR, srcFilePath);
  const destPath = path.join(DIST_DIR, relPath);
  ensureDir(path.dirname(destPath));

  // Extract page-level meta from template comments
  // Templates should have: <!-- META_TITLE: ... --> <!-- META_DESC: ... --> <!-- META_CANONICAL: ... -->
  const titleMatch  = html.match(/<!--\s*META_TITLE:\s*(.*?)\s*-->/i);
  const descMatch   = html.match(/<!--\s*META_DESC:\s*(.*?)\s*-->/i);
  const canonMatch  = html.match(/<!--\s*META_CANONICAL:\s*(.*?)\s*-->/i);
  const ogTypeMatch = html.match(/<!--\s*OG_TYPE:\s*(.*?)\s*-->/i);

  const pageTitle    = titleMatch  ? titleMatch[1]  : 'Good To Be Clean | Professional Cleaning & Restoration in Kansas';
  const pageDesc     = descMatch   ? descMatch[1]   : 'Good To Be Clean provides expert carpet cleaning, air duct cleaning, water damage restoration, and mold remediation services across Butler, Sedgwick, Harvey, and Greenwood counties in Kansas.';
  const pageCanon    = canonMatch  ? canonMatch[1]  : SITE_URL + fileToUrl(destPath);
  const ogType       = ogTypeMatch ? ogTypeMatch[1] : 'website';

  // Schema placeholder extraction
  const schemaMatch = html.match(/<!--\s*SCHEMA_START\s*-->([\s\S]*?)<!--\s*SCHEMA_END\s*-->/i);
  const schemaBlock = schemaMatch
    ? `<script type="application/ld+json">${schemaMatch[1].trim()}</script>`
    : '';

  // Remove all META comment directives from the template content
  html = html
    .replace(/<!--\s*META_TITLE:.*?-->/gi, '')
    .replace(/<!--\s*META_DESC:.*?-->/gi, '')
    .replace(/<!--\s*META_CANONICAL:.*?-->/gi, '')
    .replace(/<!--\s*OG_TYPE:.*?-->/gi, '')
    .replace(/<!--\s*SCHEMA_START\s*-->[\s\S]*?<!--\s*SCHEMA_END\s*-->/gi, '');

  // Build full <head> content
  const headContent = `
<title>${pageTitle}</title>
<meta name="description" content="${pageDesc}">
${ROBOTS_CONTENT}
<link rel="canonical" href="${pageCanon}">
<!-- Open Graph -->
<meta property="og:title" content="${pageTitle}">
<meta property="og:description" content="${pageDesc}">
<meta property="og:url" content="${pageCanon}">
<meta property="og:type" content="${ogType}">
<meta property="og:image" content="${SITE_URL}/images/og/og-default.jpg">
<meta property="og:site_name" content="Good To Be Clean">
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${pageTitle}">
<meta name="twitter:description" content="${pageDesc}">
<meta name="twitter:image" content="${SITE_URL}/images/og/og-default.jpg">
${GTM_HEAD}
${schemaBlock}
${partialHead}
`.trim();

  // Inject into page wrapper
  // Template pages must have {{HEAD}}, {{HEADER}}, {{FOOTER}} placeholders
  let output = html;

  if (html.includes('{{HEAD}}')) {
    output = output.replace('{{HEAD}}', headContent);
  } else {
    // Wrap bare body content in full page shell
    output = buildPageShell(headContent, partialHeader, html, partialFooter);
  }

  output = output.replace('{{HEADER}}', partialHeader);
  output = output.replace('{{FOOTER}}', partialFooter);

  fs.writeFileSync(destPath, output, 'utf8');
  return destPath;
}

function buildPageShell(headContent, header, bodyContent, footer) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
${headContent}
</head>
<body>
${header}
${bodyContent}
${footer}
<a href="#top" class="scroll-top" aria-label="Back to top"><i class="fas fa-arrow-up"></i></a>
</body>
</html>`;
}

// ─── Generate sitemap.xml ───────────────────────────────────────────────────
function generateSitemap(builtFiles) {
  const today = new Date().toISOString().split('T')[0];

  const urls = builtFiles.map(function (filePath) {
    const url = SITE_URL + fileToUrl(filePath);
    // Give homepage highest priority, location/service pages medium, rest standard
    let priority = '0.7';
    let changefreq = 'monthly';
    if (fileToUrl(filePath) === '/') {
      priority = '1.0'; changefreq = 'weekly';
    } else if (fileToUrl(filePath).match(/^\/services\//)) {
      priority = '0.9'; changefreq = 'monthly';
    } else if (fileToUrl(filePath).match(/^\/areas-served\//)) {
      priority = '0.8'; changefreq = 'monthly';
    } else if (fileToUrl(filePath).match(/^\/blog\//)) {
      priority = '0.6'; changefreq = 'weekly';
    }
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log(`[sitemap] Generated ${urls.length} URLs → dist/sitemap.xml`);
}

// ─── Generate robots.txt ───────────────────────────────────────────────────
function generateRobots() {
  const content = APPLY_INDEX
    ? `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n# noindex build — staging only\n`;

  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), content, 'utf8');
  console.log(`[robots] Generated robots.txt (index=${APPLY_INDEX})`);
}

// ─── Main Build ─────────────────────────────────────────────────────────────
function build() {
  console.log('\n🔨 Good To Be Clean v2 — Build starting...');
  console.log(`   noindex: ${!APPLY_INDEX} | output: ${DIST_DIR}\n`);

  const startTime = Date.now();

  // 1. Clean dist
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  ensureDir(DIST_DIR);

  // 2. Copy static assets
  const assetsToCopy = [
    ['assets', 'assets'],
    ['images', 'images'],
    ['data', 'data'],
    ['functions', 'functions'],
  ];

  for (const [srcFolder, destFolder] of assetsToCopy) {
    const srcPath  = path.join(SITE_ROOT, srcFolder);
    const destPath = path.join(DIST_DIR, destFolder);
    copyDir(srcPath, destPath);
    if (fs.existsSync(srcPath)) {
      console.log(`[assets] Copied /${srcFolder}/ → dist/${destFolder}/`);
    }
  }

  // 3. Copy root-level static files
  const rootFiles = ['_worker.js', '_routes.json', '_headers', '_redirects', 'favicon.ico'];
  for (const fname of rootFiles) {
    const srcFile = path.join(SITE_ROOT, fname);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(DIST_DIR, fname));
      console.log(`[static] Copied ${fname}`);
    }
  }

  // 4. Build all HTML pages from src/
  const srcFiles = walkHtml(SRC_DIR);
  const builtFiles = [];

  for (const srcFile of srcFiles) {
    const dest = buildPage(srcFile);
    builtFiles.push(dest);
  }

  console.log(`[pages]  Built ${builtFiles.length} pages`);

  // 5. Generate sitemap and robots
  generateSitemap(builtFiles);
  generateRobots();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Build complete in ${elapsed}s → ${DIST_DIR}`);
  console.log(`   Pages: ${builtFiles.length} | Sitemap: ${builtFiles.length} URLs\n`);
}

build();
