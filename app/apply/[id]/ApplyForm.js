'use client';

import { useState } from 'react';
import { cloneDefaultApplyTemplate } from '@/lib/defaultApply';

function Field({ question, value, onChange }) {
  const required = question.required ? ' *' : '';
  if (question.type === 'single') {
    return (
      <div>
        <label className="block font-semibold mb-2">{question.text}{required}</label>
        <div className="grid grid-cols-2 gap-2">
          {(question.options || []).map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => onChange(opt)}
              className={`choice-btn text-center ${value === opt ? 'selected' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (question.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 font-semibold cursor-pointer border-2 border-gray-200 rounded-2xl p-4">
        <input type="checkbox" checked={value === '동의합니다'} onChange={(e) => onChange(e.target.checked ? '동의합니다' : '')} className="w-5 h-5" />
        {question.text}{required}
      </label>
    );
  }
  return (
    <div>
      <label className="block font-semibold mb-2">{question.text}{required}</label>
      <input className="input-base" value={value || ''} onChange={(e) => onChange(e.target.value)} required={question.required} />
    </div>
  );
}

export default function ApplyForm({ eventId, questions }) {
  const applyQuestions = questions?.length ? questions : cloneDefaultApplyTemplate().questions;
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await fetch(`/api/apply/${eventId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    setSubmitting(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || '제출에 실패했습니다.');
      return;
    }
    setResult(data);
  }

  if (result) {
    return (
      <div className="card text-center space-y-4">
        <p className="text-2xl">신청 완료</p>
        <p className="font-bold text-lg">신청이 완료되었습니다.</p>
        <p className="text-gray-500 text-sm">참여해 주셔서 감사합니다.</p>
        {result.linkedSurveyId && (
          <a href={`/survey/${result.linkedSurveyId}`} className="btn-primary inline-block mt-2">
            만족도 설문에 참여하기
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-6">
      {applyQuestions.map((question) => (
        <Field
          key={question.id}
          question={question}
          value={answers[question.id]}
          onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
        />
      ))}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        className="btn-primary w-full text-lg"
        disabled={submitting || applyQuestions.some((q) => q.required && !answers[q.id])}
      >
        {submitting ? '제출 중...' : '제출하기'}
      </button>
    </form>
  );
}
