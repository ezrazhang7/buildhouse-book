import { assertBypassSafe, gateConfig, gateFingerprint } from './lib/session';

// Runs once when the server boots, before it serves anything. A developer bypass that reached a
// deployment should stop that deployment rather than quietly open the book to the internet.
export async function register() {
  assertBypassSafe();

  // Printed so the password a deployment actually holds can be compared with the intended one.
  // Compare against: npm run fingerprint
  const cfg = gateConfig();
  console.log(
    cfg
      ? `gate: password set (${await gateFingerprint(cfg)})`
      : 'gate: MENTOR_PASSWORD (8+ chars) or SESSION_SECRET (32+) is missing or too short, so nobody can get in',
  );
}
