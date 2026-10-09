'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Founder, Profile } from '@/lib/types';
import OfferDialog from './OfferDialog';
import type { OfferTarget } from './OfferDialog';

// Below this size the two-page spread is too small to read, so the book becomes a one-page-at-a-time swipe pager.
// Keep this the same as the pager media query in app/globals.css.
const PAGER_QUERY = '(max-width: 900px), (max-height: 700px)';
const FRONT_PAGES = 3; // cover, how to read, contents

function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return match;
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}

function FounderRow({ f }: { f: Founder }) {
  return (
    <li className="founder">
      <span className="portrait" aria-hidden="true">
        {f.headshot ? <img src={f.headshot} alt="" loading="lazy" /> : initials(f.name)}
      </span>
      <span className="founder-text">
        <span className="fname">{f.name}</span>
        {f.title && <span className="ftitle">{f.title}</span>}
        {(f.linkedin || f.instagram) && (
          <span className="flinks">
            {f.linkedin && <a href={f.linkedin} target="_blank" rel="noreferrer noopener" aria-label={`${f.name} on LinkedIn`}>LinkedIn</a>}
            {f.instagram && <a href={f.instagram} target="_blank" rel="noreferrer noopener" aria-label={`${f.name} on Instagram`}>Instagram</a>}
          </span>
        )}
      </span>
    </li>
  );
}

