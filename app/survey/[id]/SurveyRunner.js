'use client';

import { useMemo, useState } from 'react';
import { isOtherOption, formatOtherAnswer, extractOtherText } from '@/lib/otherOption';

function initialAnswers(questions) {
  return questions.reduce((acc, question) => {
    if (question.type === 'checkbox' && question.defaultChecked) {
      acc[question.id] = '동의합니다';
    }
    return acc;
  }, {});
}

// 'section' entries are explanation blocks, not real questions — group each
// run of them with the question that follows so they render on the same
// screen (and don't count toward the step progress).
function buildSteps(questions) {
  const steps = [];
  let pendingSections = [];
  for (const question of questions) {
    if (question.type === 'section') {
      pendingSections.push(question);
    } else {
      steps.push({ question, sections: pendingSections });
      pendingSections = [];
    }
  }
  if (pendingSections.length) {
    steps.push({ question: null, sections: pendingSections });
  }
  return steps;
}

function SectionIntro({ sections }) {
  if (!sections.length) return null;
  return (
    <div className="space-y-3 pb-4 border-b border-gray-100">
      {sections.map((s) => (
        <div key={s.id}>
          <h2 className="text-xl font-bold">{s.text}</h2>
          {s.description && <p className="whitespace-pre-wrap text-sm text-gray-600 mt-1">{s.description}</p>}
          {s.imageUrl && (
            <img src={s.imageUrl} alt="" className="mt-2 max-h-80 w-full rounded-lg border object-contain bg-gray-50" />
          )}
        </div>
      ))}
    </div>
  );
}

function ScaleButtons({ lowLabel, highLabel, value, onPick }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {[5, 4, 3, 2, 1].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPick(String(n))}
            className={`scale-btn ${value === String(n) ? 'selected' : ''}`}
          >
            <span className="text-2xl">{n}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 px-1">
        <span>{highLabel || '아주 만족'}</span>
        <span>{lowLabel || '매우 불만족'}</span>
      </div>
    </div>
  );
}

