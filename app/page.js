import { EVENTS_TAB, listConfig, getApplyCountsByEvent } from '@/lib/sheets';
import { computeEventStatus } from '@/lib/eventStatus';
import SiteHeader from './SiteHeader';
import HomeCatalog from './HomeCatalog';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let events = [];
  let appliedCounts = {};
  try {
    [events, appliedCounts] = await Promise.all([listConfig(EVENTS_TAB), getApplyCountsByEvent()]);
  } catch (error) {
    console.error('Failed to load public events', error);
  }

  const published = events
    .filter((ev) => ev.published)
    .map((ev) => ({
      ...ev,
      appliedCount: appliedCounts[ev.id] || 0,
      status: computeEventStatus(ev, appliedCounts[ev.id] || 0).label,
    }))
    .sort((a, b) => {
      const aClosed = a.status === '모집종료';
      const bClosed = b.status === '모집종료';
      if (aClosed !== bClosed) return aClosed ? 1 : -1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <HomeCatalog events={published} />
      </div>
    </main>
  );
}
