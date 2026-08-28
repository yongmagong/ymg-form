'use client';

import { useState } from 'react';
import { cloneDefaultApplyTemplate } from '@/lib/defaultApply';

function initialAnswers(questions) {
  return questions.reduce((acc, question) => {
    const shouldCheck =
      question.defaultChecked || ['consentInfo', 'consentPhoto'].includes(question.id);
    if (question.type === 'checkbox' && shouldCheck) {
      acc[question.id] = '동의합니다';
    }
    return acc;
  }, {});
}

function Field({ question, value, onChange }) {
  const required = question.required ? ' *' : '';
  const selectedValues = Array.isArray(value) ? value : [];
  const isPhone = question.id === 'phone' || question.text.includes('연락처') || question.text.includes('전화');
  const isPicker = question.type === 'date' || question.type === 'time';

  function openPicker(e) {
    if (!isPicker) return;
    e.currentTarget.showPicker?.();
  }

  function Label() {
    return (
      <>
        <label className="block font-semibold mb-2">{question.text}{required}</label>
        {question.imageUrl && (
          <img src={question.imageUrl} alt="" className="mb-3 max-h-80 w-full rounded-lg border object-contain bg-gray-50" />
        )}
      </>
    );
  }

  function toggleMulti(option) {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((item) => item !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  }

  if (question.type === 'single') {
    return (
      <div>
        <Label />
        <div className="grid sm:grid-cols-2 gap-2">
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
  if (question.type === 'multi') {
    return (
      <div>
        <Label />
        <div className="space-y-2">
          {(question.options || []).map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-3 cursor-pointer border rounded-lg p-3 ${
                selectedValues.includes(opt) ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(opt)}
                onChange={() => toggleMulti(opt)}
                className="w-5 h-5"
              />
              <span className="font-medium">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }
  if (question.type === 'dropdown') {
    return (
      <div>
        <Label />
        <select className="input-base" value={value || ''} onChange={(e) => onChange(e.target.value)} required={question.required}>
          <option value="">선택하세요</option>
          {(question.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }
  if (question.type === 'checkbox') {
    return (
      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
        {question.imageUrl && (
          <img src={question.imageUrl} alt="" className="max-h-80 w-full rounded-lg border object-contain bg-gray-50" />
        )}
        <div className="space-y-2">
          <p className="font-semibold leading-relaxed text-base">{question.text}{required}</p>
          {question.description && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{question.description}</p>
          )}
        </div>
        <label className="flex items-center gap-2 font-semibold cursor-pointer">
          <input type="checkbox" checked={value === '동의합니다'} onChange={(e) => onChange(e.target.checked ? '동의합니다' : '')} className="w-5 h-5" />
          동의합니다.
        </label>
      </div>
    );
  }
  function formatPhone(rawValue) {
    const digits = rawValue.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return (
    <div>
      <Label />
      {question.type === 'textarea' ? (
        <textarea
          className="input-base min-h-28"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
        />
      ) : (
        <input
          className="input-base"
          type={isPicker ? question.type : isPhone ? 'tel' : 'text'}
          inputMode={isPhone ? 'numeric' : undefined}
          autoComplete={isPhone ? 'tel' : undefined}
          value={value || ''}
          onClick={openPicker}
          onFocus={openPicker}
          onChange={(e) => onChange(isPhone ? formatPhone(e.target.value) : e.target.value)}
          required={question.required}
        />
      )}
    </div>
  );
}

export default function ApplyForm({ eventId, questions, closed }) {
  const applyQuestions = questions?.length ? questions : cloneDefaultApplyTemplate().questions;
  const [answers, setAnswers] = useState(() => initialAnswers(applyQuestions));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (closed) {
    return (
      <div className="card text-center space-y-2">
        <p className="text-lg font-bold text-gray-600">모집이 종료되었습니다</p>
        <p className="text-gray-400 text-sm">다음 기회에 함께해 주세요.</p>
      </div>
    );
  }

  function isMissingAnswer(question) {
    const answer = answers[question.id];
    if (Array.isArray(answer)) return answer.length === 0;
    return !answer;
  }

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
        {(result.linkedSurveys || []).length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {result.linkedSurveys.map((sv) => (
              <a key={sv.id} href={`/survey/${sv.id}`} className="btn-primary inline-block">
                {sv.round ? `${sv.round} ` : ''}만족도 설문에 참여하기
              </a>
            ))}
          </div>
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
        disabled={submitting || applyQuestions.some((q) => q.required && isMissingAnswer(q))}
      >
        {submitting ? '제출 중...' : '제출하기'}
      </button>
    </form>
  );
}
