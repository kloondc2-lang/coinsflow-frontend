/**
 * Login rate limiter — 5 failed attempts per IP per 15 minutes → 429.
 * Uses in-memory Map (resets on redeploy; fine for edge rate limiting).
 */

import { NextResponse } from 'next/server';

const WINDOW_MS   = 15 * 60 * 1000; // 15 minutes
const MAX_FAILS   = 5;

/** @type {Map<string, {attempts: number, windowStart: number}>} */
const store = new Map();

function getIp(req) {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function getRecord(ip) {
  const now  = Date.now();
  const rec  = store.get(ip);
  if (!rec || now - rec.windowStart > WINDOW_MS) return null;
  return rec;
}

/** POST /api/auth/rate-limit — check if IP is blocked */
export async function POST(req) {
  const ip  = getIp(req);
  const rec = getRecord(ip);

  if (rec && rec.attempts >= MAX_FAILS) {
    const remaining = Math.ceil((rec.windowStart + WINDOW_MS - Date.now()) / 1000 / 60);
    return NextResponse.json(
      { blocked: true, message: `Too many failed attempts. Try again in ${remaining} minute${remaining !== 1 ? 's' : ''}.` },
      { status: 429 }
    );
  }
  return NextResponse.json({ blocked: false });
}

/** PUT /api/auth/rate-limit — record a failed login attempt */
export async function PUT(req) {
  const ip  = getIp(req);
  const now = Date.now();
  const rec = getRecord(ip);

  if (!rec) {
    store.set(ip, { attempts: 1, windowStart: now });
  } else {
    store.set(ip, { ...rec, attempts: rec.attempts + 1 });
  }
  return NextResponse.json({ ok: true });
}

/** DELETE /api/auth/rate-limit — reset on successful login */
export async function DELETE(req) {
  const ip = getIp(req);
  store.delete(ip);
  return NextResponse.json({ ok: true });
}
