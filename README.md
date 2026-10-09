# BuildHouse mentor book

A password-protected flipbook of BuildHouse founders for mentors. Full spec: [SPEC.md](SPEC.md).

## Run it

```bash
npm install
cp .env.example .env.local   # set MENTOR_PASSWORD (8+ chars) and SESSION_SECRET (32+ chars)
npm run dev                  # http://localhost:3000
```

Add `AUTH_BYPASS=1` to `.env.local` to read the book locally without typing the password. It is
honoured only on your own machine: `NODE_ENV=production` ignores it, and a hosted deployment that
has it set refuses to boot. There is deliberately no second password — see [SPEC.md](SPEC.md) §5.
To preview against the real gate, run `npm run build && npm start`, where the flag goes inert.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local server |
| `npm run build` | Syncs the sheet if Google credentials are set, then builds |
| `npm run sync` | Pulls the Profiles tab and its Drive images into `content/` and `public/media/` |
| `npm run seed` | Rebuilds `content/profiles.json` and `seed/profiles-tab.csv` from `seed/profiles.seed.mjs` |
| `npm test` | Unit tests |
| `npm run fingerprint -- "the phrase"` | Prints a password's length and a short hash, to compare with the `gate:` line a server logs at boot |
| `npm run fresh -- <url>` | Opens the book in a throwaway Chrome profile: no cookies, no cached redirects, nothing kept |

## Where things are

- `proxy.ts`, `lib/session.ts`, `app/api/unlock`: the password gate, and the local `AUTH_BYPASS`
- `instrumentation.ts`: refuses to boot a hosted deployment that has `AUTH_BYPASS` set
- `components/Book.tsx`, `app/globals.css`: the book
- `lib/profiles-map.mjs`: sheet row to profile, and the list of needs mentors can filter by
- `scripts/sync-sheet.mjs`: sheet and Drive sync
- `app/api/offer`: "I can help" notes
- `seed/profiles-tab.csv`: import this into the sheet as a tab named `Profiles`

## When `/` and `/unlock` bounce off each other

A redirect the browser cached, not a cookie — so clearing cookies alone will not stop it. Either:

```bash
npm run fresh -- https://your-deployment.vercel.app   # throwaway Chrome profile, no cookies or cache
```

or open a private window. The gated redirects are `no-store` now, so a stored one cannot outlive a
login, but one a browser kept from before that fix still has to expire on its own.

To end a session deliberately, visit **`/lock`** — it unsets the cookie and returns you to the
password page. It works even while holding a cookie the gate rejects, which is the case the back
page's button cannot reach. `curl` cannot help here: it keeps its own cookie jar, not Chrome's.

Note also that changing `MENTOR_PASSWORD` or `SESSION_SECRET` re-derives the signing key, so any
cookie issued before the change is already invalid.

## When the password is refused

Every server prints one line at boot: `gate: password set (N characters, fingerprint abcd1234)`.
Run `npm run fingerprint -- "the phrase"` on the phrase you are typing and compare. Different
fingerprint means the deployment holds a different password, not that the gate is broken.

On Vercel, **an environment variable change does not reach a deployment that already exists** —
redeploy after editing `MENTOR_PASSWORD`. Note also that the dashboard stores the value raw: it
keeps quotes you paste around a phrase, where a local `.env.local` would strip them. Surrounding
whitespace is trimmed on both sides, so that much is safe.

Changing `MENTOR_PASSWORD` re-derives the signing key, so every mentor is signed out.

## Editing content

Edit the Profiles tab, then redeploy. Set `publish` to FALSE to pull a venture from the book.
