'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QuestionBuilder from '@/components/QuestionBuilder';

export default function SurveyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [survey, setSurvey] = useState(null);
  const [title, setTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    setPublicUrl(`${window.location.origin}/survey/${id}`);
  }, [id]);

  async function load() {
    const res = await fetch(`/api/admin/surveys/${id}`);
    const data = await res.json();
    setSurvey(data.survey);
    setTitle(data.survey.title);
    setIntro(data.survey.intro);
    setQuestions(data.survey.questions);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/surveys/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        intro,
        questions: questions.map((q) => ({ ...q, options: (q.options || []).map((o) => o.trim()).filter(Boolean) })),
      }),
    });
    setSaving(false);
    load();
  }

  async function remove() {
    if (!confirm('이 설문을 삭제하시겠습니까? 이미 수집된 응답 시트는 삭제되지 않습니다.')) return;
    await fetch(`/api/admin/surveys/${id}`, { method: 'DELETE' });
    router.push('/admin/surveys');
  }

  if (!survey) return <p className="text-gray-400">불러오는 중...</p>;

  const qrSrc = publicUrl ? `/api/qrcode?url=${encodeURIComponent(publicUrl)}` : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">설문 편집</h1>
        <Link href={`/admin/surveys/${id}/stats`} className="btn-secondary">
          📊 통계 보기
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">설문 제목</label>
            <input className="input-base" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">설문 소개</label>
            <textarea className="input-base" rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">설문 항목</label>
            <QuestionBuilder questions={questions} setQuestions={setQuestions} />
          </div>
          <div className="flex gap-3">
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
            <button className="text-red-500 text-sm hover:underline ml-auto" onClick={remove}>
              설문 삭제
            </button>
          </div>
        </div>

        <div className="card space-y-3 text-center">
          <p className="font-semibold text-sm">배포용 QR코드</p>
          {qrSrc && <img src={qrSrc} alt="QR" className="w-full rounded-xl border" />}
          <a href={qrSrc} download={`${title}_설문_QR.png`} className="btn-primary block">
            QR 다운로드
          </a>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-600 break-all block">
            {publicUrl}
          </a>
        </div>
      </div>
    </div>
  );
}
