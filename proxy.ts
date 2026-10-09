import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, requestIsAuthed } from './lib/session';

// Paths a visitor may load before entering the password. Everything else, including
// the page data, the API and every image under /media, needs a valid session cookie
// (or AUTH_BYPASS, which only a developer on their own machine can set).
// `/lock` is open because a way out of a session has to work while holding a cookie the gate
// rejects: gating it would bounce exactly the person trying to clear it. It reveals nothing,
// it only unsets the cookie.
const OPEN = new Set(['/unlock', '/api/unlock', '/robots.txt', '/lock']);

/**
 * Every answer this proxy gives depends on the session cookie, the redirects included. Marking them
 * uncacheable and cookie-dependent is what stops a browser replaying one at the wrong moment: a
 * stored "/ -> /unlock" outlives the login and bounces a mentor who now has a cookie straight back,
 * which reads as a redirect loop, because /unlock is fetched fresh, sees the cookie and returns them
 * to / again. Next's default on a middleware redirect is public and cacheable, so this is not free.
 */
function sealed(res: NextResponse): NextResponse {
  res.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  const vary = res.headers.get('Vary');
  const parts = vary ? vary.split(',').map((v) => v.trim()).filter(Boolean) : [];
  if (!parts.some((v) => v.toLowerCase() === 'cookie')) parts.push('Cookie');
  res.headers.set('Vary', parts.join(', '));
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authed = await requestIsAuthed(request.cookies.get(SESSION_COOKIE)?.value);

  if (OPEN.has(pathname)) {
    if (authed && pathname === '/unlock') return sealed(NextResponse.redirect(new URL('/', request.url)));
    return sealed(NextResponse.next());
  }

  if (!authed) {
    if (pathname.startsWith('/api/')) {
      return sealed(NextResponse.json({ error: 'Sign in first.' }, { status: 401 }));
    }
    const url = new URL('/unlock', request.url);
    if (pathname !== '/') url.searchParams.set('next', pathname + search);
    return sealed(NextResponse.redirect(url));
  }

  return sealed(NextResponse.next());
}

export const config = {
  // Compiled JS, CSS and fonts hold no founder data (the page is rendered on the server), so they skip the gate.
  matcher: ['/((?!_next/static/|favicon.ico).*)'],
};
