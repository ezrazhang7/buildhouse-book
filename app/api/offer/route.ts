import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { JWT } from 'google-auth-library';
import profiles from '@/content/profiles.json';
import { SESSION_COOKIE, requestIsAuthed } from '@/lib/session';

// A mentor's "I can help" note goes to the BuildHouse team, never straight to a founder.
// It is appended to the sheet's "Mentor offers" tab and/or posted to a webhook, whichever is configured.

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
// Stops a note that starts with = + - @ from running as a formula when it lands in the sheet.
const cell = (v: string) => (/^[=+\-@]/.test(v) ? `'${v}` : v);

async function appendToSheet(row: string[]): Promise<boolean> {
  const { GOOGLE_SERVICE_ACCOUNT_EMAIL: email, GOOGLE_PRIVATE_KEY: key, SHEET_ID: sheetId } = process.env;
  if (!email || !key || !sheetId) return false;
  const auth = new JWT({ email, key: key.replace(/\\n/g, '\n'), scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const tab = process.env.OFFERS_TAB || 'Mentor offers';
  await auth.request({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(`${tab}!A1`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    method: 'POST',
    data: { values: [row.map(cell)] },
  });
  return true;
}

async function postToWebhook(payload: Record<string, string>): Promise<boolean> {
  const url = process.env.OFFERS_WEBHOOK_URL;
  if (!url) return false;
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`webhook answered ${res.status}`);
  return true;
}

export async function POST(request: Request) {
  // The proxy already gates this route. Checked again here so the route is safe on its own.
  const jar = await cookies();
  if (!(await requestIsAuthed(jar.get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nothing was sent.' }, { status: 400 });
  }

  const slug = text(body.slug, 80);
  const venture = slug === 'general' ? 'Any builder' : profiles.find((p) => p.slug === slug)?.venture;
  const name = text(body.name, 120);
  const email = text(body.email, 200);
  const note = text(body.note, 2000);

  if (!venture) return NextResponse.json({ error: 'That builder is not in the book.' }, { status: 400 });
  if (!name) return NextResponse.json({ error: 'Add your name so BuildHouse knows who is offering.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Add an email BuildHouse can reply to.' }, { status: 400 });
  if (!note) return NextResponse.json({ error: 'Say a little about how you can help.' }, { status: 400 });

  const sentAt = new Date().toISOString();
  try {
    const results = await Promise.all([
      appendToSheet([sentAt, venture, name, email, note]),
      postToWebhook({ sentAt, venture, slug, name, email, note }),
    ]);
    if (!results.some(Boolean)) {
      return NextResponse.json({ error: 'Offers are not connected yet.', contact: process.env.CONTACT_EMAIL ?? '' }, { status: 503 });
    }
  } catch (err) {
    console.error('offer delivery failed', err);
    return NextResponse.json({ error: 'Your note did not go through. Try again in a minute.', contact: process.env.CONTACT_EMAIL ?? '' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
