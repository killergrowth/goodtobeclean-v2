'use strict';
const https = require('https');
const fs    = require('fs');

const REPO = 'killergrowth/goodtobeclean-v2';

// Read from credentials
const creds   = fs.readFileSync('C:/Users/KillerGrowth/.openclaw/workspace/references/credentials.md', 'utf8');
const ghMatch = creds.match(/ghp_[A-Za-z0-9]+/);
const cfMatch = creds.match(/cfut_[A-Za-z0-9]+/);
const saBlock = creds.match(/```json\s*(\{[\s\S]*?"private_key"[\s\S]*?\})\s*```/);

if (!ghMatch) { console.error('No GitHub token found'); process.exit(1); }
if (!cfMatch) { console.error('No CF token found'); process.exit(1); }
if (!saBlock) { console.error('No SA JSON found'); process.exit(1); }

const GH_TOKEN = ghMatch[0];
const CF_TOKEN = cfMatch[0];
const SA_JSON  = JSON.stringify(JSON.parse(saBlock[1]));

function ghRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com', path, method,
      headers: {
        'Authorization': 'token ' + GH_TOKEN,
        'User-Agent': 'KillerGrowth',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function encryptSecret(publicKeyB64, secretValue) {
  const _sodium = require('libsodium-wrappers');
  await _sodium.ready;
  const keyBytes = Buffer.from(publicKeyB64, 'base64');
  const msgBytes = Buffer.from(secretValue, 'utf8');
  return Buffer.from(_sodium.crypto_box_seal(msgBytes, keyBytes)).toString('base64');
}

async function main() {
  const pkRes = await ghRequest('GET', `/repos/${REPO}/actions/secrets/public-key`);
  if (pkRes.status !== 200) { console.error('Public key fetch failed:', pkRes.body); return; }
  const { key_id, key } = JSON.parse(pkRes.body);
  console.log('Got public key, key_id:', key_id);

  const secrets = [
    ['GOOGLE_SA_JSON',        SA_JSON],
    ['CLOUDFLARE_API_TOKEN',  CF_TOKEN]
  ];

  for (const [name, value] of secrets) {
    const encrypted = await encryptSecret(key, value);
    const res = await ghRequest('PUT', `/repos/${REPO}/actions/secrets/${name}`, { encrypted_value: encrypted, key_id });
    const label = res.status === 201 ? 'CREATED' : res.status === 204 ? 'UPDATED' : `ERROR(${res.status})`;
    console.log(`${name}: ${label}`);
  }
}

main().catch(console.error);
