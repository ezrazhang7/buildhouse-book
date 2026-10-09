import UnlockForm from '@/components/UnlockForm';
import { safeNext } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function UnlockPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="desk unlock-desk">
      <div className="unlock-cover">
        <p className="unlock-mark">BuildHouse</p>
        <h1 className="unlock-title">Mentor book</h1>
        <p className="unlock-copy">This book is for BuildHouse mentors. Enter the password the BuildHouse team sent you.</p>
        <UnlockForm next={safeNext(next)} />
      </div>
    </main>
  );
}
