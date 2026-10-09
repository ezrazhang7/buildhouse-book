// Builds content/profiles.json and seed/profiles-tab.csv from seed/profiles.seed.mjs.
// The CSV is what you import into the sheet as the "Profiles" tab.
import { mkdirSync, writeFileSync } from 'node:fs';
import { COLUMNS, mapRows, toPublic } from '../lib/profiles-map.mjs';
import { rows } from '../seed/profiles.seed.mjs';

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const csv = [COLUMNS.join(','), ...rows.map((r) => COLUMNS.map((c) => csvCell(r[c])).join(','))].join('\r\n');
writeFileSync(new URL('../seed/profiles-tab.csv', import.meta.url), `﻿${csv}\r\n`);

const { profiles, held, warnings } = mapRows(rows);
mkdirSync(new URL('../content/', import.meta.url), { recursive: true });
writeFileSync(new URL('../content/profiles.json', import.meta.url), `${JSON.stringify(profiles.map(toPublic), null, 2)}\n`);

console.log(`${profiles.length} profiles written, ${held.length} held back (${held.join(', ') || 'none'})`);
for (const w of warnings) console.warn(`  warning: ${w}`);
