'use client';

import { useEffect } from 'react';
import { MAX_INLINE_IMAGE_CHARS } from '@/lib/imageData';

const TYPE_LABELS = {
  text: '단답형',
  textarea: '장문형',
  single: '단일 선택',
  multi: '복수 선택',
  dropdown: '드롭다운',
  checkbox: '체크박스',
  scale5: '5점 척도',
  date: '날짜',
  time: '시간',
};

const OPTION_TYPES = ['single', 'multi', 'dropdown'];

function newQuestion(type = 'single') {
  return {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text: '',
    type,
    options: OPTION_TYPES.includes(type) ? ['옵션 1', '옵션 2'] : [],
    imageUrl: '',
    hasImage: false,
    description: '',
    defaultChecked: false,
    lowLabel: '매우 불만족',
    highLabel: '아주 만족',
    required: true,
  };
}

function cloneQuestion(question) {
  return {
    ...JSON.parse(JSON.stringify(question)),
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text: question.text ? `${question.text} 복사본` : '',
  };
}

export default function QuestionBuilder({ questions, setQuestions }) {
  useEffect(() => {
    setQuestions((prev) => {
      let changed = false;
      const next = prev.map((q) => {
        if (q.type !== 'checkbox' || q.description !== undefined || !q.text?.includes('\n')) return q;
        const [title, ...body] = q.text.split('\n');
        changed = true;
        return {
          ...q,
          text: title.trim(),
          description: body.join('\n').trim(),
          defaultChecked: q.defaultChecked ?? true,
        };
      });
      return changed ? next : prev;
    });
  }, [setQuestions]);

  function readImageFile(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (String(reader.result || '').length > MAX_INLINE_IMAGE_CHARS) {
        alert('이미지 파일 용량이 큽니다. 큰 이미지는 파일 대신 공개 이미지 링크를 넣어 주세요.');
        return;
      }
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function update(i, patch) {
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function remove(i) {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
  }
  function duplicate(i) {
    setQuestions((prev) => {
      const arr = [...prev];
      arr.splice(i + 1, 0, cloneQuestion(prev[i]));
      return arr;
    });
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
  function moveTo(from, to) {
    setQuestions((prev) => {
      if (from === to) return prev;
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  }
  function add() {
    setQuestions((prev) => [...prev, newQuestion()]);
  }

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div
          key={q.id}
          draggable
          onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => moveTo(Number(e.dataTransfer.getData('text/plain')), i)}
          className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white"
        >
          <div className="grid gap-3 md:grid-cols-[2rem_minmax(0,1fr)_9rem] items-start">
            <span className="text-gray-400 text-sm pt-3 cursor-grab" title="끌어서 순서 변경">
              {i + 1}.
            </span>
            <input
              className="input-base"
              placeholder={q.type === 'checkbox' ? '체크박스 제목을 입력하세요' : '질문 내용을 입력하세요'}
              value={q.text}
              onChange={(e) => update(i, { text: e.target.value })}
            />
            <select
              className="input-base text-sm"
              value={q.type}
              onChange={(e) => {
                const type = e.target.value;
                update(i, {
                  type,
                  options: OPTION_TYPES.includes(type) ? q.options?.length ? q.options : ['옵션 1', '옵션 2'] : [],
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

          {q.type === 'checkbox' && (
            <div className="rounded-lg border border-brand-100 bg-brand-50 p-3 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-brand-700 mb-1">상세 안내문</label>
                <textarea
                  className="input-base bg-white min-h-32"
                  rows={6}
                  placeholder="개인정보 수집·이용 내용, 사진·영상 촬영 동의 내용 등을 여기에 길게 입력하세요."
                  value={q.description ?? ''}
                  onChange={(e) => update(i, { description: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <input
                  type="checkbox"
                  checked={!!q.defaultChecked}
                  onChange={(e) => update(i, { defaultChecked: e.target.checked })}
                />
                응답 화면에서 기본으로 동의 체크
              </label>
            </div>
          )}

          {OPTION_TYPES.includes(q.type) && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">선택지 (한 줄에 하나씩)</label>
              <textarea
                className="input-base"
                rows={Math.min(8, Math.max(3, (q.options || []).length))}
                value={(q.options || []).join('\n')}
                onChange={(e) => update(i, { options: e.target.value.split('\n') })}
              />
            </div>
          )}

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <input
                type="checkbox"
                checked={!!q.hasImage}
                onChange={(e) => update(i, { hasImage: e.target.checked, imageUrl: e.target.checked ? q.imageUrl || '' : '' })}
              />
              이 문항에 이미지 첨부
            </label>
            {q.hasImage && (
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_12rem] items-start">
                <input
                  className="input-base text-sm"
                  placeholder="이미지 링크 주소"
                  value={q.imageUrl || ''}
                  onChange={(e) => update(i, { imageUrl: e.target.value })}
                />
                <input
                  type="file"
                  accept="image/*"
                  className="input-base text-sm"
                  onChange={(e) => readImageFile(e.target.files?.[0], (imageUrl) => update(i, { imageUrl, hasImage: true }))}
                />
                {q.imageUrl && (
                  <img src={q.imageUrl} alt="문항 이미지 미리보기" className="md:col-span-2 max-h-56 w-full rounded-lg border object-contain bg-white" />
                )}
              </div>
            )}
          </div>

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

          {(q.type === 'date' || q.type === 'time') && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                응답 화면 미리보기
              </label>
              <input
                type={q.type}
                className="input-base bg-white max-w-xs"
                onClick={(e) => e.currentTarget.showPicker?.()}
                onFocus={(e) => e.currentTarget.showPicker?.()}
                aria-label={q.type === 'date' ? '날짜 선택 미리보기' : '시간 선택 미리보기'}
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-3 text-sm border-t border-gray-100 pt-3">
            <label className="flex items-center gap-2 text-gray-500">
              <input
                type="checkbox"
                checked={q.required}
                onChange={(e) => update(i, { required: e.target.checked })}
              />
              필수 응답
            </label>
            <div className="flex gap-2 text-gray-400">
              <button type="button" onClick={() => duplicate(i)} className="btn-secondary px-3 py-1.5 text-xs">
                복사
              </button>
              <button type="button" onClick={() => move(i, -1)} className="btn-secondary px-3 py-1.5 text-xs">
                위로
              </button>
              <button type="button" onClick={() => move(i, 1)} className="btn-secondary px-3 py-1.5 text-xs">
                아래로
              </button>
              <button type="button" onClick={() => remove(i)} className="px-3 py-1.5 text-xs text-red-500 hover:underline">
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
