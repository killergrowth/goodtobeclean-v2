'use strict';
const crypto = require('crypto');
const https  = require('https');
const fs     = require('fs');
const path   = require('path');

const PLACE_ID = 'ChIJQZ7qDKCzu4cR6A1pHISd9_Y'; // Good To Be Clean, El Dorado KS
const OUT_FILE = path.join(__dirname, '..', 'data', 'reviews.json');

function getServiceAccount() {
  const raw = process.env.GOOGLE_SA_JSON;
  if (!raw) { console.error('GOOGLE_SA_JSON not set'); process.exit(1); }
  try { return JSON.parse(raw); }
  catch (e) { console.error('GOOGLE_SA_JSON is not valid JSON:', e.message); process.exit(1); }
}

function makeJwt(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claims = Buffer.from(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600
  })).toString('base64url');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(header + '.' + claims);
  return header + '.' + claims + '.' + sign.sign(privateKey, 'base64url');
}

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getAccessToken(clientEmail, privateKey) {
  const jwt = makeJwt(clientEmail, privateKey);
  const body = 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt;
  const res = await httpRequest({
    hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
  }, body);
  const parsed = JSON.parse(res.body);
  if (!parsed.access_token) throw new Error('Token error: ' + res.body);
  return parsed.access_token;
}

async function main() {
  console.log('Fetching access token...');
  const sa = getServiceAccount();
  let accessToken;
  try {
    accessToken = await getAccessToken(sa.client_email, sa.private_key);
  } catch (err) {
    console.error('Auth failed:', err.message);
    process.exit(0); // non-destructive exit
  }

  console.log(`Fetching place details for ${PLACE_ID}...`);
  let place;
  try {
    const res = await httpRequest({
      hostname: 'places.googleapis.com',
      path: `/v1/places/${PLACE_ID}`,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'X-Goog-FieldMask': 'reviews,rating,userRatingCount'
      }
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${res.body}`);
    place = JSON.parse(res.body);
  } catch (err) {
    console.error('Places API failed:', err.message);
    process.exit(0); // non-destructive exit
  }

  const allReviews = place.reviews || [];
  const fiveStars  = allReviews.filter(r => r.rating === 5);
  console.log(`Got ${allReviews.length} reviews total, ${fiveStars.length} are 5-star`);

  const output = {
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    fetchedAt: new Date().toISOString(),
    reviews: fiveStars.map(r => ({
      author:       r.authorAttribution ? r.authorAttribution.displayName : 'Verified Customer',
      rating:       r.rating,
      relativeTime: r.relativePublishTimeDescription || '',
      text:         r.text ? r.text.text : '',
      publishTime:  r.publishTime || null
    }))
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`✓ Wrote reviews.json — rating: ${output.rating}, count: ${output.userRatingCount}, 5-star: ${fiveStars.length}`);
}

main().catch(err => { console.error('Unexpected error:', err.message); process.exit(0); });
