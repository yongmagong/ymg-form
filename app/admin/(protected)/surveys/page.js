'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import QuestionBuilder from '@/components/QuestionBuilder';
import { cloneDefaultSurveyTemplate } from '@/lib/defaultSurvey';

export default function SurveysPage() {
  const [surveys, setSurveys] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/surveys');
    const data = await res.json();
    setSurveys(data.surveys || []);
  }

  useEffect(() => {
    load();
  }, []);

  function loadTemplate() {
    const t = cloneDefaultSurveyTemplate();
    setTitle(t.title);
    setIntro(t.intro);
    setQuestions(t.questions);
  }

  async function createSurvey(e) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/admin/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        intro,
        questions: questions.map((q) => ({ ...q, options: (q.options || []).map((o) => o.trim()).filter(Boolean) })),
      }),
    });
    setSaving(false);
    setShowForm(false);
    setTitle('');
    setIntro('');
    setQuestions([]);
    load();
  }

  if (!surveys) return <p className="text-gray-400">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">만족도 설문조사</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? '닫기' : '+ 새 설문 만들기'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createSurvey} className="card space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold">설문 제목</label>
            <button type="button" onClick={loadTemplate} className="text-xs text-brand-600 hover:underline">
              기본 만족도 설문 템플릿 불러오기
            </button>
          </div>
          <input className="input-base" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <div>
            <label className="block text-sm font-semibold mb-1">설문 소개</label>
            <textarea className="input-base" rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">설문 항목</label>
            <QuestionBuilder questions={questions} setQuestions={setQuestions} />
          </div>

          <button type="submit" className="btn-primary" disabled={saving || questions.length === 0}>
            {saving ? '저장 중...' : '설문 만들기'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {surveys.length === 0 && <p className="text-gray-400">아직 만들어진 설문이 없습니다.</p>}
        {surveys.map((sv) => (
          <Link key={sv.id} href={`/admin/surveys/${sv.id}`} className="card flex items-center justify-between hover:shadow-md transition-shadow block">
            <div>
              <p className="font-semibold">{sv.title}</p>
              <p className="text-xs text-gray-400">질문 {sv.questions.length}개 · {new Date(sv.createdAt).toLocaleDateString('ko-KR')}</p>
            </div>
            <span className="text-brand-600 text-sm font-medium">자세히 →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
