// Turns rows of the sheet's "Profiles" tab into the profile objects the book renders.
// Shared by the seed script, the sheet sync and the tests. Plain JS so plain `node` can run it.

/** The fixed vocabulary mentors can filter by. Anything else in the "needs" column is dropped with a warning. */
export const NEEDS = [
  'Hiring & labor',
  'Client acquisition',
  'Operations & scaling',
  'Compliance & taxes',
  'Cashflow & runway',
  'Fundraising & equity',
  'Legal & incorporation',
  'Product & software',
  'Marketing & positioning',
  'Mentorship',
  'Network & community',
];

/** Column headers of the Profiles tab, in order. `notes` is internal and never leaves the sheet. */
export const COLUMNS = [
  'publish', 'slug', 'venture', 'one_liner', 'founders', 'tier', 'moved_in', 'days_in_space',
  'story', 'stats', 'needs', 'ask', 'links', 'logo', 'notes',
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const clean = (v) => String(v ?? '').replace(/\r\n?/g, '\n').trim();
const lines = (v) => clean(v).split('\n').map((s) => s.trim()).filter(Boolean);
const cells = (line) => line.split('|').map((s) => s.trim());

export function isTruthy(v) {
  return ['true', 'yes', 'y', '1', 'x', '✓'].includes(clean(v).toLowerCase());
}

export function slugify(s) {
  return clean(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

/** Only http(s) links survive: the sheet is typed by hand, so never trust a URL scheme from it. */
export function safeUrl(v) {
  let s = clean(v);
  if (!s) return '';
  if (/^(www\.|[a-z0-9-]+\.(com|co|org|io|ai|net|fun|edu)\b)/i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : '';
  } catch {
    return '';
  }
}

export function instagramUrl(v) {
  const s = clean(v);
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return safeUrl(s);
  const handle = s.replace(/^@/, '').replace(/\s+/g, '');
  return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? `https://www.instagram.com/${handle}` : '';
}

/** "6/1/2026" or "2026-06-01" becomes "June 2026". Anything else is passed through as typed. */
export function formatMoveIn(v) {
  const s = clean(v);
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m && +m[1] >= 1 && +m[1] <= 12) return `${MONTHS[+m[1] - 1]} ${m[3]}`;
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m && +m[2] >= 1 && +m[2] <= 12) return `${MONTHS[+m[2] - 1]} ${m[1]}`;
  return s;
}

/** "Tier 1 Resident (Key fob + Floating desk · $100/mo)" becomes { tier: "Tier 1", residency: "Resident" }. Dues never reach the book. */
export function parseTier(v) {
  const s = clean(v).replace(/\(.*$/s, '').trim();
  const residency = /remote/i.test(s) ? 'Remote' : /resident/i.test(s) ? 'Resident' : '';
  const t = s.match(/tier\s*(\d)/i);
  const tier = t ? `Tier ${t[1]}` : /vendor/i.test(s) ? 'Vendor' : '';
  return { tier, residency };
}

/** Pulls the file id out of any of the Drive link shapes the form produces. */
export function driveFileId(v) {
  const s = clean(v);
  const m = s.match(/[?&]id=([A-Za-z0-9_-]{10,})/) || s.match(/\/d\/([A-Za-z0-9_-]{10,})/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{20,}$/.test(s) ? s : '';
}

/**
 * @param {Record<string,string>} row one Profiles row keyed by column header
 * @returns {{ profile: object|null, warnings: string[] }}
 */
export function mapRow(row) {
  const warnings = [];
  const venture = clean(row.venture);
  if (!venture) return { profile: null, warnings: ['row has no venture name'] };
  const slug = slugify(row.slug || venture);
  if (!slug) return { profile: null, warnings: [`${venture}: could not build a slug`] };

  const founders = lines(row.founders).map((line) => {
    const [name = '', title = '', linkedin = '', instagram = '', headshot = ''] = cells(line);
    if (linkedin && !safeUrl(linkedin)) warnings.push(`${venture}: dropped a LinkedIn link that is not a web address`);
    return {
      name,
      title,
      linkedin: safeUrl(linkedin),
      instagram: instagramUrl(instagram),
      // A Drive link here is swapped for a local file by the sync. Local paths pass through.
      headshot: headshot.startsWith('/media/') ? headshot : '',
      headshotDriveId: driveFileId(headshot),
    };
  }).filter((f) => f.name);
  if (!founders.length) warnings.push(`${venture}: no founders listed`);

  const stats = lines(row.stats).map((line) => {
    const [value = '', label = ''] = cells(line);
    return { value, label };
  }).filter((s) => s.value && s.label).slice(0, 4);

  const needs = [];
  for (const raw of clean(row.needs).split(/[;\n]/).map((s) => s.trim()).filter(Boolean)) {
    const hit = NEEDS.find((n) => n.toLowerCase() === raw.toLowerCase());
    if (hit) { if (!needs.includes(hit)) needs.push(hit); } else warnings.push(`${venture}: "${raw}" is not one of the needs mentors can filter by`);
  }

  const links = lines(row.links).map((line) => {
    const [label = '', url = ''] = cells(line);
    return { label, url: /instagram/i.test(label) ? instagramUrl(url) : safeUrl(url) };
  }).filter((l) => l.label && l.url);

  const logo = clean(row.logo);
  const { tier, residency } = parseTier(row.tier);

  return {
    profile: {
      slug,
      venture,
      oneLiner: clean(row.one_liner),
      tier,
      residency,
      movedIn: formatMoveIn(row.moved_in),
      daysInSpace: clean(row.days_in_space),
      founders,
      story: clean(row.story).split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean),
      stats,
      needs,
      ask: clean(row.ask),
      links,
      logo: logo.startsWith('/media/') ? logo : '',
      logoDriveId: driveFileId(logo),
    },
    warnings,
  };
}

/**
 * @param {Record<string,string>[]} rows every Profiles row, published or not
 * @returns {{ profiles: object[], held: string[], warnings: string[] }}
 */
export function mapRows(rows) {
  const profiles = [];
  const held = [];
  const warnings = [];
  const seen = new Set();
  for (const row of rows) {
    if (!Object.values(row).some((v) => clean(v))) continue;
    const { profile, warnings: w } = mapRow(row);
    if (!profile) { warnings.push(...w); continue; }
    if (!isTruthy(row.publish)) { held.push(profile.venture); continue; }
    if (seen.has(profile.slug)) { warnings.push(`${profile.venture}: slug "${profile.slug}" is used twice, second row skipped`); continue; }
    seen.add(profile.slug);
    warnings.push(...w);
    profiles.push(profile);
  }
  return { profiles, held, warnings };
}

/** Sheets API `values` (array of arrays, header first) to row objects. Header names are matched loosely. */
export function valuesToRows(values) {
  const [header = [], ...body] = values;
  const keys = header.map((h) => clean(h).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? ''])));
}

/** What is safe to hand the browser: no Drive ids, no internal fields. */
export function toPublic(profile) {
  const { logoDriveId, founders, ...rest } = profile;
  return { ...rest, founders: founders.map(({ headshotDriveId, ...f }) => f) };
}
