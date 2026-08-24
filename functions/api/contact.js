/**
 * Contact Form Handler — Cloudflare Pages Function
 * Route: /api/contact (POST)
 *
 * Validates Turnstile token, then sends email via Gmail API
 * (service account: openclawagent@killergrowth.iam.gserviceaccount.com)
 *
 * Required environment variables (set in CF Pages dashboard):
 *   TURNSTILE_SECRET_KEY  — from Cloudflare dashboard (widget for goodtobeclean-v2.pages.dev)
 *   GMAIL_SA_KEY_JSON     — full service account JSON (stringified)
 *   NOTIFY_EMAIL          — recipient email (tylernorris@killergrowth.com for staging)
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: 'Invalid request body' }, 400, corsHeaders);
  }

  const { name, phone, email, service, message, token } = body;

  // Basic field validation
  if (!name || !email || !message) {
    return jsonResponse({ success: false, error: 'Missing required fields' }, 400, corsHeaders);
  }

  // Validate Turnstile token
  if (env.TURNSTILE_SECRET_KEY) {
    const turnstileOk = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, request);
    if (!turnstileOk) {
      return jsonResponse({ success: false, error: 'Bot verification failed. Please try again.' }, 403, corsHeaders);
    }
  }

  // Build email content
  const subject = `New Contact Form Submission — Good To Be Clean${service ? ' [' + service + ']' : ''}`;
  const textBody = [
    'New contact form submission from goodtobeclean-v2.pages.dev',
    '',
    `Name:    ${name}`,
    `Phone:   ${phone || 'Not provided'}`,
    `Email:   ${email}`,
    `Service: ${service || 'Not specified'}`,
    '',
    'Message:',
    message,
    '',
    '---',
    'Submitted via Good To Be Clean v2 contact form',
  ].join('\n');

  // Send email
  const notifyEmail = env.NOTIFY_EMAIL || 'tylernorris@killergrowth.com';

  try {
    await sendEmailViaGmail(env.GMAIL_SA_KEY_JSON, notifyEmail, subject, textBody, email);
    return jsonResponse({ success: true }, 200, corsHeaders);
  } catch (err) {
    console.error('Email send error:', err.message);
    // Don't expose internals — log and return generic error
    return jsonResponse({ success: false, error: 'Could not send message. Please call (316) 320-6767.' }, 500, corsHeaders);
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}

async function verifyTurnstile(token, secretKey, request) {
  if (!token) return false;
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const form = new FormData();
  form.append('secret', secretKey);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  const data = await res.json();
  return data.success === true;
}

async function sendEmailViaGmail(saKeyJson, to, subject, textBody, replyTo) {
  if (!saKeyJson) {
    // Dev/staging fallback: just log it
    console.log('[DEV] Would send email:', { to, subject, replyTo });
    console.log(textBody);
    return;
  }

  const sa = JSON.parse(saKeyJson);

  // Build JWT for service account
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    scope: 'https://www.googleapis.com/auth/gmail.send',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const jwt = await buildJwt(header, payload, sa.private_key);

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error('Failed to get access token: ' + JSON.stringify(tokenData));
  }

  // Build RFC 2822 message
  const emailLines = [
    `To: ${to}`,
    `From: Good To Be Clean <${sa.client_email}>`,
    `Reply-To: ${replyTo}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    textBody,
  ];
  const rawMessage = btoa(unescape(encodeURIComponent(emailLines.join('\r\n'))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  // Send via Gmail API
  const sendRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(sa.client_email)}/messages/send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: rawMessage }),
    }
  );

  if (!sendRes.ok) {
    const errBody = await sendRes.text();
    throw new Error(`Gmail API error ${sendRes.status}: ${errBody}`);
  }
}

async function buildJwt(header, payload, privateKeyPem) {
  const encode = obj => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const signingInput = encode(header) + '.' + encode(payload);

  // Import RSA private key
  const pemBody = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const keyBytes = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return signingInput + '.' + sigB64;
}
