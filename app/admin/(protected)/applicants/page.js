'use client';

import { useEffect, useState } from 'react';

export default function ApplicantsPage() {
  const [events, setEvents] = useState(null);
  const [appliedCounts, setAppliedCounts] = useState({});
  const [sheetUrl, setSheetUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetch('/api/admin/events'), fetch('/api/admin/sheet-link')])
      .then(async ([evRes, linkRes]) => {
        const evData = await evRes.json();
        const linkData = await linkRes.json();
        if (!evRes.ok) throw new Error(evData.error || '신청서 목록을 불러오지 못했습니다.');
        setEvents(evData.events || []);
        setAppliedCounts(evData.appliedCounts || {});
        setSheetUrl(linkData.url || '');
      })
      .catch((err) => {
        setEvents([]);
        setError(err.message);
      });
  }, []);

  if (!events) return <p className="text-gray-400">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">참여신청자 보기</h1>
        <p className="text-gray-500 text-sm mt-1">신청서별 신청자 현황을 확인하고 명단을 내려받습니다.</p>
      </div>

      {error && (
        <div className="card border-red-100 bg-red-50 text-red-700 text-sm leading-relaxed">
          <p>{error}</p>
        </div>
      )}

      {events.length === 0 ? (
        <p className="text-gray-400 text-sm">참여신청서가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.id} className="card flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{ev.title}</p>
                <p className="text-xs text-gray-400 mt-1">
                  신청 {appliedCounts[ev.id] || 0}명{ev.capacity ? ` / 정원 ${ev.capacity}명` : ' (정원 제한 없음)'}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <a href={`/api/admin/events/${ev.id}/export`} className="btn-secondary text-xs">
                  CSV 다운로드
                </a>
                {sheetUrl && (
                  <a href={sheetUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs">
                    구글시트에서 보기
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
