// Prints the fingerprint of a password so it can be compared with the one a deployment logged at
// boot, without either value being pasted anywhere. Reads MENTOR_PASSWORD, or takes the password
// as an argument: npm run fingerprint -- "the phrase"
const password = (process.argv[2] ?? process.env.MENTOR_PASSWORD ?? '').trim();
if (!password) {
  console.error('No password given. Pass one: npm run fingerprint -- "the phrase"');
  process.exit(1);
}
const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`fp:${password}`)));
const hex = [...hash.slice(0, 4)].map((b) => b.toString(16).padStart(2, '0')).join('');
console.log(`${password.length} characters, fingerprint ${hex}`);
