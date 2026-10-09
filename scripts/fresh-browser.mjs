// Opens the book in a throwaway Chrome profile: no cookies and no cached redirects carried in,
// nothing kept behind. Faster than hunting through devtools, and it cannot disturb your own
// browser's session. Usage: npm run fresh -- [url]
import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const url = process.argv[2] ?? 'http://localhost:3000';
const profile = join(tmpdir(), 'buildhouse-book-browser');
const args = [`--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', url];

// A fresh directory is what makes it fresh: Chrome keeps cookies and the HTTP cache in here.
rmSync(profile, { recursive: true, force: true });

if (process.platform !== 'darwin') {
  console.log(`Start Chrome with a throwaway profile:\n\n  chrome ${args.join(' ')}\n`);
  process.exit(0);
}

console.log(`Opening ${url} in a throwaway Chrome profile (${profile}).`);
console.log('Close the window when done; the next run wipes it anyway.');
spawn('open', ['-na', 'Google Chrome', '--args', ...args], { stdio: 'inherit', detached: true }).unref();
