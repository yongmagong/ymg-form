import { EVENTS_TAB, RECORDS_TAB, getConfigById } from '@/lib/sheets';
import SiteHeader from '../../SiteHeader';

export const dynamic = 'force-dynamic';

export default async function RecordDetailPublicPage({ params }) {
  const record = await getConfigById(RECORDS_TAB, params.id);

  if (!record || !record.published) {
    return (
      <main className="min-h-screen">
        <SiteHeader />
        <div className="flex items-center justify-center p-6">
          <p className="text-gray-500">존재하지 않는 기록입니다.</p>
        </div>
      </main>
    );
  }

  const linkedEvent = record.linkedEventId ? await getConfigById(EVENTS_TAB, record.linkedEventId) : null;

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="max-w-2xl mx-auto space-y-6 p-4 sm:p-8">
        <div className="card">
          {record.imageUrl && (
            <div className="mb-5 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <img src={record.imageUrl} alt={record.title} className="w-full object-contain" />
            </div>
          )}

          {linkedEvent && (
            <a href={`/apply/${linkedEvent.id}`} className="text-xs rounded-full bg-brand-50 text-brand-700 px-2 py-1 inline-block mb-3 hover:underline">
              {linkedEvent.title}
            </a>
          )}

          <h1 className="text-2xl font-bold text-brand-700 mb-1">{record.title}</h1>
          <p className="text-xs text-gray-400 mb-4">{new Date(record.createdAt).toLocaleDateString('ko-KR')}</p>

          <div className="space-y-4">
            {(record.sections || []).map((s, i) => (
              <div key={i}>
                {s.label && <p className="font-semibold text-sm text-gray-500 mb-1">{s.label}</p>}
                <p className="whitespace-pre-wrap text-gray-700">{s.content}</p>
              </div>
            ))}
          </div>

          {(record.images || []).length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 mt-6">
              {record.images.map((url, i) => (
                <img key={i} src={url} alt="" className="w-full rounded-lg border border-gray-200 object-cover" />
              ))}
            </div>
          )}

          {(record.attachments || []).length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-4 space-y-2">
              <p className="font-semibold text-sm text-gray-500 mb-1">첨부파일</p>
              {record.attachments.map((a, i) => (
                <a
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-brand-700 hover:bg-brand-50"
                >
                  📎 {a.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
