'use client';

import { useEffect, useRef, useState } from 'react';

export type OfferTarget = { slug: string; venture: string };

type Status = { kind: 'idle' | 'sending' | 'sent' } | { kind: 'error'; message: string; contact?: string };

const REMEMBER_KEY = 'bh-mentor';

/** A mentor's note about one builder. It is sent to the BuildHouse team, who make the introduction. */
export default function OfferDialog({ target, onClose }: { target: OfferTarget | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [who, setWho] = useState({ name: '', email: '' });

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (target && !d.open) {
      setStatus({ kind: 'idle' });
      // Remembering the mentor's own name and email is a convenience only, so a blocked store is fine.
      try {
        const saved = JSON.parse(window.localStorage.getItem(REMEMBER_KEY) || 'null');
        if (saved && typeof saved.name === 'string' && typeof saved.email === 'string') setWho(saved);
      } catch {}
      d.showModal();
    }
    if (!target && d.open) d.close();
  }, [target]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!target) return;
    const form = new FormData(e.currentTarget);
    const body = {
      slug: target.slug,
      name: String(form.get('name') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      note: String(form.get('note') ?? '').trim(),
    };
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/offer', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.assign('/unlock');
        return;
      }
      if (!res.ok) {
        setStatus({ kind: 'error', message: data.error || 'Your note did not go through. Try again in a minute.', contact: data.contact });
        return;
      }
      try {
        window.localStorage.setItem(REMEMBER_KEY, JSON.stringify({ name: body.name, email: body.email }));
      } catch {}
      setWho({ name: body.name, email: body.email });
      setStatus({ kind: 'sent' });
    } catch {
      setStatus({ kind: 'error', message: 'No connection. Check your internet and try again.' });
    }
  }

  return (
    <dialog ref={ref} className="modal" aria-labelledby="offer-title" onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {target && (
        <div className="modal-body">
          <h2 id="offer-title" className="modal-title">Help {target.venture}</h2>
          {status.kind === 'sent' ? (
            <>
              <p className="modal-copy" role="status">Sent. The BuildHouse team will follow up with you by email.</p>
              <button type="button" className="cta" onClick={onClose}>Back to the book</button>
            </>
          ) : (
            <form className="offer-form" onSubmit={onSubmit}>
              <p className="modal-copy">Your note goes to the BuildHouse team, who will make the introduction.</p>
              <label htmlFor="offer-name">Your name</label>
              <input id="offer-name" name="name" required maxLength={120} autoComplete="name" defaultValue={who.name} key={`n-${who.name}`} />
              <label htmlFor="offer-email">Your email</label>
              <input id="offer-email" name="email" type="email" required maxLength={200} autoComplete="email" defaultValue={who.email} key={`e-${who.email}`} />
              <label htmlFor="offer-note">How you can help</label>
              <textarea id="offer-note" name="note" required maxLength={2000} rows={5} />
              {status.kind === 'error' && (
                <p className="form-error" role="alert">
                  {status.message}
                  {status.contact && <> You can also email <a href={`mailto:${status.contact}`}>{status.contact}</a>.</>}
                </p>
              )}
              <div className="form-actions">
                <button type="submit" className="cta" disabled={status.kind === 'sending'}>{status.kind === 'sending' ? 'Sending' : 'Send to BuildHouse'}</button>
                <button type="button" className="textbtn" onClick={onClose}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
    </dialog>
  );
}
