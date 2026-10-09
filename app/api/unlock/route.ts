import { NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_DAYS, gateConfig, isLocalDeployment, issueToken, passwordMatches, safeNext } from '@/lib/session';

// Slows down guessing. It is per server instance, so treat it as a speed bump and rely on a long password.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_TRIES = 8;
const tries = new Map<string, { count: number; resetAt: number }>();

// Loopback sends no x-forwarded-for, so every attempt on a developer's machine shares one bucket and
// eight fumbled passwords would lock them out for ten minutes. Exempt that case only off a real
// deployment, where a missing header must never be what switches the limiter off.
const LOOPBACK = new Set(['', 'unknown', 'localhost', '127.0.0.1', '::1', '::ffff:127.0.0.1']);

function limited(ip: string): boolean {
  return !(LOOPBACK.has(ip) && isLocalDeployment());
}

function tooMany(ip: string, now: number): boolean {
  const t = tries.get(ip);
  return !!t && t.resetAt > now && t.count >= MAX_TRIES;
}

function recordFailure(ip: string, now: number) {
  if (tries.size > 5000) tries.clear();
  const t = tries.get(ip);
  if (!t || t.resetAt <= now) tries.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  else t.count += 1;
}

export async function POST(request: Request) {
  const cfg = gateConfig();
  if (!cfg) {
    return NextResponse.json({ error: 'The book is not set up yet. Ask the BuildHouse team.' }, { status: 503 });
  }

  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  if (limited(ip) && tooMany(ip, now)) {
    return NextResponse.json({ error: 'Too many tries. Wait ten minutes, then try again.' }, { status: 429 });
  }

  let password = '';
  let next = '/';
  try {
    const body = await request.json();
    password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';
    next = safeNext(typeof body.next === 'string' ? body.next : '/');
  } catch {
    return NextResponse.json({ error: 'Enter the password.' }, { status: 400 });
  }

  if (!(await passwordMatches(password, cfg))) {
    if (limited(ip)) recordFailure(ip, now);
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: 'That password did not match. Check the message from BuildHouse and try again.' }, { status: 401 });
  }

  const res = NextResponse.json({ next });
  res.cookies.set(SESSION_COOKIE, await issueToken(cfg), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  });
  return res;
}
