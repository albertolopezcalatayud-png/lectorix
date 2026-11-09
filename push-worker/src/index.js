/**
 * Lectorix push reminders — Cloudflare Worker
 *
 * Stores only what is needed to send a reminder: the browser's push endpoint,
 * the chosen hour, the time zone and the last practice date. No names, no emails.
 *
 * Routes (JSON):
 *   POST /subscribe    { subscription, hour, tz }  -> save / update
 *   POST /unsubscribe  { endpoint }                -> delete
 *   POST /practiced    { endpoint, date }          -> mark today as practiced
 *   GET  /health
 * Cron (every hour): send a payload-less push to every subscriber whose local
 * hour matches and who has not practised today. The service worker builds the text.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

// ── helpers ─────────────────────────────────────────────
const b64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlToBytes = (s) => {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function keyFor(endpoint) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return 'sub:' + b64url(h);
}

export function localParts(tz, now = new Date()) {
  let zone = tz;
  try { new Intl.DateTimeFormat('en', { timeZone: zone }); } catch { zone = 'Europe/Madrid'; }
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
    }).formatToParts(now).map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: parseInt(parts.hour, 10) };
}

function validEndpoint(ep) {
  try {
    const u = new URL(ep);
    return u.protocol === 'https:' && ep.length < 1000;
  } catch { return false; }
}

// ── VAPID (RFC 8292) ────────────────────────────────────
// Keys are generated once on first use and kept in KV, so nobody has to
// create or copy them by hand. (VAPID_* env vars still override if present.)
export async function getVapid(env) {
  if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) return { pub: env.VAPID_PUBLIC_KEY, priv: env.VAPID_PRIVATE_KEY };
  const stored = await env.SUBS.get('config:vapid', 'json');
  if (stored) return stored;
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
  const raw = await crypto.subtle.exportKey('raw', pair.publicKey);
  const keys = { pub: b64url(raw), priv: jwk.d };
  await env.SUBS.put('config:vapid', JSON.stringify(keys));
  return keys;
}

async function vapidHeaders(endpoint, env) {
  const { pub: publicKey, priv: privateKey } = await getVapid(env);
  const aud = new URL(endpoint).origin;
  const header = b64url(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = b64url(new TextEncoder().encode(JSON.stringify({
    aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT || 'mailto:inorderwords@gmail.com',
  })));
  const pub = b64urlToBytes(publicKey); // 65 bytes, uncompressed point
  const jwk = {
    kty: 'EC', crv: 'P-256', ext: true,
    x: b64url(pub.slice(1, 33)), y: b64url(pub.slice(33, 65)), d: privateKey,
  };
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(`${header}.${payload}`));
  return { Authorization: `vapid t=${header}.${payload}.${b64url(sig)}, k=${publicKey}`, TTL: '3600', Urgency: 'normal' };
}

export async function sendPush(endpoint, env, fetchImpl = fetch) {
  const headers = await vapidHeaders(endpoint, env);
  return fetchImpl(endpoint, { method: 'POST', headers: { ...headers, 'Content-Length': '0' } });
}

// ── cron ────────────────────────────────────────────────
export async function runReminders(env, now = new Date(), fetchImpl = fetch) {
  let cursor; let sent = 0; let removed = 0; let checked = 0;
  do {
    const page = await env.SUBS.list({ prefix: 'sub:', cursor });
    cursor = page.list_complete ? undefined : page.cursor;
    for (const k of page.keys) {
      const rec = await env.SUBS.get(k.name, 'json');
      if (!rec) continue;
      checked++;
      const { date, hour } = localParts(rec.tz, now);
      if (hour !== rec.hour || rec.lastPracticed === date || rec.lastSent === date) continue;
      let res;
      try {
        res = await sendPush(rec.endpoint, env, fetchImpl);
      } catch (err) {
        // One failing push service must never stop the reminders for everyone else
        console.error('push failed', new URL(rec.endpoint).host, String(err));
        continue;
      }
      if (res.status === 404 || res.status === 410) {
        await env.SUBS.delete(k.name); removed++;         // browser unsubscribed
      } else if (res.ok) {
        rec.lastSent = date; await env.SUBS.put(k.name, JSON.stringify(rec)); sent++;
      }
    }
  } while (cursor);
  return { checked, sent, removed };
}

// ── HTTP ────────────────────────────────────────────────
export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const { pathname } = new URL(req.url);
    if (req.method === 'GET' && (pathname === '/health' || pathname === '/key')) return json({ ok: true, publicKey: (await getVapid(env)).pub });
    if (req.method !== 'POST') return json({ error: 'not found' }, 404);

    let body;
    try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }

    if (pathname === '/subscribe') {
      const sub = body.subscription;
      const hour = Number(body.hour);
      if (!sub || !validEndpoint(sub.endpoint) || !Number.isInteger(hour) || hour < 0 || hour > 23) {
        return json({ error: 'invalid' }, 400);
      }
      const key = await keyFor(sub.endpoint);
      const prev = (await env.SUBS.get(key, 'json')) || {};
      const rec = {
        endpoint: sub.endpoint,
        hour,
        tz: typeof body.tz === 'string' ? body.tz.slice(0, 64) : 'Europe/Madrid',
        lastPracticed: prev.lastPracticed || null,
        lastSent: prev.lastSent || null,
      };
      await env.SUBS.put(key, JSON.stringify(rec));
      return json({ ok: true });
    }

    if (pathname === '/unsubscribe') {
      if (!validEndpoint(body.endpoint)) return json({ error: 'invalid' }, 400);
      await env.SUBS.delete(await keyFor(body.endpoint));
      return json({ ok: true });
    }

    if (pathname === '/practiced') {
      if (!validEndpoint(body.endpoint)) return json({ error: 'invalid' }, 400);
      const key = await keyFor(body.endpoint);
      const rec = await env.SUBS.get(key, 'json');
      if (rec) {
        rec.lastPracticed = /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : localParts(rec.tz).date;
        await env.SUBS.put(key, JSON.stringify(rec));
      }
      return json({ ok: true });
    }

    return json({ error: 'not found' }, 404);
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runReminders(env));
  },
};
