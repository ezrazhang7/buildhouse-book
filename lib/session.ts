// Session tokens for the mentor gate. Web Crypto only, so it runs the same in the proxy, in route handlers and in tests.

export const SESSION_COOKIE = 'bh_book';
export const SESSION_DAYS = 30;

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer): string {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(text: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}

/** Compares in time that does not depend on where the inputs differ. */
function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export type GateConfig = { password: string; secret: string };

/** Null when the deployment is missing its password or secret. The gate then stays shut for everyone. */
export function gateConfig(env: Record<string, string | undefined> = process.env): GateConfig | null {
  // Trimmed: a value pasted into a hosting dashboard often carries a trailing newline or space, and
  // whitespace that nobody can see is not something a mentor or the BuildHouse team could diagnose.
  const password = (env.MENTOR_PASSWORD ?? '').trim();
  const secret = (env.SESSION_SECRET ?? '').trim();
  if (password.length < 8 || secret.length < 32) return null;
  return { password, secret };
}

export async function passwordMatches(attempt: string, cfg: GateConfig): Promise<boolean> {
  // Trimmed on both sides, for the same reason: a phone keyboard appends a space to a typed phrase.
  return sameBytes(await sha256(`pw:${attempt.trim()}`), await sha256(`pw:${cfg.password}`));
}

/**
 * Enough to tell two environments apart, not enough to reveal the password: its length and four
 * bytes of its hash. Logged at boot so a password that differs between a laptop and hosting can be
 * found by comparing, rather than by guessing at what a dashboard field contains.
 */
export async function gateFingerprint(cfg: GateConfig): Promise<string> {
  const hex = [...(await sha256(`fp:${cfg.password}`)).slice(0, 4)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${cfg.password.length} characters, fingerprint ${hex}`;
}

// The signing key mixes in the password, so changing the password signs every mentor out.
async function signingKey(cfg: GateConfig): Promise<CryptoKey> {
  const raw = await sha256(`${cfg.secret}\n${cfg.password}`);
  return crypto.subtle.importKey('raw', raw as BufferSource, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

async function sign(payload: string, cfg: GateConfig): Promise<string> {
  return b64url(await crypto.subtle.sign('HMAC', await signingKey(cfg), enc.encode(payload)));
}

export async function issueToken(cfg: GateConfig, now: number = Date.now()): Promise<string> {
  const payload = `v1.${Math.floor(now / 1000) + SESSION_DAYS * 86400}`;
  return `${payload}.${await sign(payload, cfg)}`;
}

export async function tokenIsValid(token: string | undefined, cfg: GateConfig | null, now: number = Date.now()): Promise<boolean> {
  if (!token || !cfg) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1' || !/^\d{1,12}$/.test(parts[1])) return false;
  if (Number(parts[1]) * 1000 <= now) return false;
  const expected = await sign(`${parts[0]}.${parts[1]}`, cfg);
  return sameBytes(enc.encode(parts[2]), enc.encode(expected));
}

/** Only same-site paths may follow a login, so the unlock page cannot be used to bounce mentors elsewhere. */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\') || next.startsWith('/unlock') || next.startsWith('/api/')) return '/';
  return next;
}

// --- Developer bypass -------------------------------------------------------
// Reading the book while building it should not need the mentors' password, but a second password
// would be a second secret with the same blast radius. Instead the gate can be opened by the
// environment, which nothing a visitor sends can reach.

type Env = Record<string, string | undefined>;

/** True only off a real deployment: a dev server or a production build on someone's own machine. */
export function isLocalDeployment(env: Env = process.env): boolean {
  return env.NODE_ENV !== 'production' && !env.VERCEL;
}

/** Running on hosting rather than a laptop. Here a bypass flag is never a mistake worth tolerating. */
export function isHostedDeployment(env: Env = process.env): boolean {
  return !!env.VERCEL;
}

/** Whether the developer has opened the gate locally. Cannot be true in production or on Vercel. */
export function authBypass(env: Env = process.env): boolean {
  return env.AUTH_BYPASS === '1' && isLocalDeployment(env);
}

/**
 * Run at boot. The flag being honoured is decided by authBypass alone, which never says yes on
 * hosting; this is the alarm, so the mistake surfaces at deploy time instead of silently.
 * On hosting it stops the deployment. On a local production build the flag is simply inert
 * (that build is how the real gate gets tested), so it only warns.
 */
export function assertBypassSafe(env: Env = process.env, warn: (m: string) => void = console.warn): void {
  if (env.AUTH_BYPASS !== '1') return;
  if (isHostedDeployment(env)) {
    throw new Error(
      'AUTH_BYPASS=1 is set on a hosted deployment. Unset it (Vercel: Project Settings > Environment Variables). ' +
        'The book must not serve founder data without the password; give preview deployments their own MENTOR_PASSWORD instead.',
    );
  }
  if (!isLocalDeployment(env)) {
    warn('AUTH_BYPASS=1 is ignored in a production build. This server is asking for the password as a deployment would.');
  }
}

/** The one gate check the proxy and the API both use, so they can never disagree about who is in. */
export async function requestIsAuthed(token: string | undefined, env: Env = process.env): Promise<boolean> {
  return authBypass(env) || (await tokenIsValid(token, gateConfig(env)));
}
