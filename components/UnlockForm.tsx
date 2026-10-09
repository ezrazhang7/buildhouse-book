'use client';

import { useState } from 'react';

export default function UnlockForm({ next }: { next: string }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get('password') ?? '');
    if (!password) return setError('Enter the password.');
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password, next }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // The browser carries a #venture link across the redirect to this page, so hand it back to the book.
        window.location.assign((data.next || '/') + window.location.hash);
        return;
      }
      setError(data.error || 'The book could not be opened. Try again.');
    } catch {
      setError('No connection. Check your internet and try again.');
    }
    setBusy(false);
  }

  return (
    <form className="unlock-form" onSubmit={onSubmit}>
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" autoFocus aria-describedby={error ? 'unlock-error' : undefined} aria-invalid={!!error} />
      {error && <p id="unlock-error" className="unlock-error" role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? 'Opening' : 'Open the book'}</button>
    </form>
  );
}
