import { EVENTS_TAB, listConfig, getApplyCountsByEvent } from '@/lib/sheets';
import { computeEventStatus } from '@/lib/eventStatus';
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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">용인시 마을공동체지원센터</p>
            <h1 className="text-xl font-bold text-brand-700">용마공 교육행사</h1>
          </div>
          <a href="/admin" className="text-sm text-gray-400 hover:text-brand-600">
            관리자
          </a>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <HomeCatalog events={published} />
      </div>
    </main>
  );
}
