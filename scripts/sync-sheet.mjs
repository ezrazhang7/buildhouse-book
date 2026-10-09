// Pulls the "Profiles" tab and its Drive images into the repo before a build.
//   node scripts/sync-sheet.mjs                  fail loudly if anything is missing
//   node scripts/sync-sheet.mjs --if-configured  skip quietly when Google credentials are not set (keeps the committed seed)
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { JWT } from 'google-auth-library';
import { mapRows, toPublic, valuesToRows } from '../lib/profiles-map.mjs';

const { GOOGLE_SERVICE_ACCOUNT_EMAIL: email, GOOGLE_PRIVATE_KEY: rawKey, SHEET_ID: sheetId } = process.env;
const tab = process.env.PROFILES_TAB || 'Profiles';
const optional = process.argv.includes('--if-configured');

if (!email || !rawKey || !sheetId) {
  if (optional) {
    console.log('sync: Google credentials not set, keeping content/profiles.json as committed');
    process.exit(0);
  }
  console.error('sync: set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY and SHEET_ID');
  process.exit(1);
}

const auth = new JWT({
  email,
  key: rawKey.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/drive.readonly'],
});

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/gif': 'gif' };
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

async function fetchImage(id) {
  const res = await auth.request({ url: `https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`, responseType: 'arraybuffer' });
  const type = String(res.headers.get?.('content-type') ?? res.headers['content-type'] ?? '').split(';')[0];
  const ext = EXT[type];
  if (!ext) throw new Error(`not an image the book can show (${type || 'unknown type'})`);
  const bytes = Buffer.from(res.data);
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error('image is over 8 MB');
  return { bytes, ext };
}

const range = encodeURIComponent(`${tab}!A1:Z500`);
const { data } = await auth.request({ url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}` });
const { profiles, held, warnings } = mapRows(valuesToRows(data.values ?? []));

if (!profiles.length) {
  console.error(`sync: the "${tab}" tab has no published rows, refusing to build an empty book`);
  process.exit(1);
}

const mediaRoot = new URL('../public/media/', import.meta.url);
rmSync(mediaRoot, { recursive: true, force: true });

for (const p of profiles) {
  const dir = new URL(`${p.slug}/`, mediaRoot);
  const save = async (id, name, what) => {
    try {
      const { bytes, ext } = await fetchImage(id);
      mkdirSync(dir, { recursive: true });
      writeFileSync(new URL(`${name}.${ext}`, dir), bytes);
      return `/media/${p.slug}/${name}.${ext}`;
    } catch (err) {
      warnings.push(`${p.venture}: could not fetch ${what} (${err.message}). Is the file shared with ${email}?`);
      return '';
    }
  };
  if (p.logoDriveId) p.logo = await save(p.logoDriveId, 'logo', 'the logo');
  for (const [i, f] of p.founders.entries()) {
    if (f.headshotDriveId) f.headshot = await save(f.headshotDriveId, `founder-${i + 1}`, `${f.name}'s headshot`);
  }
}

mkdirSync(new URL('../content/', import.meta.url), { recursive: true });
writeFileSync(new URL('../content/profiles.json', import.meta.url), `${JSON.stringify(profiles.map(toPublic), null, 2)}\n`);
console.log(`sync: ${profiles.length} profiles written, ${held.length} held back${held.length ? ` (${held.join(', ')})` : ''}`);
for (const w of warnings) console.warn(`sync warning: ${w}`);
