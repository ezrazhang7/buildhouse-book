import test from 'node:test';
import assert from 'node:assert/strict';
import { assertBypassSafe, authBypass, gateConfig, gateFingerprint, isLocalDeployment, issueToken, passwordMatches, requestIsAuthed, safeNext, tokenIsValid } from '../lib/session.ts';

const cfg = { password: 'correct horse battery', secret: 'x'.repeat(48) };

test('the gate stays shut without a real password and secret', () => {
  assert.equal(gateConfig({}), null);
  assert.equal(gateConfig({ MENTOR_PASSWORD: 'short', SESSION_SECRET: 'x'.repeat(48) }), null);
  assert.equal(gateConfig({ MENTOR_PASSWORD: 'long enough', SESSION_SECRET: 'tooshort' }), null);
});
test('password check', async () => {
  assert.equal(await passwordMatches('correct horse battery', cfg), true);
  assert.equal(await passwordMatches('correct horse batterx', cfg), false);
  assert.equal(await passwordMatches('', cfg), false);
});

test('a fresh token is valid, then expires', async () => {
  const now = Date.UTC(2026, 9, 8);
  const token = await issueToken(cfg, now);
  assert.equal(await tokenIsValid(token, cfg, now), true);
  assert.equal(await tokenIsValid(token, cfg, now + 31 * 86400 * 1000), false);
});

test('tampered, forged and missing tokens are refused', async () => {
  const token = await issueToken(cfg);
  const [v, exp, sig] = token.split('.');
  assert.equal(await tokenIsValid(`${v}.${Number(exp) + 999999}.${sig}`, cfg), false);
  assert.equal(await tokenIsValid(`${v}.${exp}.${sig.slice(0, -2)}AA`, cfg), false);
  assert.equal(await tokenIsValid('v1.9999999999.AAAA', cfg), false);
  assert.equal(await tokenIsValid(undefined, cfg), false);
  assert.equal(await tokenIsValid(token, null), false);
});

test('changing the password or the secret signs everyone out', async () => {
  const token = await issueToken(cfg);
  assert.equal(await tokenIsValid(token, { ...cfg, password: 'a new password' }), false);
  assert.equal(await tokenIsValid(token, { ...cfg, secret: 'y'.repeat(48) }), false);
});

test('only same-site paths may follow a login', () => {
  assert.equal(safeNext('/'), '/');
  assert.equal(safeNext('/media/x.png'), '/media/x.png');
  assert.equal(safeNext('//evil.com'), '/');
  assert.equal(safeNext('https://evil.com'), '/');
  assert.equal(safeNext('/\\evil.com'), '/');
  assert.equal(safeNext('/unlock'), '/');
  assert.equal(safeNext(null), '/');
});

const live = { MENTOR_PASSWORD: cfg.password, SESSION_SECRET: cfg.secret };

test('only a developer\'s own machine counts as local', () => {
  assert.equal(isLocalDeployment({}), true);
  assert.equal(isLocalDeployment({ NODE_ENV: 'development' }), true);
  assert.equal(isLocalDeployment({ NODE_ENV: 'production' }), false);
  assert.equal(isLocalDeployment({ VERCEL: '1' }), false);
});

test('the bypass opens the gate locally and nowhere else', () => {
  assert.equal(authBypass({ AUTH_BYPASS: '1' }), true);
  assert.equal(authBypass({ AUTH_BYPASS: '1', NODE_ENV: 'development' }), true);
  assert.equal(authBypass({ AUTH_BYPASS: '1', NODE_ENV: 'production' }), false);
  assert.equal(authBypass({ AUTH_BYPASS: '1', VERCEL: '1' }), false);
  assert.equal(authBypass({ AUTH_BYPASS: 'true' }), false);
  assert.equal(authBypass({ AUTH_BYPASS: 'yes' }), false);
  assert.equal(authBypass({}), false);
});

