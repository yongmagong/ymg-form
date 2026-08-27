import { EVENTS_TAB, getConfigById, getApplyCountsByEvent } from '@/lib/sheets';
import { computeEventStatus, formatDateRange, formatRecruitPeriod } from '@/lib/eventStatus';
import SiteHeader from '../../SiteHeader';
import ApplyForm from './ApplyForm';

export const dynamic = 'force-dynamic';

export default async function ApplyPage({ params }) {
  const event = await getConfigById(EVENTS_TAB, params.id);

  if (!event) {
    return (
      <main className="min-h-screen">
        <SiteHeader />
        <div className="flex items-center justify-center p-6">
          <p className="text-gray-500">존재하지 않는 신청서입니다.</p>
        </div>
      </main>
    );
  }

  let appliedCount = 0;
  try {
    const counts = await getApplyCountsByEvent();
    appliedCount = counts[event.id] || 0;
  } catch (error) {
    console.error('Failed to load applied counts', error);
  }
  const status = computeEventStatus(event, appliedCount);
  const mapUrl = event.locationAddress
    ? `https://map.kakao.com/link/search/${encodeURIComponent(event.locationAddress)}`
    : null;

  return (
    <main className="min-h-screen pb-28">
      <SiteHeader />
      <div className="max-w-2xl mx-auto space-y-6 p-4 sm:p-8">
        <div className="card">
          {event.imageUrl && (
            <div className="mb-5 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <img src={event.imageUrl} alt={`${event.title} 포스터`} className="w-full object-contain" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span
              className={`text-xs font-semibold rounded-full px-2 py-1 ${
                status.closed ? 'bg-gray-200 text-gray-600' : 'bg-brand-600 text-white'
              }`}
            >
              {status.label}
            </span>
            {event.category && (
              <span className="text-xs rounded-full bg-brand-50 text-brand-700 px-2 py-1">{event.category}</span>
            )}
            {event.orgLabel && (
              <span className="text-xs rounded-full bg-gray-100 text-gray-600 px-2 py-1">{event.orgLabel}</span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-brand-700 mb-4">{event.title}</h1>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm mb-5">
            {event.eventStart && (
              <p>
                <span className="font-semibold">일시</span> · {formatDateRange(event.eventStart, event.eventEnd)}
              </p>
            )}
            {event.locationName && (
              <p>
                <span className="font-semibold">장소</span> · {event.locationName}
                {event.locationAddress && <span className="text-gray-500"> ({event.locationAddress})</span>}
                {mapUrl && (
                  <a href={mapUrl} target="_blank" rel="noreferrer" className="ml-2 text-brand-600 hover:underline">
                    지도에서 보기
                  </a>
                )}
              </p>
            )}
            <p>
              <span className="font-semibold">모집정보</span> · 신청 {appliedCount}명
              {event.capacity ? ` / 정원 ${event.capacity}명` : ' (정원 제한 없음)'}
            </p>
            {(event.recruitStart || event.recruitEnd) && (
              <p>
                <span className="font-semibold">모집기간</span> · {formatRecruitPeriod(event.recruitStart, event.recruitEnd)}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {(event.sections || []).map((s, i) => (
              <div key={i}>
                {s.label && <p className="font-semibold text-sm text-gray-500 mb-1">{s.label}</p>}
                <p className="whitespace-pre-wrap text-gray-700">{s.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="apply-form" className="scroll-mt-20">
          <ApplyForm eventId={event.id} questions={event.questions} closed={status.closed} />
        </div>
      </div>

      {!status.closed && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:hidden">
          <a href="#apply-form" className="btn-primary w-full text-center block text-lg">
            신청하기
          </a>
        </div>
      )}
    </main>
  );
}