function SingleButtons({ options, value, onPick }) {
  const [otherText, setOtherText] = useState(() => extractOtherText(value));
  const [otherActive, setOtherActive] = useState(() => isOtherOption(value));

  function handlePick(opt) {
    if (isOtherOption(opt)) {
      setOtherActive(true);
      setOtherText(extractOtherText(value));
      return;
    }
    setOtherActive(false);
    onPick(opt);
  }

  function confirmOther() {
    onPick(formatOtherAnswer(otherText));
  }

  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const other = isOtherOption(opt);
        const selected = other ? otherActive : value === opt;
        return (
          <div key={opt}>
            <button
              type="button"
              onClick={() => handlePick(opt)}
              className={`choice-btn ${selected ? 'selected' : ''}`}
            >
              {other ? '기타' : opt}
            </button>
            {other && selected && (
              <div className="flex gap-2 mt-2">
                <input
                  className="input-base"
                  placeholder="직접 입력"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={confirmOther}
                  className="btn-primary px-4 flex-shrink-0"
                  disabled={!otherText.trim()}
                >
                  확인
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MultiButtons({ options, value, onChange, maxSelect }) {
  const selectedValues = Array.isArray(value) ? value : [];
  const [otherText, setOtherText] = useState(() => extractOtherText(selectedValues.find(isOtherOption)));
  const atMax = maxSelect > 0 && selectedValues.length >= maxSelect;

  function isChecked(opt) {
    return isOtherOption(opt) ? selectedValues.some(isOtherOption) : selectedValues.includes(opt);
  }

  function toggle(opt) {
    if (isOtherOption(opt)) {
      if (isChecked(opt)) {
        onChange(selectedValues.filter((v) => !isOtherOption(v)));
      } else if (!atMax) {
        onChange([...selectedValues, formatOtherAnswer(otherText)]);
      }
      return;
    }
    if (selectedValues.includes(opt)) {
      onChange(selectedValues.filter((item) => item !== opt));
    } else if (!atMax) {
      onChange([...selectedValues, opt]);
    }
  }

  function updateOtherText(text) {
    setOtherText(text);
    if (selectedValues.some(isOtherOption)) {
      onChange([...selectedValues.filter((v) => !isOtherOption(v)), formatOtherAnswer(text)]);
    }
  }

  return (
    <div className="space-y-3">
      {maxSelect > 0 && (
        <p className="text-xs text-gray-400">
          최대 {maxSelect}개까지 선택할 수 있어요 ({selectedValues.length}/{maxSelect})
        </p>
      )}
      {options.map((opt) => {
        const other = isOtherOption(opt);
        const checked = isChecked(opt);
        const disabled = !checked && atMax;
        return (
          <div key={opt}>
            <label
              className={`flex items-center gap-3 border rounded-lg p-3 ${
                checked ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(opt)}
                className="w-5 h-5"
              />
              <span className="font-medium">{other ? '기타' : opt}</span>
            </label>
            {other && checked && (
              <input
                className="input-base mt-2"
                placeholder="직접 입력"
                value={otherText}
                onChange={(e) => updateOtherText(e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SurveyRunner({ survey }) {
  const steps = useMemo(() => buildSteps(survey.questions), [survey.questions]);
  const [step, setStep] = useState(0); // 0 = intro, 1..N = steps, N+1 = done
  const [answers, setAnswers] = useState(() => initialAnswers(survey.questions));
  const [textDraft, setTextDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = steps.length;
  const currentStep = step >= 1 && step <= total ? steps[step - 1] : null;
  const q = currentStep?.question || null;

  function goNext() {
    if (step === total) {
      submitAll();
    } else {
      setStep((s) => s + 1);
      setTextDraft('');
    }
  }

  function goBack() {
    if (step > 0) {
      setStep((s) => s - 1);
      setTextDraft('');
    }
  }

  function pickChoice(value) {
    const updated = { ...answers, [q.id]: value };
    setAnswers(updated);
    setTimeout(() => {
      if (step === total) {
        submitAll(updated);
      } else {
        setStep((s) => s + 1);
      }
    }, 220);
  }

  function confirmText() {
    const updated = { ...answers, [q.id]: textDraft };
    setAnswers(updated);
    if (step === total) {
      submitAll(updated);
    } else {
      setStep((s) => s + 1);
      setTextDraft('');
    }
  }

  function confirmValue() {
    if (step === total) {
      submitAll(answers);
    } else {
      setStep((s) => s + 1);
    }
  }

  function confirmMulti() {
    if (step === total) {
      submitAll(answers);
    } else {
      setStep((s) => s + 1);
    }
  }

  async function submitAll(finalAnswers) {
    setSubmitting(true);
    setError('');
    const res = await fetch(`/api/survey/${survey.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: finalAnswers || answers }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || '제출에 실패했습니다.');
      return;
    }
    setStep(total + 1);
  }

  if (step === 0) {
    return (
      <div className="card text-center space-y-4">
        <h1 className="text-xl font-bold">{survey.title}</h1>
        <p className="text-gray-500 whitespace-pre-wrap text-sm">{survey.intro}</p>
        <button className="btn-primary w-full text-lg" onClick={() => setStep(1)}>
          시작하기
        </button>
      </div>
    );
  }

  if (step === total + 1) {
    return (
      <div className="card text-center space-y-3">
        <p className="text-2xl">🙏</p>
        <p className="font-bold text-lg">응답이 제출되었습니다.</p>
        <p className="text-gray-500 text-sm">소중한 의견 감사합니다.</p>
      </div>
    );
  }

  return (
    <div className="card space-y-6">
      <div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-brand-500 transition-all duration-300"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">
          {step} / {total}
        </p>
      </div>

      <SectionIntro sections={currentStep.sections} />

      {q ? (
        <>
          <div className="space-y-3">
            <h2 className="text-lg font-bold leading-snug">{q.text}</h2>
            {q.imageUrl && (
              <img src={q.imageUrl} alt="" className="max-h-80 w-full rounded-lg border object-contain bg-gray-50" />
            )}
          </div>

          {q.type === 'single' && <SingleButtons key={q.id} options={q.options} value={answers[q.id]} onPick={pickChoice} />}
          {q.type === 'multi' && (
            <div className="space-y-3">
              <MultiButtons
                key={q.id}
                options={q.options || []}
                value={answers[q.id]}
                maxSelect={q.maxSelect || 0}
                onChange={(value) => setAnswers((prev) => ({ ...prev, [q.id]: value }))}
              />
              <button
                className="btn-primary w-full"
                onClick={confirmMulti}
                disabled={submitting || (q.required && !(answers[q.id] || []).length)}
              >
                {step === total ? (submitting ? '제출 중...' : '제출하기') : '다음'}
              </button>
            </div>
          )}
          {q.type === 'dropdown' && (
            <div className="space-y-3">
              <select
                className="input-base"
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              >
                <option value="">선택하세요</option>
                {(q.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <button
                className="btn-primary w-full"
                onClick={confirmValue}
                disabled={submitting || (q.required && !answers[q.id])}
              >
                {step === total ? (submitting ? '제출 중...' : '제출하기') : '다음'}
              </button>
            </div>
          )}
          {q.type === 'checkbox' && (
            <div className="space-y-4">
              {q.description && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{q.description}</p>
              )}
              <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 font-semibold">
                <input
                  type="checkbox"
                  checked={answers[q.id] === '동의합니다'}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.checked ? '동의합니다' : '' }))}
                  className="w-5 h-5"
                />
                동의합니다.
              </label>
              <button
                className="btn-primary w-full"
                onClick={confirmValue}
                disabled={submitting || (q.required && !answers[q.id])}
              >
                {step === total ? (submitting ? '제출 중...' : '제출하기') : '다음'}
              </button>
            </div>
          )}
          {q.type === 'scale5' && (
            <ScaleButtons lowLabel={q.lowLabel} highLabel={q.highLabel} value={answers[q.id]} onPick={pickChoice} />
          )}
          {(q.type === 'text' || q.type === 'textarea') && (
            <div className="space-y-3">
              {q.type === 'textarea' ? (
                <textarea
                  className="input-base min-h-28"
                  rows={4}
                  value={textDraft}
                  onChange={(e) => setTextDraft(e.target.value)}
                  placeholder={q.required ? '' : '(선택 사항)'}
                />
              ) : (
                <input
                  className="input-base"
                  value={textDraft}
                  onChange={(e) => setTextDraft(e.target.value)}
                  placeholder={q.required ? '' : '(선택 사항)'}
                />
              )}
              <button
                className="btn-primary w-full"
                onClick={confirmText}
                disabled={submitting || (q.required && !textDraft.trim())}
              >
                {step === total ? (submitting ? '제출 중...' : '제출하기') : '다음'}
              </button>
            </div>
          )}
          {(q.type === 'date' || q.type === 'time') && (
            <div className="space-y-3">
              <input
                className="input-base"
                type={q.type}
                value={answers[q.id] || ''}
                onClick={(e) => e.currentTarget.showPicker?.()}
                onFocus={(e) => e.currentTarget.showPicker?.()}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              />
              <button
                className="btn-primary w-full"
                onClick={confirmValue}
                disabled={submitting || (q.required && !answers[q.id])}
              >
                {step === total ? (submitting ? '제출 중...' : '제출하기') : '다음'}
              </button>
            </div>
          )}
        </>
      ) : (
        <button className="btn-primary w-full text-lg" onClick={goNext} disabled={submitting}>
          {step === total ? (submitting ? '제출 중...' : '제출하기') : '다음'}
        </button>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {step > 1 && (
        <button onClick={goBack} className="text-gray-400 text-sm hover:text-gray-700">
          ← 이전 질문
        </button>
      )}
    </div>
  );
}
