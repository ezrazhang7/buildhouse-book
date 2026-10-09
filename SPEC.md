# BuildHouse mentor book: spec

Written 2026-10-09. Describes what is built in this repo, what is stubbed, and what is left to decide.

## 1. What it is

A private website BuildHouse (Chapel Hill) sends to mentors. It reads like a bound book: a cover, a contents page, then one two-page spread per venture. A mentor flips through, sees who each founder is and what they asked for, and tells BuildHouse who they can help.

It replaces the Canva profile PDFs. Those are flat images that someone has to redo by hand every time a number changes. Here every page is live HTML drawn from one tab of the BuildHouse sheet.

**Readers:** mentors, on a laptop mostly, sometimes a phone. **Editors:** the BuildHouse team, in Google Sheets. Nobody edits the site itself.

## 2. Decisions made (change these if they are wrong)

| Decision | Chosen | Why | Cost of changing |
|---|---|---|---|
| Access | One shared password for all mentors | Simplest thing to hand out | Per-mentor links need a "Mentors" tab and a token check; about a day |
| Data source | A new **Profiles** tab in the existing sheet | The form-response tab mixes public copy with phone numbers, e-signatures and dues questions | None; the raw tab is never read by the site |
| Freshness | Sheet is read at build time, not on every page view | No Google call can fail while a mentor is reading, and credentials never run in the request path | Add a Vercel deploy hook button (section 7) for "publish now" |
| "I can help" | Goes to BuildHouse, not to the founder | Founders' contact details stay out of the book | n/a |
| Page turn | Own CSS 3D leaves, no flipbook library | Pages stay real DOM, so links, dialogs and filters work inside them | n/a |
| Phones | Swipe pager, one page at a time | A two-page spread is unreadable under about 900px wide | n/a |
| Developer access | An environment flag on the developer's own machine, not a second password | A second password is a second secret with the same blast radius, and it is the one that leaks | n/a |

## 3. Experience

Reading order: cover, how to read, contents, 17 venture spreads, back page.

- **Cover.** Title, count of ventures, edition (`BOOK_EDITION`).
- **How to read.** Three lines of instruction and a legend for the red markup.
- **Contents.** Every venture with its founders and sheet number. Chips filter by the kind of help founders asked for (11 fixed categories, counts shown). Clicking a venture riffles to it.
- **Venture spread, left page.** Tier and move-in month, venture name, one-liner, up to four stats, founders with portrait, title, LinkedIn and Instagram, venture links.
- **Venture spread, right page.** Founding story (fades out; "Read the full story" opens it in full), the ask inside a red revision cloud with the filterable needs and the founder's own words, an "I can help with this" button, and a title block with the sheet number.
- **Back page.** Offer help to any builder, back to contents, lock the book.

Ways to move: arrows beside the book, arrow keys, Page Up/Down, Home/End, swipe on touch screens, contents button. Each venture has its own address (`/#trybl`), which survives the password step, so BuildHouse can send a mentor straight to one founder.

Design: a set of drawings on a cutting mat. Paper pages, navy ink, non-photo-blue rules, and redline (the red a reviewer marks plans up with) used only for what a founder needs from a mentor. Type is Big Shoulders Display for names and labels, Source Serif 4 for reading, Architects Daughter for the redline notes. Fonts are bundled, not loaded from Google.

Missing content shows as a plain line ("No founding story on file yet") so gaps are visible to BuildHouse instead of hidden.

## 4. Data

### The Profiles tab

One row per venture. Import `seed/profiles-tab.csv` to create it. Columns:

| Column | Format | Notes |
|---|---|---|
| publish | TRUE / FALSE | Only TRUE rows are built. Two seed rows are held back |
| slug | text, optional | Address of the spread. Made from the venture name if blank |
| venture | text | Required |
| one_liner | one sentence | |
| founders | one per line: `Name \| Title \| LinkedIn URL \| Instagram handle \| headshot Drive link` | Later fields optional |
| tier | as on the form | Anything in brackets (dues) is dropped |
| moved_in | date | Shown as month and year |
| days_in_space | text | Optional |
| story | paragraphs separated by a blank line | |
| stats | one per line: `Value \| Label` | Up to four |
| needs | separated by `;` | Must be from the list in `lib/profiles-map.mjs`; others are dropped with a build warning |
| ask | text | The founder's own words |
| links | one per line: `Label \| URL` | For Instagram a handle is enough |
| logo | Drive link | |
| notes | text | Internal. Never leaves the sheet |

Rules the mapper enforces: links must be http(s); Drive ids are stripped before anything reaches the browser; duplicate slugs are skipped with a warning.

### What the seed contains and where it came from

Built from the 22 form responses read on 2026-10-07 plus the three Canva profiles.

