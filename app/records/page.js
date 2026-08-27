import { EVENTS_TAB, RECORDS_TAB, listConfig } from '@/lib/sheets';
import { recordCardHref } from '@/lib/recordLink';
import SiteHeader from '../SiteHeader';

export const dynamic = 'force-dynamic';

export default async function RecordsListPage() {
  let records = [];
  let events = [];
  try {
    [records, events] = await Promise.all([listConfig(RECORDS_TAB), listConfig(EVENTS_TAB)]);
  } catch (error) {
    console.error('Failed to load public records', error);
  }

  const eventTitleById = Object.fromEntries(events.map((ev) => [ev.id, ev.title]));
  const published = records
    .filter((r) => r.published)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">기록함</h1>
        {published.length === 0 ? (
          <p className="text-gray-400 text-sm py-12 text-center">아직 게시된 기록이 없습니다.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((r) => (
              <a key={r.id} href={recordCardHref(r)} className="card block overflow-hidden hover:shadow-md transition-shadow p-0">
                <div className="aspect-[4/3] bg-gray-100">
                  {r.imageUrl ? (
                    <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">이미지 없음</div>
                  )}
                </div>
                <div className="p-4 space-y-1.5">
                  {r.linkedEventId && eventTitleById[r.linkedEventId] && (
                    <span className="text-xs rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 inline-block">
                      {eventTitleById[r.linkedEventId]}
                    </span>
                  )}
                  <h3 className="font-bold leading-snug line-clamp-2">{r.title}</h3>
                  <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('ko-KR')}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
