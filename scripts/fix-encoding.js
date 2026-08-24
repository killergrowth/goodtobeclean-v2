/**
 * fix-encoding.js
 * Fixes triple-encoded mojibake left in source HTML files.
 *
 * History: files were originally UTF-8, got saved as Latin-1 (UTF-8 bytes
 * treated as single chars), then re-saved as UTF-8 again — turning e.g.
 * the em dash (U+2014, bytes E2 80 94) into the byte sequence
 * C3A2 E282AC C294, which when read as UTF-8 is U+00E2 U+20AC U+0094.
 * A prior entity-replacement pass then converted the trailing smart-quote
 * chars (U+201C/D/8/9) to &ldquo; etc., leaving â€&rdquo; style fragments.
 *
 * This script matches those U+00E2 U+20AC combos and replaces them cleanly.
 */

const fs   = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

function walk(dir) {
  let out = [];
  for (const f of fs.readdirSync(dir)) {
    if (['node_modules', 'dist', '.git', '.wrangler'].includes(f)) continue;
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) out = out.concat(walk(fp));
    else if (f.endsWith('.src.html') || f.endsWith('.html')) out.push(fp);
  }
  return out;
}

// U+00E2 U+20AC is the double-encoded prefix of any original 3-byte UTF-8 sequence
// starting with 0xE2 0x80. The third byte determines which char it was.
// After my entity pass, the third byte is now an entity string or a control char.

const fixes = [
  // em dash (E2 80 94) — third byte C2 94 → control U+0094; or replaced with &rdquo;/&ldquo;
  [/\u00e2\u20ac&rdquo;/g,  '&mdash;'],
  [/\u00e2\u20ac&ldquo;/g,  '&mdash;'],
  [/\u00e2\u20ac&rsquo;/g,  '&rsquo;'],   // was en-dash or right-single
  [/\u00e2\u20ac&lsquo;/g,  '&lsquo;'],
  [/\u00e2\u20ac&hellip;/g, '&hellip;'],
  [/\u00e2\u20ac&ndash;/g,  '&ndash;'],
  [/\u00e2\u20ac&nbsp;/g,   ' '],
  // Catch any remaining raw trailing control chars (U+0090–U+009F range)
  [/\u00e2\u20ac[\u0090-\u009f]/g, '&mdash;'],
  // Non-breaking space: C2 A0 → U+00C2 U+00A0
  [/\u00c2\u00a0/g, ' '],
];

let totalFiles = 0, totalHits = 0;

for (const f of walk(root)) {
  let s = fs.readFileSync(f, 'utf8');
  const orig = s;
  for (const [pat, repl] of fixes) {
    s = s.replace(pat, repl);
  }
  if (s !== orig) {
    fs.writeFileSync(f, s, 'utf8');
    const hits = (orig.match(/\u00e2\u20ac|\u00c2\u00a0/g) || []).length;
    console.log('Fixed ' + hits + ' hit(s): ' + path.relative(root, f));
    totalFiles++;
    totalHits += hits;
  }
}

console.log('\nDone: ' + totalHits + ' replacements across ' + totalFiles + ' files.');
