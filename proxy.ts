import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, requestIsAuthed } from './lib/session';

// Paths a visitor may load before entering the password. Everything else, including
// the page data, the API and every image under /media, needs a valid session cookie
// (or AUTH_BYPASS, which only a developer on their own machine can set).
const OPEN = new Set(['/unlock', '/api/unlock', '/robots.txt']);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authed = await requestIsAuthed(request.cookies.get(SESSION_COOKIE)?.value);

  if (OPEN.has(pathname)) {
    if (authed && pathname === '/unlock') return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  if (!authed) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    }
    const url = new URL('/unlock', request.url);
    if (pathname !== '/') url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}

export const config = {
  // Compiled JS, CSS and fonts hold no founder data (the page is rendered on the server), so they skip the gate.
  matcher: ['/((?!_next/static/|favicon.ico).*)'],
};