function VentureLeft({ p }: { p: Profile }) {
  const meta = [[p.tier, p.residency.toLowerCase()].filter(Boolean).join(' '), p.movedIn && `moved in ${p.movedIn}`, p.daysInSpace && `in the house ${p.daysInSpace} a week`].filter(Boolean).join(', ');
  const wideStats = p.stats.some((s) => s.value.length > 7);
  return (
    <div className="sheet">
      <div className="sheet-head">
        {meta && <p className="meta">{meta}</p>}
        {p.logo && <img className="logo" src={p.logo} alt={`${p.venture} logo`} loading="lazy" />}
      </div>
      <h2 className={`vname${p.venture.length > 22 ? ' long' : ''}`}>{p.venture}</h2>
      {p.oneLiner && <p className="oneliner">{p.oneLiner}</p>}
      {p.stats.length > 0 && (
        <dl className={`stats${wideStats ? ' wide' : ''}`}>
          {p.stats.map((s) => (
            <div key={s.label} className="stat">
              <dt className="stat-label">{s.label}</dt>
              <dd className="stat-value">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <ul className={`founders${p.founders.length > 3 ? ' compact' : ''}`}>
        {p.founders.map((f) => <FounderRow key={f.name} f={f} />)}
      </ul>
      {p.links.length > 0 && (
        <p className="vlinks">
          {p.links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noreferrer noopener">{/^(instagram|linkedin|tiktok)$/i.test(l.label) ? `${p.venture} on ${l.label}` : l.label}</a>)}
        </p>
      )}
    </div>
  );
}

function VentureRight({ p, n, total, edition, onStory, onOffer }: { p: Profile; n: number; total: number; edition: string; onStory: () => void; onOffer: () => void }) {
  const hasAsk = p.needs.length > 0 || !!p.ask;
  return (
    <div className="sheet">
      <h3 className="kicker">Founding story</h3>
      {p.story.length > 0 ? (
        <>
          <div className="story">
            {p.story.map((para, i) => <p key={i}>{para}</p>)}
          </div>
          <button type="button" className="textbtn" onClick={onStory}>Read the full story</button>
        </>
      ) : (
        <p className="story empty">No founding story on file yet.</p>
      )}

      <div className="cloud">
        <h3 className="cloud-title">Where a mentor could help</h3>
        {hasAsk ? (
          <>
            {p.needs.length > 0 && <ul className="needs">{p.needs.map((need) => <li key={need}>{need}</li>)}</ul>}
            {p.ask && <blockquote className="ask">{p.ask}</blockquote>}
          </>
        ) : (
          <p className="ask plain">No ask on file yet. If you see a way to help, tell BuildHouse.</p>
        )}
      </div>

      <button type="button" className="cta" onClick={onOffer}>I can help with this</button>

      <div className="titleblock" aria-label={`Sheet ${n} of ${total}`}>
        <span>BuildHouse mentor book</span>
        <span>{edition}</span>
        <span>Sheet {n} of {total}</span>
      </div>
    </div>
  );
}

export default function Book({ profiles, edition }: { profiles: Profile[]; edition: string }) {
  const K = profiles.length;
  const pageCount = FRONT_PAGES + 2 * K + 1;
  const L = Math.ceil(pageCount / 2);

  const pager = useMedia(PAGER_QUERY);
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)');

  const [flipped, setFlipped] = useState(0); // spread view: how many leaves are turned
  const [pagerPage, setPagerPage] = useState(0); // pager view: which page is on screen
  const [riffle, setRiffle] = useState(false);
  const [need, setNeed] = useState<string | null>(null);
  const [storyOf, setStoryOf] = useState<Profile | null>(null);
  const [offer, setOffer] = useState<OfferTarget | null>(null);

  const flippedRef = useRef(0);
  const timer = useRef<number | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDialogElement>(null);

  const apply = useCallback((n: number) => {
    flippedRef.current = n;
    setFlipped(n);
  }, []);

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  /** Spread view: turn to a given number of flipped leaves, riffling through when it is more than one away. */
  const turnTo = useCallback((target: number) => {
    const to = Math.max(0, Math.min(L, target));
    stop();
    const from = flippedRef.current;
    if (Math.abs(to - from) <= 1 || reducedMotion) {
      setRiffle(false);
      apply(to);
      return;
    }
    setRiffle(true);
    const dir = Math.sign(to - from);
    timer.current = window.setInterval(() => {
      const next = flippedRef.current + dir;
      apply(next);
      if (next === to) {
        stop();
        window.setTimeout(() => setRiffle(false), 450);
      }
    }, 60);
  }, [L, apply, reducedMotion, stop]);

  const scrollToPage = useCallback((page: number) => {
    const el = bookRef.current;
    if (!el) return;
    const to = Math.max(0, Math.min(pageCount - 1, page));
    el.scrollTo({ left: to * el.clientWidth, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [pageCount, reducedMotion]);

  /** Go to a page by its index in reading order, in whichever view is active. */
  const goToPage = useCallback((page: number) => {
    if (pager) scrollToPage(page);
    else turnTo(Math.ceil(page / 2));
  }, [pager, scrollToPage, turnTo]);

  const step = useCallback((dir: 1 | -1) => {
    if (pager) scrollToPage(pagerPage + dir);
    else turnTo(flippedRef.current + dir);
  }, [pager, pagerPage, scrollToPage, turnTo]);

  const goToVenture = useCallback((slug: string) => {
    const k = profiles.findIndex((p) => p.slug === slug);
    if (k >= 0) goToPage(FRONT_PAGES + 2 * k);
  }, [profiles, goToPage]);

  // Which venture is showing, if any.
  const page = pager ? pagerPage : Math.max(0, flipped * 2 - 1);
  const ventureIndex = page >= FRONT_PAGES && page < FRONT_PAGES + 2 * K ? Math.floor((page - FRONT_PAGES) / 2) : -1;
  const current = ventureIndex >= 0 ? profiles[ventureIndex] : null;
  const atStart = pager ? pagerPage === 0 : flipped === 0;
  const atEnd = pager ? pagerPage === pageCount - 1 : flipped === L;
  const where = current ? `Sheet ${ventureIndex + 1} of ${K}, ${current.venture}` : page === 0 ? 'Cover' : page < FRONT_PAGES ? 'Contents' : 'Back page';

  // Open on the venture named in the address (#trybl), once the right view is known.
  const opened = useRef(false);
  const pendingPage = useRef<number | null>(null);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    const slug = decodeURIComponent(window.location.hash.slice(1));
    if (!slug) return;
    const k = profiles.findIndex((p) => p.slug === slug);
    if (k < 0) return;
    const target = FRONT_PAGES + 2 * k;
    // In pager view the scroll happens in the view-change effect below, once the layout has switched.
    if (window.matchMedia(PAGER_QUERY).matches) pendingPage.current = target;
    else apply(Math.ceil(target / 2));
  }, [profiles, apply]);

  // Following a link to another venture (#creset) while the book is open turns to it.
  useEffect(() => {
    const onHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      if (slug) goToVenture(slug);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [goToVenture]);

  // Keep the address pointing at the venture on screen so a mentor can copy a link to it.
  useEffect(() => {
    if (!opened.current) return;
    const hash = current ? `#${current.slug}` : '';
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash || window.location.pathname);
  }, [current]);

  // Carry the position across when the window crosses between spread and pager views.
  const lastPage = useRef(0);
  useEffect(() => { lastPage.current = page; }, [page]);
  const firstView = useRef(true);
  useEffect(() => {
    if (firstView.current) { firstView.current = false; return; }
    const p = pendingPage.current ?? lastPage.current;
    pendingPage.current = null;
    if (pager) {
      requestAnimationFrame(() => {
        const el = bookRef.current;
        if (el) el.scrollTo({ left: p * el.clientWidth, behavior: 'auto' });
      });
    } else {
      stop();
      apply(Math.ceil(p / 2));
    }
  }, [pager, apply, stop]);

  useEffect(() => {
    const el = bookRef.current;
    if (!pager || !el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setPagerPage(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [pager]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector('dialog[open]')) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); step(-1); }
      else if (e.key === 'Home') { e.preventDefault(); goToPage(0); }
      else if (e.key === 'End') { e.preventDefault(); goToPage(pageCount - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, goToPage, pageCount]);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    const d = storyRef.current;
    if (!d) return;
    if (storyOf && !d.open) d.showModal();
    if (!storyOf && d.open) d.close();
  }, [storyOf]);

  // Touch swipe in spread view (tablets in landscape). The pager scrolls natively.
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    swipe.current = !pager && e.pointerType !== 'mouse' ? { x: e.clientX, y: e.clientY } : null;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(e.clientY - s.y)) step(dx < 0 ? 1 : -1);
  };

  async function lock() {
    await fetch('/api/lock', { method: 'POST' }).catch(() => {});
    window.location.assign('/unlock');
  }

  const needCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of profiles) for (const n of p.needs) counts.set(n, (counts.get(n) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [profiles]);
  const residents = profiles.filter((p) => p.residency === 'Resident').length;
  const matching = need ? profiles.filter((p) => p.needs.includes(need)).length : 0;

  const pages: ReactNode[] = [
    // 0: cover
    <div className="sheet cover" key="cover">
      <p className="cover-mark">BuildHouse</p>
      <h1 className="cover-title">Meet the builders</h1>
      <p className="cover-sub">{K} ventures being built out of BuildHouse in Chapel Hill, and what each one needs from a mentor.</p>
      <p className="cover-note">Flip through, then tell us who you can help.</p>
      <button type="button" className="cover-open" onClick={() => step(1)}>Open the book</button>
      <div className="titleblock on-ink">
        <span>Mentor book</span>
        <span>{edition}</span>
        <span>{K} sheets</span>
      </div>
    </div>,

    // 1: how to read
    <div className="sheet" key="intro">
      <h2 className="page-title">How to read this book</h2>
      <p className="lede">{K} ventures: {residents} working in the house, {K - residents} remote.</p>
      <ul className="howto">
        <li>Each builder gets one spread. Who they are is on the left. Their story and what they need are on the right.</li>
        <li>{pager ? 'Swipe sideways to turn the page, or use the arrows below.' : 'Turn pages with the arrows beside the book or the arrow keys on your keyboard.'}</li>
        <li>The contents page sorts builders by the kind of help they asked for.</li>
      </ul>
      <div className="cloud legend">
        <h3 className="cloud-title">Where a mentor could help</h3>
        <p className="ask plain">Red markup like this is the builder’s own ask, in their words.</p>
      </div>
      <p className="howto-note">See someone you can help? Choose “I can help with this” on their page. Your note goes to the BuildHouse team, who make the introduction. Founders’ phone numbers and emails are not in this book.</p>
      <p className="howto-note">This book is private. Please do not pass the password on.</p>
    </div>,

    // 2: contents
    <div className="sheet" key="index">
      <h2 className="page-title">Contents</h2>
      <p className="filter-label" id="filter-label">{need ? `${matching} of ${K} builders asked for this` : 'Show who needs help with'}</p>
      <div className="chips" role="group" aria-labelledby="filter-label">
        {needCounts.map(([n, count]) => (
          <button key={n} type="button" className="chip" aria-pressed={need === n} onClick={() => setNeed(need === n ? null : n)}>
            {n} <span className="chip-count">{count}</span>
          </button>
        ))}
      </div>
      <ol className="index-list">
        {profiles.map((p, i) => {
          const hit = !need || p.needs.includes(need);
          return (
            <li key={p.slug} className={need ? (hit ? 'hit' : 'miss') : undefined}>
              <button type="button" onClick={() => goToVenture(p.slug)}>
                <span className="index-name">{p.venture}</span>
                <span className="index-who">{p.founders.slice(0, 2).map((f) => f.name).join(', ')}{p.founders.length > 2 ? ` +${p.founders.length - 2}` : ''}</span>
                <span className="index-num">{i + 1}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>,

    ...profiles.flatMap((p, i) => [
      <VentureLeft key={`${p.slug}-a`} p={p} />,
      <VentureRight key={`${p.slug}-b`} p={p} n={i + 1} total={K} edition={edition} onStory={() => setStoryOf(p)} onOffer={() => setOffer({ slug: p.slug, venture: p.venture })} />,
    ]),

    // last: back page
    <div className="sheet" key="closing">
      <h2 className="page-title">That is everyone, for now</h2>
      <p className="lede">New builders are added as they move in.</p>
      <p className="howto-note">Not sure who to pick? Tell BuildHouse what you are good at and they will match you.</p>
      <div className="closing-actions">
        <button type="button" className="cta" onClick={() => setOffer({ slug: 'general', venture: 'any builder' })}>Offer help to any builder</button>
        <button type="button" className="textbtn" onClick={() => goToPage(2)}>Back to contents</button>
        <button type="button" className="textbtn" onClick={lock}>Lock the book</button>
      </div>
    </div>,
  ];

  const leaves = Array.from({ length: L }, (_, i) => i);
  const position = pager ? '' : flipped === 0 ? ' at-front' : flipped === L ? ' at-back' : '';

  return (
    <div className="desk">
      <header className="bar">
        <span className="bar-mark">BuildHouse mentor book</span>
        <button type="button" className="bar-btn" onClick={lock}>Lock</button>
      </header>

      <main className="stage">
        <button type="button" className="turn" aria-label="Previous page" disabled={atStart} onClick={() => step(-1)}><Chevron dir="left" /></button>
        <div ref={bookRef} className={`book${position}${riffle ? ' riffle' : ''}`} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          {leaves.map((i) => (
            <div key={i} className={`leaf${i < flipped ? ' flipped' : ''}`} style={{ '--z-rest': L - i, '--z-flip': L + i } as React.CSSProperties}>
              <section className="face front" inert={!pager && i !== flipped} aria-label={`Page ${2 * i + 1}`}>
                {pages[2 * i]}
              </section>
              <section className="face back" inert={!pager && i !== flipped - 1} aria-label={`Page ${2 * i + 2}`}>
                {pages[2 * i + 1] ?? <div className="sheet" />}
              </section>
            </div>
          ))}
        </div>
        <button type="button" className="turn" aria-label="Next page" disabled={atEnd} onClick={() => step(1)}><Chevron dir="right" /></button>
      </main>

      <footer className="foot">
        <button type="button" className="bar-btn" onClick={() => goToPage(2)}>Contents</button>
        <p className="where" aria-live="polite">{where}</p>
        <span className="foot-turns">
          <button type="button" className="turn small" aria-label="Previous page" disabled={atStart} onClick={() => step(-1)}><Chevron dir="left" /></button>
          <button type="button" className="turn small" aria-label="Next page" disabled={atEnd} onClick={() => step(1)}><Chevron dir="right" /></button>
        </span>
      </footer>

      <dialog ref={storyRef} className="modal" aria-labelledby="story-title" onClose={() => setStoryOf(null)} onClick={(e) => { if (e.target === e.currentTarget) setStoryOf(null); }}>
        {storyOf && (
          <div className="modal-body">
            <p className="modal-kicker">Founding story</p>
            <h2 id="story-title" className="modal-title">{storyOf.venture}</h2>
            <div className="modal-story">{storyOf.story.map((para, i) => <p key={i}>{para}</p>)}</div>
            <button type="button" className="cta" onClick={() => setStoryOf(null)}>Close</button>
          </div>
        )}
      </dialog>

      <OfferDialog target={offer} onClose={() => setOffer(null)} />
    </div>
  );
}
