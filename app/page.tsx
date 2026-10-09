import profiles from '@/content/profiles.json';
import Book from '@/components/Book';
import type { Profile } from '@/lib/types';

// Rendered per request so the profile data only ever travels in a response the proxy has already gated.
export const dynamic = 'force-dynamic';

export default function Page() {
  return <Book profiles={profiles as Profile[]} edition={process.env.BOOK_EDITION || 'Fall 2026'} />;
}
