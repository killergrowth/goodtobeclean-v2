/**
 * Good To Be Clean v2 — Contact Form Handler
 * Cloudflare Pages Function: /submit
 *
 * Environment variables (set in CF Pages dashboard → Settings → Variables):
 *   RECAPTCHA_SITE_KEY    — Google reCAPTCHA Enterprise site key
 *   GMAIL_SA_KEY          — JSON string of Google service account credentials
 *   TO_EMAIL              — Recipient email (staging: tylernorris@killergrowth.com)
 *   FROM_EMAIL            — Sender address (e.g. contact@goodtobeclean.com)
 */

export async function onRequestPost({ request, env }) {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await request.json();

    // -----------------------------------------------------------------------
    // 1. Validate required fields
    // -----------------------------------------------------------------------
    const { name, email, message } = body;
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields.' }), { status: 400, headers });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email address.' }), { status: 400, headers });
    }

    // -----------------------------------------------------------------------
    // 2. Verify reCAPTCHA Enterprise token
    // -----------------------------------------------------------------------
    const recaptchaToken = body['g-recaptcha-response'];
    if (!recaptchaToken) {
      return new Response(JSON.stringify({ success: false, error: 'Security check failed. Please try again.' }), { status: 400, headers });
    }

    const siteKey = env.RECAPTCHA_SITE_KEY;
    const saCredentials = JSON.parse(env.GMAIL_SA_KEY);
    const gcpToken = await getGcpAccessToken(saCredentials);

    const rcRes = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/killergrowth/assessments`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${gcpToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: { token: recaptchaToken, siteKey, expectedAction: 'submit' },
        }),
      }
    );

    const rcData = await rcRes.json();
    const score = rcData?.riskAnalysis?.score ?? rcData?.score ?? 0;
    const valid = rcData?.tokenProperties?.valid ?? false;

    if (!valid || score < 0.5) {
      console.error('reCAPTCHA failed:', JSON.stringify(rcData));
      return new Response(JSON.stringify({ success: false, error: 'Security verification failed. Please try again.' }), { status: 403, headers });
    }

    // -----------------------------------------------------------------------
    // 3. Build email content
    // -----------------------------------------------------------------------
    const service = body.service || 'Not specified';
    const phone   = body.phone   || 'Not provided';

    const emailBody = [
      `New Contact Form Submission — Good To Be Clean`,
      ``,
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Phone:   ${phone}`,
      `Service: ${service}`,
      ``,
      `Message:`,
      message,
      ``,
      `---`,
      `Submitted via goodtobeclean-v2.pages.dev/contact/`,
      `Timestamp: ${new Date().toISOString()}`,
    ].join('\n');

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e4ef;border-radius:6px;overflow:hidden;">
        <div style="background:#000e39;padding:24px 32px;">
          <img src="https://goodtobeclean-v2.pages.dev/images/logo.png" alt="Good To Be Clean" height="44" style="filter:brightness(0) invert(1);">
        </div>
        <div style="padding:32px;">
          <h2 style="color:#000e39;margin-top:0;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#666;font-size:14px;width:100px;"><strong>Name</strong></td><td style="padding:8px 0;font-size:14px;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:8px 0;color:#666;font-size:14px;"><strong>Email</strong></td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding:8px 0;color:#666;font-size:14px;"><strong>Phone</strong></td><td style="padding:8px 0;font-size:14px;">${escapeHtml(phone)}</td></tr>
            <tr><td style="padding:8px 0;color:#666;font-size:14px;"><strong>Service</strong></td><td style="padding:8px 0;font-size:14px;">${escapeHtml(service)}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #e0e4ef;margin:20px 0;">
          <h3 style="color:#000e39;font-size:15px;">Message</h3>
          <p style="color:#333;line-height:1.7;font-size:14px;">${escapeHtml(message).replace(/\n/g, '<br>')}</p>
          <hr style="border:none;border-top:1px solid #e0e4ef;margin:20px 0;">
          <p style="color:#999;font-size:12px;">Submitted via goodtobeclean-v2.pages.dev/contact/ on ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST</p>
        </div>
      </div>
    `;

    // -----------------------------------------------------------------------
    // 4. Send email via Gmail API (service account)
    // -----------------------------------------------------------------------
    const toEmail   = env.TO_EMAIL   || 'tylernorris@killergrowth.com';
    const fromEmail = `Good To Be Clean <notifications@killergrowth.com>`;
    const replyTo   = `${name} <${email}>`;

    const sent = await sendGmailSA({
      credentials: JSON.parse(env.GMAIL_SA_KEY),
      to: toEmail,
      from: fromEmail,
      replyTo,
      subject: `[G2BC Form] New inquiry from ${name}`,
      text: emailBody,
      html: htmlBody,
    });

    if (!sent) throw new Error('Email send failed');

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });

  } catch (err) {
    console.error('submit.js error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error. Please call us at (316) 320-6767.' }), { status: 500, headers });
  }
}

// CORS preflight
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

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Send an email via Gmail API using a Google service account.
 * The service account must have domain-wide delegation with Gmail send scope,
 * or the from address must be in the SA's allowed senders list.
 */
async function sendGmailSA({ credentials, to, from, replyTo, subject, text, html }) {
  // Build JWT for service account
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/gmail.send',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
    sub: 'notifications@killergrowth.com', // DWD impersonation — sending as notifications inbox
  };

  const jwt = await createJwt(payload, credentials.private_key);

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
    console.error('Gmail token error:', tokenData);
    return false;
  }

  // Build RFC 2822 message
  const boundary = 'g2bc_boundary_' + Math.random().toString(36).slice(2);
  const rawEmail = [
    `From: ${from}`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    text,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    html,
    ``,
    `--${boundary}--`,
  ].join('\r\n');

  const encoded = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded }),
  });

  if (!gmailRes.ok) {
    const err = await gmailRes.text();
    console.error('Gmail send error:', err);
    return false;
  }

  return true;
}

/**
 * Get a GCP access token using the service account credentials.
 * Used for reCAPTCHA Enterprise verification.
 */
async function getGcpAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const jwt = await createJwt(payload, credentials.private_key);

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error('GCP token error: ' + JSON.stringify(tokenData));
  return tokenData.access_token;
}

/**
 * Create a signed JWT using the RSA private key from the service account.
 * Uses the Web Crypto API (available in Cloudflare Workers/Pages Functions).
 */
async function createJwt(payload, privateKeyPem) {
  const header = { alg: 'RS256', typ: 'JWT' };

  const encode = (obj) => btoa(JSON.stringify(obj))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const headerB64  = encode(header);
  const payloadB64 = encode(payload);
  const data       = `${headerB64}.${payloadB64}`;

  // Import the RSA private key
  const pem = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const keyBuffer = Uint8Array.from(atob(pem), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(data),
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${data}.${sigB64}`;
}
