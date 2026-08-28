import { EVENTS_TAB, SURVEYS_TAB, listConfig } from '@/lib/sheets';
import SiteHeader from '../SiteHeader';

export const dynamic = 'force-dynamic';

export default async function SurveysListPage() {
  let surveys = [];
  let events = [];
  try {
    [surveys, events] = await Promise.all([listConfig(SURVEYS_TAB), listConfig(EVENTS_TAB)]);
  } catch (error) {
    console.error('Failed to load public surveys', error);
  }

  const eventById = Object.fromEntries(events.map((ev) => [ev.id, ev]));
  const visible = surveys
    .filter((sv) => sv.published)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-1">만족도설문조사</h1>
        <p className="text-sm text-gray-400 mb-6">참여하신 교육/행사의 만족도 설문에 참여해 주세요.</p>

        {visible.length === 0 ? (
          <p className="text-gray-400 text-sm py-12 text-center">현재 참여 가능한 만족도 설문이 없습니다.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((sv) => {
              const linkedEvent = sv.linkedEventId ? eventById[sv.linkedEventId] : null;
              return (
                <a key={sv.id} href={`/survey/${sv.id}`} className="card block hover:shadow-md transition-shadow space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {linkedEvent && (
                      <span className="text-xs rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 inline-block">
                        {linkedEvent.title}
                      </span>
                    )}
                    {sv.round && (
                      <span className="text-xs rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 inline-block">{sv.round}</span>
                    )}
                  </div>
                  <h3 className="font-bold leading-snug line-clamp-2">{sv.title}</h3>
                  {sv.intro && <p className="text-xs text-gray-500 line-clamp-2 whitespace-pre-wrap">{sv.intro}</p>}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
