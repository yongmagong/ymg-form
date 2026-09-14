'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ResponsesPage() {
  const [surveys, setSurveys] = useState(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetch('/api/admin/surveys'), fetch('/api/admin/sheet-link')])
      .then(async ([svRes, linkRes]) => {
        const svData = await svRes.json();
        const linkData = await linkRes.json();
        if (!svRes.ok) throw new Error(svData.error || '설문 목록을 불러오지 못했습니다.');
        setSurveys(svData.surveys || []);
        setSheetUrl(linkData.url || '');
      })
      .catch((err) => {
        setSurveys([]);
        setError(err.message);
      });
  }, []);

  if (!surveys) return <p className="text-gray-400">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">만족도설문조사 보기</h1>
        <p className="text-gray-500 text-sm mt-1">설문별 통계를 확인하고 응답을 내려받습니다.</p>
      </div>

      {error && (
        <div className="card border-red-100 bg-red-50 text-red-700 text-sm leading-relaxed">
          <p>{error}</p>
        </div>
      )}

      {surveys.length === 0 ? (
        <p className="text-gray-400 text-sm">설문조사가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {surveys.map((sv) => (
            <div key={sv.id} className="card flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">
                  {sv.title}
                  {sv.round ? ` (${sv.round})` : ''}
                </p>
                <p className="text-xs text-gray-400 mt-1">질문 {sv.questions.length}개</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link href={`/admin/surveys/${sv.id}/stats`} className="btn-secondary text-xs">
                  통계보기
                </Link>
                <a href={`/api/admin/surveys/${sv.id}/export`} className="btn-secondary text-xs">
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