- 17 published, 2 held back (Kit 14 Public Relations and ThreatSecOps have no story or ask), 2 form rows skipped for having no venture, and the two Copperline rows merged.
- **Left out on purpose:** phone numbers, email addresses, e-signatures, dues, move-in questions.
- **Drafted by Claude, needs a founder's OK:** 14 of the 17 one-liners, written from each founding story. The `notes` column marks each one.
- **From the Canva designs:** one-liners and stats for TidalCleanse and Triangle Hydro Solutions. The "100+ homes" label was cut off in the export.
- **From founders' own stories:** every other stat.
- **Edited stories:** Trybl, Creset and Stomp Out Hunger were shortened. In the Stomp Out Hunger story the first name of the man the founder met was removed.
- **Still empty:** Markit Advertising (no one-liner, story or ask), TidalCleanse (story is a linked Google Doc), Triangle Hydro Solutions (no ask). The "pain points" form column only holds real answers from late August on; before that it holds orientation RSVPs, so earlier ventures' needs were read from their free-text support answer.
- **No photos or logos yet.** Portraits show initials. Single-founder rows already carry their headshot link; multi-founder teams need each photo matched to a name in the sheet. Speedy, which appears in the ChatGPT mockups, is not in the sheet and so not in the book.

### Sync

`npm run sync` (also runs before every build when credentials are set):

1. Reads `Profiles!A1:Z500` with a read-only service account.
2. Maps and validates rows, keeps published ones.
3. Downloads each headshot and logo from Drive into `public/media/<slug>/` (images only, 8 MB cap).
4. Writes `content/profiles.json`.
5. Refuses to build an empty book. Prints a warning for anything dropped.

Without credentials the build uses the committed `content/profiles.json`.

## 5. Access and privacy

- `proxy.ts` checks every request except `/unlock`, `/api/unlock`, `/robots.txt`, `/lock` and the compiled JS/CSS/fonts. No cookie means a redirect to `/unlock` (pages, images) or a 401 (API).
- `/lock` unsets the cookie and returns to `/unlock`. It is open on purpose: a way out of a session has to work while holding a cookie the gate rejects, and gating it would turn away exactly the person trying to clear it. It reveals nothing. The back page's button posts to `/api/lock` for the same effect; `/lock` exists so it can also be a link a mentor on a shared laptop is sent.
- The home page is rendered on the server per request, so founder data only exists in responses that passed the check. Compiled static files contain none of it.
- Password is compared in constant time. On success the server sets a 30-day cookie: `HttpOnly`, `Secure`, `SameSite=Lax`, signed with HMAC-SHA256. The signing key is derived from `SESSION_SECRET` and the password, so **changing the password signs every mentor out**.
- If `MENTOR_PASSWORD` (8+ characters) or `SESSION_SECRET` (32+) is missing, nobody gets in.
- Both are trimmed, and so is a typed attempt: a value pasted into a hosting dashboard arrives with a trailing newline often enough, and invisible whitespace is not a thing a mentor could diagnose. Quotes are kept, because a password may contain them, so `"a phrase"` pasted into Vercel is a different password than `a phrase`.
- Each server logs one `gate:` line at boot giving the configured password's length and four bytes of its hash. `npm run fingerprint` prints the same for a phrase, so a password that differs between a laptop and hosting is found by comparing rather than guessing. Anyone who can read these logs already has more access than the fingerprint gives them.
- Eight wrong tries per address per ten minutes, then a wait. This counter lives in one server instance's memory, so it slows guessing but does not stop a determined attacker; the password should be a long phrase.
- Headers on everything: `X-Robots-Tag: noindex`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` (the book's address is not leaked to LinkedIn or Instagram on click-through). `robots.txt` disallows all.
- Every response the proxy gives is `Cache-Control: private, no-store, max-age=0, must-revalidate`, **the redirects included**, and the redirects also say `Vary: Cookie`. Next's default on a middleware redirect is `public`, which is not free: a browser that stored `/ -> /unlock` before the login replays it afterwards, while `/unlock` is fetched fresh, sees the new cookie and returns the mentor to `/`, which is a redirect loop that clears only when the cached redirect expires. On pass-through responses Next replaces `Vary` with its own router list after the proxy runs; `no-store` survives there, and that is the half that stops a cache sharing one mentor's page with the next visitor.
- Limits of a shared password: it can be forwarded, and there is no record of which mentor opened what. Rotating it is the only way to revoke access.

### Reading the book while building it

`AUTH_BYPASS=1` in `.env.local` opens the gate without a password. It is not a second password, and that is the point: a `DEV_PASSWORD` would be a second secret with the same blast radius as the mentors' one, typed into the same public form, and it would be the one that ends up in a commit or a Slack message. It would also have to live in the signing key, which is derived from `SESSION_SECRET` and the password — either a second key to validate on every request, or one shared key where a leaked developer password forges mentor sessions.

An environment flag has none of that. Nothing a visitor can send turns it on; there is no door to find.

- `authBypass()` is the whole guarantee: it answers yes only when `AUTH_BYPASS=1` **and** `NODE_ENV` is not `production` **and** `VERCEL` is unset. `requestIsAuthed()` is the single check both `proxy.ts` and `/api/offer` call, so they cannot disagree about who is in.
- `instrumentation.ts` runs `assertBypassSafe()` at boot. On hosting the flag throws and the server serves nothing but 500s — it fails closed. On a local production build the flag is already inert, so it only warns; that build is how the real gate gets tested on a laptop and must keep working.
- The login rate limiter exempts loopback, and only off a deployment. Eight fumbled passwords on a laptop would otherwise lock a developer out for ten minutes, because loopback sends no `x-forwarded-for` and every local attempt shares one bucket. On a deployment a missing header never switches the limiter off.

**Preview deployments do not use this.** Vercel scopes environment variables per environment, so Preview gets its own throwaway `MENTOR_PASSWORD` value and runs exactly the code production runs. Never set `AUTH_BYPASS` in Vercel; the deployment will refuse to start.

## 6. "I can help with this"

Form: name, email, note. `POST /api/offer` checks the session again, validates, then delivers to whichever is configured:

- a row appended to the sheet's **Mentor offers** tab (time, venture, name, email, note). Needs the service account to have edit access and the tab to exist;
- a JSON POST to `OFFERS_WEBHOOK_URL`.

If neither is set, or delivery fails, the mentor sees an error with `CONTACT_EMAIL` as a fallback. Notes that start with `=`, `+`, `-` or `@` are escaped so they cannot run as formulas in the sheet.

## 7. Deploy (Vercel)

1. Push this repo to GitHub and import it in Vercel. Framework preset: Next.js. `vercel.json` pins this, because a project imported before the app code existed detects no framework, keeps the preset "Other", looks for a static `public/` directory after the build and serves a 404 on every path even though `next build` succeeded. If the preset was already wrong, fix it in Project Settings too: a dashboard Output Directory override still wins.
2. Set `MENTOR_PASSWORD` and `SESSION_SECRET`. The book works at this point from the committed seed. Give Preview its own `MENTOR_PASSWORD` value, and never set `AUTH_BYPASS` in Vercel (section 5).
3. For live data: create a Google Cloud service account, enable the Sheets and Drive APIs, share the sheet and the form's upload folders with the account's email, and set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SHEET_ID`.
4. For a "publish" button: create a Vercel deploy hook and call it from the sheet (Apps Script menu item) or on a daily schedule.
5. Add a custom domain if wanted.