test('a bypass flag that reached hosting stops the server at boot', () => {
  const quiet = () => {};
  assert.throws(() => assertBypassSafe({ AUTH_BYPASS: '1', VERCEL: '1' }, quiet), /AUTH_BYPASS/);
  assert.throws(() => assertBypassSafe({ AUTH_BYPASS: '1', VERCEL: '1', NODE_ENV: 'production' }, quiet), /AUTH_BYPASS/);
  assert.doesNotThrow(() => assertBypassSafe({ AUTH_BYPASS: '1' }, quiet));
  assert.doesNotThrow(() => assertBypassSafe({ NODE_ENV: 'production', ...live }, quiet));
});

test('a local production build keeps working, with the flag inert and said out loud', () => {
  // This build is how the real gate gets tested on a laptop, so the flag must not brick it.
  const said: string[] = [];
  assert.doesNotThrow(() => assertBypassSafe({ AUTH_BYPASS: '1', NODE_ENV: 'production' }, (m) => said.push(m)));
  assert.equal(said.length, 1);
  assert.match(said[0], /ignored/);
  assert.equal(authBypass({ AUTH_BYPASS: '1', NODE_ENV: 'production' }), false);
});

test('on a deployment nothing but a real cookie gets in', async () => {
  // Locally the flag is enough; on Vercel the same flag is ignored and the cookie decides.
  assert.equal(await requestIsAuthed(undefined, { AUTH_BYPASS: '1' }), true);
  assert.equal(await requestIsAuthed(undefined, { AUTH_BYPASS: '1', VERCEL: '1', ...live }), false);
  assert.equal(await requestIsAuthed(undefined, { AUTH_BYPASS: '1', NODE_ENV: 'production', ...live }), false);
  const token = await issueToken(cfg);
  assert.equal(await requestIsAuthed(token, { VERCEL: '1', ...live }), true);
  assert.equal(await requestIsAuthed(token, { VERCEL: '1', ...live, MENTOR_PASSWORD: 'rotated password' }), false);
  // No password configured and no bypass: shut, as before.
  assert.equal(await requestIsAuthed(token, { VERCEL: '1' }), false);
});

test('whitespace a dashboard paste adds does not change the password', async () => {
  const pasted = gateConfig({ MENTOR_PASSWORD: `  ${cfg.password}\n`, SESSION_SECRET: `${cfg.secret}\n` });
  assert.ok(pasted);
  assert.equal(pasted.password, cfg.password);
  assert.equal(pasted.secret, cfg.secret);
  // And a typed attempt with a stray trailing space still opens the book.
  assert.equal(await passwordMatches(`${cfg.password} `, cfg), true);
  assert.equal(await passwordMatches(`\n${cfg.password}`, cfg), true);
  // A cookie signed on one of them is valid on the other, so trimming does not sign anyone out twice.
  assert.equal(await tokenIsValid(await issueToken(pasted), gateConfig({ MENTOR_PASSWORD: cfg.password, SESSION_SECRET: cfg.secret })), true);
});

test('trimming does not let a wrong password through', async () => {
  assert.equal(await passwordMatches(`${cfg.password}x`, cfg), false);
  assert.equal(await passwordMatches(`"${cfg.password}"`, cfg), false);
  assert.equal(await passwordMatches('   ', cfg), false);
  // Quotes are kept, because a password may legitimately contain them. A dashboard field that holds
  // "a phrase" with the quotes is a different password, and the fingerprint is how that shows up.
  assert.equal(gateConfig({ MENTOR_PASSWORD: `"${cfg.password}"`, SESSION_SECRET: cfg.secret })?.password, `"${cfg.password}"`);
});

test('the fingerprint identifies a password without revealing it', async () => {
  const fp = await gateFingerprint(cfg);
  assert.match(fp, /^21 characters, fingerprint [0-9a-f]{8}$/);
  assert.equal(await gateFingerprint(cfg), fp);
  assert.notEqual(await gateFingerprint({ ...cfg, password: `${cfg.password} ` }), fp);
  assert.ok(!fp.includes(cfg.password));
});
