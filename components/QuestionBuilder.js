'use client';

const TYPE_LABELS = {
  single: '단일 선택',
  multi: '복수 선택',
  scale5: '5점 척도',
  text: '주관식',
  checkbox: '체크박스',
};

function newQuestion(type = 'single') {
  return {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text: '',
    type,
    options: ['single', 'multi'].includes(type) ? ['옵션 1', '옵션 2'] : [],
    lowLabel: '매우 불만족',
    highLabel: '아주 만족',
    required: true,
  };
}

export default function QuestionBuilder({ questions, setQuestions }) {
  function update(i, patch) {
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function remove(i) {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
  }
  function move(i, dir) {
    setQuestions((prev) => {
      const arr = [...prev];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  }
  function add() {
    setQuestions((prev) => [...prev, newQuestion()]);
  }

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={q.id} className="border-2 border-gray-100 rounded-2xl p-4 space-y-3">
          <div className="flex gap-2 items-center">
            <span className="text-gray-400 text-sm w-6">{i + 1}.</span>
            <input
              className="input-base flex-1"
              placeholder="질문 내용을 입력하세요"
              value={q.text}
              onChange={(e) => update(i, { text: e.target.value })}
            />
            <select
              className="input-base w-32 flex-shrink-0"
              value={q.type}
              onChange={(e) => {
                const type = e.target.value;
                update(i, {
                  type,
                  options: ['single', 'multi'].includes(type) ? q.options?.length ? q.options : ['옵션 1', '옵션 2'] : [],
                });
              }}
            >
              {Object.entries(TYPE_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {['single', 'multi'].includes(q.type) && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">선택지 (한 줄에 하나씩)</label>
              <textarea
                className="input-base"
                rows={Math.max(2, (q.options || []).length)}
                value={(q.options || []).join('\n')}
                onChange={(e) => update(i, { options: e.target.value.split('\n') })}
              />
            </div>
          )}

          {q.type === 'scale5' && (
            <div className="flex gap-3">
              <input
                className="input-base"
                placeholder="1점 라벨 (예: 매우 불만족)"
                value={q.lowLabel || ''}
                onChange={(e) => update(i, { lowLabel: e.target.value })}
              />
              <input
                className="input-base"
                placeholder="5점 라벨 (예: 아주 만족)"
                value={q.highLabel || ''}
                onChange={(e) => update(i, { highLabel: e.target.value })}
              />
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-500">
              <input
                type="checkbox"
                checked={q.required}
                onChange={(e) => update(i, { required: e.target.checked })}
              />
              필수 응답
            </label>
            <div className="flex gap-3 text-gray-400">
              <button type="button" onClick={() => move(i, -1)} className="hover:text-gray-700">
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} className="hover:text-gray-700">
                ↓
              </button>
              <button type="button" onClick={() => remove(i)} className="hover:text-red-600">
                삭제
              </button>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="btn-secondary text-sm">
        + 질문 추가
      </button>
    </div>
  );
}
