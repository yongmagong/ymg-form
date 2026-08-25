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
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      const res = await fetch('/api/admin/surveys');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '설문 목록을 불러오지 못했습니다.');
      setSurveys(data.surveys || []);
    } catch (err) {
      setSurveys([]);
      setError(err.message);
    }
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
    setError('');
    const res = await fetch('/api/admin/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        intro,
        questions: questions.map((q) => ({ ...q, options: (q.options || []).map((o) => o.trim()).filter(Boolean) })),
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || '설문조사를 만들지 못했습니다.');
      return;
    }
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

      {error && (
        <div className="card border-red-100 bg-red-50 text-red-700 text-sm leading-relaxed">
          <p className="font-bold mb-1">불러오지 못했습니다.</p>
          <p>{error}</p>
        </div>
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
