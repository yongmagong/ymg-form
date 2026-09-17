'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ScaleChart, CategoryChart, BarsChart } from '@/components/SurveyCharts';

export default function SurveyStatsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [sheetUrl, setSheetUrl] = useState('');

  useEffect(() => {
    fetch(`/api/admin/surveys/${id}/stats`)
      .then((r) => r.json())
      .then(setData);
    fetch('/api/admin/sheet-link')
      .then((r) => r.json())
      .then((d) => setSheetUrl(d.url || ''));
  }, [id]);

  if (!data) return <p className="text-gray-400">불러오는 중...</p>;
  if (data.error) return <p className="text-red-500">{data.error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">{data.survey.title} — 통계</h1>
          <p className="text-gray-500 text-sm mt-1">총 응답 수: {data.totalResponses}건</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/admin/surveys/${id}/export`} className="btn-secondary">
            CSV 다운로드
          </a>
          {sheetUrl && (
            <a href={sheetUrl} target="_blank" rel="noreferrer" className="btn-secondary">
              구글시트에서 보기
            </a>
          )}
          <Link href={`/admin/surveys/${id}`} className="btn-secondary">
            ← 편집으로
          </Link>
        </div>
      </div>

      {data.totalResponses === 0 && (
        <p className="text-gray-400 card">아직 응답이 없습니다. QR코드를 배포해 보세요.</p>
      )}

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {data.questionStats.map((q, qi) => (
          <div key={q.id} className={`card ${q.kind === 'text' || q.kind === 'bars' ? 'md:col-span-2' : ''}`}>
            <p className="font-semibold leading-snug">
              <span className="text-brand-600 mr-1">{qi + 1}.</span>
              {q.text}
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              답변 {q.answered} · 미답변 {q.unanswered}
              {q.kind === 'bars' && q.selections !== undefined && ` · 선택 ${q.selections}개 (비율은 선택 수 기준)`}
            </p>

            {q.kind === 'text' && (
              <div className="max-h-64 overflow-y-auto space-y-2 text-sm">
                {q.answers.length === 0 && <p className="text-gray-400">응답 없음</p>}
                {q.answers.map((a, i) => (
                  <p key={i} className="border-b border-gray-100 pb-2 whitespace-pre-wrap">
                    {a}
                  </p>
                ))}
              </div>
            )}

            {q.kind === 'scale' && <ScaleChart q={q} />}
            {q.kind === 'category' && <CategoryChart q={q} />}
            {q.kind === 'bars' && <BarsChart q={q} />}

            {q.otherTexts?.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 mb-1.5">기타 직접입력</p>
                <ul className="space-y-1 text-sm text-gray-600 max-h-40 overflow-y-auto">
                  {q.otherTexts.map((t, i) => (
                    <li key={i} className="border-b border-gray-50 pb-1">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
