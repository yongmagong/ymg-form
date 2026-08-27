import { EVENTS_TAB, RECORDS_TAB, listConfig, getApplyCountsByEvent } from '@/lib/sheets';
import { computeEventStatus } from '@/lib/eventStatus';
import SiteHeader from './SiteHeader';
import HomeCatalog from './HomeCatalog';
import RecordsPreview from './RecordsPreview';

export const dynamic = 'force-dynamic';

const RECORDS_PREVIEW_COUNT = 6;

export default async function Home() {
  let events = [];
  let appliedCounts = {};
  let records = [];
  try {
    [events, appliedCounts, records] = await Promise.all([
      listConfig(EVENTS_TAB),
      getApplyCountsByEvent(),
      listConfig(RECORDS_TAB),
    ]);
  } catch (error) {
    console.error('Failed to load public homepage data', error);
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

  const eventTitleById = Object.fromEntries(events.map((ev) => [ev.id, ev.title]));
  const publishedRecords = records
    .filter((r) => r.published)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, RECORDS_PREVIEW_COUNT);

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        <section className="space-y-4">
          <h2 className="text-lg font-bold">교육행사</h2>
          <HomeCatalog events={published} />
        </section>

        <RecordsPreview records={publishedRecords} eventTitleById={eventTitleById} />
      </div>
    </main>
  );
}