## 8. Checked, and not checked

Checked on 2026-10-09 against a local production build: 22 unit tests (row mapping, link safety, token signing, expiry, tampering, password rotation); every route, image path and data path refuses a visitor without a cookie; forged cookie refused; compiled static files contain no founder data; the seed output contains no emails, phone numbers or dues; cover, contents filter, page turn, deep links, story and offer dialogs, and the phone pager driven in Chromium at 1440x900, 1280x640 and 390x844.

Checked on the same build: `/lock` unsets the cookie and locks the book again, including when the cookie it is holding is one the gate rejects; every proxy answer, redirects included, carries `private, no-store`; the authed `/unlock` redirect carries `Vary: Cookie`; following `/unlock` with a valid cookie ends at `/` in exactly one redirect, and `/` in none.

The developer bypass was checked end to end on 2026-10-09: with the flag set, the dev server serves the book with no password and `/api/offer` is reachable; with it unset, pages redirect to `/unlock`, the API answers 401 and `/media` is gated; ten wrong passwords in a row on loopback never trip the limiter and the correct one still works; a local production build ignores the flag, warns, and enforces the gate; and the same build with `VERCEL=1` refuses to boot and answers 500 to everything.

**Not checked:** the sheet sync and the sheet append against real Google APIs (no service account exists yet), a real Vercel deploy, Safari and Firefox, a screen reader pass.

## 9. Open questions for BuildHouse

1. Is one shared password acceptable, or do they need to revoke individual mentors?
2. Who approves the drafted one-liners: BuildHouse or each founder?
3. Should tier be shown to mentors at all?
4. Where should offers land: the sheet, Slack, email?
5. Do vendor residents (Kit 14) belong in a mentor book?

## 10. Later

Per-mentor links and an open log; real headshots and logos; drag-to-turn page curl; a print stylesheet; founders editing their own row through a form.
