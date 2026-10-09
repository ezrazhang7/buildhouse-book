import { assertBypassSafe } from './lib/session';

// Runs once when the server boots, before it serves anything. A developer bypass that reached a
// deployment should stop that deployment rather than quietly open the book to the internet.
export function register() {
  assertBypassSafe();
}
