import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

// Ending a session from the address bar. The back page's "lock the book" button posts to
// /api/lock; this is the same thing as a link, for a mentor on a shared laptop and for anyone
// holding a cookie their browser will not let them reach a button to clear.
export function GET() {
  // A relative Location, rather than new URL('/unlock', request.url): the reconstructed host is
  // not always the host the mentor typed, and a logout must not bounce anyone to another address.
  const res = new NextResponse(null, {
    status: 303,
    headers: { Location: '/unlock', 'Cache-Control': 'private, no-store, max-age=0, must-revalidate' },
  });
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
