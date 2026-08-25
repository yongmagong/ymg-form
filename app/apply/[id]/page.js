import { EVENTS_TAB, getConfigById } from '@/lib/sheets';
import ApplyForm from './ApplyForm';

export const dynamic = 'force-dynamic';

export default async function ApplyPage({ params }) {
  const event = await getConfigById(EVENTS_TAB, params.id);

  if (!event) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-gray-500">존재하지 않는 신청서입니다.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold text-brand-700 mb-4">{event.title}</h1>
          <div className="space-y-4">
            {(event.sections || []).map((s, i) => (
              <div key={i}>
                {s.label && <p className="font-semibold text-sm text-gray-500 mb-1">{s.label}</p>}
                <p className="whitespace-pre-wrap text-gray-700">{s.content}</p>
              </div>
            ))}
          </div>
        </div>

        <ApplyForm eventId={event.id} />
      </div>
    </main>
  );
}
