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

## Where things are

- `proxy.ts`, `lib/session.ts`, `app/api/unlock`: the password gate, and the local `AUTH_BYPASS`
- `instrumentation.ts`: refuses to boot a hosted deployment that has `AUTH_BYPASS` set
- `components/Book.tsx`, `app/globals.css`: the book
- `lib/profiles-map.mjs`: sheet row to profile, and the list of needs mentors can filter by
- `scripts/sync-sheet.mjs`: sheet and Drive sync
- `app/api/offer`: "I can help" notes
- `seed/profiles-tab.csv`: import this into the sheet as a tab named `Profiles`

## Editing content

Edit the Profiles tab, then redeploy. Set `publish` to FALSE to pull a venture from the book.
