'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState([{ label: '소개', content: '' }]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/events');
    const data = await res.json();
    setEvents(data.events || []);
  }

  useEffect(() => {
    load();
  }, []);

  function updateSection(i, field, value) {
    setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  function addSection() {
    setSections((prev) => [...prev, { label: '', content: '' }]);
  }

  function removeSection(i) {
    setSections((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function createEvent(e) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, sections: sections.filter((s) => s.label || s.content) }),
    });
    setSaving(false);
    setShowForm(false);
    setTitle('');
    setSections([{ label: '소개', content: '' }]);
    load();
  }

  if (!events) return <p className="text-gray-400">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">참여신청서</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? '닫기' : '+ 새 신청서 만들기'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createEvent} className="card space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">제목</label>
            <input
              className="input-base"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2026 주민자치 조력가양성교육"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              안내 내용 (소개, 일정, 대상, 문의, 교육과정 등 자유롭게 추가)
            </label>
            <div className="space-y-3">
              {sections.map((s, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    className="input-base w-32 flex-shrink-0"
                    placeholder="항목명 (예: 일정)"
                    value={s.label}
                    onChange={(e) => updateSection(i, 'label', e.target.value)}
                  />
                  <textarea
                    className="input-base flex-1"
                    rows={2}
                    placeholder="내용"
                    value={s.content}
                    onChange={(e) => updateSection(i, 'content', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeSection(i)}
                    className="text-gray-400 hover:text-red-600 px-2 py-3"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addSection} className="btn-secondary mt-3 text-sm">
              + 항목 추가
            </button>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? '저장 중...' : '신청서 만들기'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {events.length === 0 && <p className="text-gray-400">아직 만들어진 신청서가 없습니다.</p>}
        {events.map((ev) => (
          <Link key={ev.id} href={`/admin/events/${ev.id}`} className="card flex items-center justify-between hover:shadow-md transition-shadow block">
            <div>
              <p className="font-semibold">{ev.title}</p>
              <p className="text-xs text-gray-400">{new Date(ev.createdAt).toLocaleDateString('ko-KR')}</p>
            </div>
            <span className="text-brand-600 text-sm font-medium">자세히 →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
