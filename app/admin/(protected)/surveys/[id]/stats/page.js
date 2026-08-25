'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SurveyStatsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/surveys/${id}/stats`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  if (!data) return <p className="text-gray-400">불러오는 중...</p>;
  if (data.error) return <p className="text-red-500">{data.error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{data.survey.title} — 통계</h1>
          <p className="text-gray-500 text-sm mt-1">총 응답 수: {data.totalResponses}건</p>
        </div>
        <Link href={`/admin/surveys/${id}`} className="btn-secondary">
          ← 편집으로
        </Link>
      </div>

      {data.totalResponses === 0 && (
        <p className="text-gray-400 card">아직 응답이 없습니다. QR코드를 배포해 보세요.</p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {data.questionStats.map((q) => (
          <div key={q.id} className="card">
            <p className="font-semibold mb-3">{q.text}</p>

            {q.type === 'text' ? (
              <div className="max-h-64 overflow-y-auto space-y-2 text-sm">
                {q.answers.length === 0 && <p className="text-gray-400">응답 없음</p>}
                {q.answers.map((a, i) => (
                  <p key={i} className="border-b border-gray-100 pb-2">
                    {a}
                  </p>
                ))}
              </div>
            ) : (
              <>
                {q.type === 'scale5' && q.average !== null && (
                  <p className="text-sm text-brand-700 font-bold mb-2">평균 {q.average.toFixed(2)}점 / 5점</p>
                )}
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={q.chartData} margin={{ top: 8, right: 16, left: -16, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1f9d55" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
