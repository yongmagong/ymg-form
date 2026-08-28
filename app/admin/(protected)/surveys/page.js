'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import QuestionBuilder from '@/components/QuestionBuilder';
import { cloneDefaultSurveyTemplate } from '@/lib/defaultSurvey';

export default function SurveysPage() {
  const [surveys, setSurveys] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [intro, setIntro] = useState('');
  const [round, setRound] = useState('');
  const [published, setPublished] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      const res = await fetch('/api/admin/surveys');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '설문 목록을 불러오지 못했습니다.');
      setSurveys(data.surveys || []);
      setCurrentUser(data.currentUser || null);
      setOwnerName((prev) => prev || data.currentUser?.displayName || '');
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
    setOwnerName((prev) => prev || currentUser?.displayName || '');
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
        ownerName,
        intro,
        round,
        published,
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
    setOwnerName(currentUser?.displayName || '');
    setIntro('');
    setRound('');
    setPublished(false);
    setQuestions([]);
    load();
  }

  if (!surveys) return <p className="text-gray-400">불러오는 중...</p>;

  async function copySurvey(id) {
    setError('');
    const res = await fetch('/api/admin/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ copyFromId: id, ownerName: currentUser?.displayName || ownerName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || '설문조사를 복사하지 못했습니다.');
      return;
    }
    load();
  }

  function toggleSelected(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]));
  }

  async function copySelected() {
    if (selectedIds.length === 0) return;
    setCopying(true);
    setError('');
    const res = await fetch('/api/admin/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ copyFromIds: selectedIds, ownerName: currentUser?.displayName || ownerName }),
    });
    const data = await res.json();
    setCopying(false);
    if (!res.ok) {
      setError(data.error || '설문조사를 복사하지 못했습니다.');
      return;
    }
    setSelectedIds([]);
    load();
  }

  const mySurveys = surveys.filter((sv) => sv.ownerEmail && currentUser?.email && sv.ownerEmail === currentUser.email);
  const otherSurveys = surveys.filter((sv) => !sv.ownerEmail || !currentUser?.email || sv.ownerEmail !== currentUser.email);

  function SurveyList({ items, showCopy }) {
    if (items.length === 0) return <p className="text-gray-400 text-sm">목록이 없습니다.</p>;
    return (
      <div className="space-y-3">
        {items.map((sv) => (
          <div key={sv.id} className="card flex items-center gap-3 hover:shadow-md transition-shadow">
            <input
              type="checkbox"
              checked={selectedIds.includes(sv.id)}
              onChange={() => toggleSelected(sv.id)}
              className="w-4 h-4 flex-shrink-0"
              aria-label="선택"
            />
            <Link href={`/admin/surveys/${sv.id}`} className="min-w-0 flex-1 block">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold truncate">{sv.title}</p>
                {sv.round && (
                  <span className="text-xs rounded-full bg-gray-100 text-gray-600 px-2 py-1">{sv.round}</span>
                )}
                <span className="text-xs rounded-full bg-brand-50 text-brand-700 px-2 py-1">
                  담당 {sv.ownerName || sv.createdByName || '미지정'}
                </span>
                <span className={`text-xs rounded-full px-2 py-1 ${sv.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {sv.published ? '공개' : '비공개'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">질문 {sv.questions.length}개 · {new Date(sv.createdAt).toLocaleDateString('ko-KR')}</p>
            </Link>
            {showCopy ? (
              <button type="button" onClick={() => copySurvey(sv.id)} className="btn-secondary text-xs whitespace-nowrap">
                내 것으로 복사
              </button>
            ) : (
              <span className="text-brand-600 text-sm font-medium whitespace-nowrap">자세히 →</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">만족도 설문조사</h1>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button className="btn-secondary" onClick={copySelected} disabled={copying}>
              {copying ? '복사 중...' : `선택한 ${selectedIds.length}개 복사`}
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? '닫기' : '+ 새 설문 만들기'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={createSurvey} className="card space-y-5">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold">설문 제목</label>
            <button type="button" onClick={loadTemplate} className="text-xs text-brand-600 hover:underline">
              기본 만족도 설문 템플릿 불러오기
            </button>
          </div>
          <input className="input-base" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold mb-1">담당자 이름</label>
              <input
                className="input-base"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="예: 홍길동"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">회차 (선택, 예: 1차)</label>
              <input className="input-base" value={round} onChange={(e) => setRound(e.target.value)} placeholder="한 행사에 여러 설문을 연결할 때 구분용" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">설문 소개</label>
            <textarea className="input-base min-h-28" rows={5} value={intro} onChange={(e) => setIntro(e.target.value)} />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            만족도설문조사 목록 페이지에 공개
          </label>

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

      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-gray-600">내 설문조사</h2>
          <SurveyList items={mySurveys} />
        </section>
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-gray-600">동료 설문조사</h2>
          <SurveyList items={otherSurveys} showCopy />
        </section>
      </div>
    </div>
  );
}
