import test from 'node:test';
import assert from 'node:assert/strict';
import { driveFileId, formatMoveIn, instagramUrl, mapRow, mapRows, parseTier, safeUrl, toPublic, valuesToRows } from '../lib/profiles-map.mjs';
import { rows as seedRows } from '../seed/profiles.seed.mjs';

test('only web links survive', () => {
  assert.equal(safeUrl('javascript:alert(1)'), '');
  assert.equal(safeUrl('data:text/html,hi'), '');
  assert.equal(safeUrl('squeakyc.com'), 'https://squeakyc.com/');
  assert.equal(safeUrl('https://www.linkedin.com/in/x'), 'https://www.linkedin.com/in/x');
  assert.equal(instagramUrl('@drinkcreset'), 'https://www.instagram.com/drinkcreset');
  assert.equal(instagramUrl('not a handle!'), '');
});

test('tier keeps residency and drops dues', () => {
  assert.deepEqual(parseTier('Tier 1 Resident (Key fob + Floating desk · $100/mo)'), { tier: 'Tier 1', residency: 'Resident' });
  assert.deepEqual(parseTier('Tier 1 Remote'), { tier: 'Tier 1', residency: 'Remote' });
  assert.deepEqual(parseTier('Vendor Resident'), { tier: 'Vendor', residency: 'Resident' });
});

test('move-in dates read as month and year', () => {
  assert.equal(formatMoveIn('6/1/2026'), 'June 2026');
  assert.equal(formatMoveIn('2026-09-02'), 'September 2026');
  assert.equal(formatMoveIn('soon'), 'soon');
});

test('drive links of every shape give the file id', () => {
  assert.equal(driveFileId('https://drive.google.com/open?id=1vQ0EN_RT8J_PPkBDxWxdNJBZZ8aTcALF'), '1vQ0EN_RT8J_PPkBDxWxdNJBZZ8aTcALF');
  assert.equal(driveFileId('https://drive.google.com/file/d/1vQ0EN_RT8J_PPkBDxWxdNJBZZ8aTcALF/view?usp=sharing'), '1vQ0EN_RT8J_PPkBDxWxdNJBZZ8aTcALF');
  assert.equal(driveFileId(''), '');
});

test('a row maps to a profile', () => {
  const { profile, warnings } = mapRow({
    venture: 'Test Co', one_liner: 'Does things.', tier: 'Tier 2 Resident', moved_in: '6/1/2026',
    founders: 'Ada Lovelace | CEO | https://www.linkedin.com/in/ada | @ada | https://drive.google.com/open?id=1vQ0EN_RT8J_PPkBDxWxdNJBZZ8aTcALF\nBob | CTO | javascript:alert(1)',
    story: 'One.\n\nTwo\nstill two.', stats: '10 | Customers\nbroken line', needs: 'hiring & labor; Made up need', ask: 'Help.',
    links: 'Website | example.com\nInstagram | testco',
  });
  assert.equal(profile.slug, 'test-co');
  assert.equal(profile.founders.length, 2);
  assert.equal(profile.founders[0].headshotDriveId, '1vQ0EN_RT8J_PPkBDxWxdNJBZZ8aTcALF');
  assert.equal(profile.founders[1].linkedin, '');
  assert.deepEqual(profile.story, ['One.', 'Two still two.']);
  assert.deepEqual(profile.stats, [{ value: '10', label: 'Customers' }]);
  assert.deepEqual(profile.needs, ['Hiring & labor']);
  assert.equal(profile.links[1].url, 'https://www.instagram.com/testco');
  assert.equal(warnings.length, 2);
});

test('unpublished and duplicate rows stay out', () => {
  const { profiles, held, warnings } = mapRows([
    { publish: 'TRUE', venture: 'A', founders: 'X' },
    { publish: '', venture: 'B', founders: 'Y' },
    { publish: 'yes', venture: 'A', founders: 'Z' },
    {},
  ]);
  assert.deepEqual(profiles.map((p) => p.venture), ['A']);
  assert.deepEqual(held, ['B']);
  assert.ok(warnings.some((w) => w.includes('used twice')));
});

test('sheet values become rows whatever the header casing', () => {
  const rows = valuesToRows([['Publish', 'Venture', 'One liner'], ['TRUE', 'A', 'Hi'], ['FALSE', 'B']]);
  assert.deepEqual(rows[0], { publish: 'TRUE', venture: 'A', one_liner: 'Hi' });
  assert.equal(rows[1].one_liner, '');
});

test('the seed never carries contact details, and Drive ids never reach the browser', () => {
  const { profiles, held } = mapRows(seedRows);
  assert.equal(profiles.length, 17);
  assert.deepEqual(held, ['Kit 14 Public Relations', 'ThreatSecOps']);
  const out = JSON.stringify(profiles.map(toPublic));
  assert.doesNotMatch(out, /drive\.google|headshotDriveId|logoDriveId/);
  assert.doesNotMatch(out, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com|edu|org)\b/, 'no email addresses');
  assert.doesNotMatch(out, /\(?\b\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/, 'no phone numbers');
  assert.doesNotMatch(out, /\$100\/mo|Key fob/, 'no dues');
});
