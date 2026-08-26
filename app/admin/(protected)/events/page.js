'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sections, setSections] = useState([{ label: '소개', content: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      const res = await fetch('/api/admin/events');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '신청서 목록을 불러오지 못했습니다.');
      setEvents(data.events || []);
      setCurrentUser(data.currentUser || null);
      setOwnerName((prev) => prev || data.currentUser?.displayName || '');
    } catch (err) {
      setEvents([]);
      setError(err.message);
    }
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

  function readImageFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result);
    reader.readAsDataURL(file);
  }

  async function createEvent(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, ownerName, imageUrl, sections: sections.filter((s) => s.label || s.content) }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || '신청서를 만들지 못했습니다.');
      return;
    }
    setShowForm(false);
    setTitle('');
    setOwnerName(currentUser?.displayName || '');
    setImageUrl('');
    setSections([{ label: '소개', content: '' }]);
    load();
  }

  if (!events) return <p className="text-gray-400">불러오는 중...</p>;

  async function copyEvent(id) {
    setError('');
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ copyFromId: id, ownerName: currentUser?.displayName || ownerName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || '신청서를 복사하지 못했습니다.');
      return;
    }
    load();
  }

  const myEvents = events.filter((ev) => ev.ownerEmail && currentUser?.email && ev.ownerEmail === currentUser.email);
  const otherEvents = events.filter((ev) => !ev.ownerEmail || !currentUser?.email || ev.ownerEmail !== currentUser.email);

  function EventList({ items, showCopy }) {
    if (items.length === 0) return <p className="text-gray-400 text-sm">목록이 없습니다.</p>;
    return (
      <div className="space-y-3">
        {items.map((ev) => (
          <div key={ev.id} className="card flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
            <Link href={`/admin/events/${ev.id}`} className="min-w-0 flex-1 block">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold truncate">{ev.title}</p>
                <span className="text-xs rounded-full bg-brand-50 text-brand-700 px-2 py-1">
                  담당 {ev.ownerName || ev.createdByName || '미지정'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{new Date(ev.createdAt).toLocaleDateString('ko-KR')}</p>
            </Link>
            {showCopy ? (
              <button type="button" onClick={() => copyEvent(ev.id)} className="btn-secondary text-xs whitespace-nowrap">
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
        <h1 className="text-xl font-bold">참여신청서</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? '닫기' : '+ 새 신청서 만들기'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createEvent} className="card space-y-5">
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
            <label className="block text-sm font-semibold mb-1">담당자 이름</label>
            <input
              className="input-base max-w-sm"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="예: 홍길동"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">포스터/대표 이미지</label>
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_14rem]">
              <input
                className="input-base"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... 이미지 주소를 붙여넣으세요"
              />
              <input
                type="file"
                accept="image/*"
                className="input-base text-sm"
                onChange={(e) => readImageFile(e.target.files?.[0])}
              />
            </div>
            {imageUrl && (
              <img src={imageUrl} alt="포스터 미리보기" className="mt-3 max-h-72 w-full rounded-lg border object-contain bg-gray-50" />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              안내 내용 (소개, 일정, 대상, 문의, 교육과정 등 자유롭게 추가)
            </label>
            <div className="space-y-3">
              {sections.map((s, i) => (
                <div key={i} className="grid gap-2 md:grid-cols-[9rem_minmax(0,1fr)_3.5rem] items-start">
                  <input
                    className="input-base text-sm"
                    placeholder="항목명 (예: 일정)"
                    value={s.label}
                    onChange={(e) => updateSection(i, 'label', e.target.value)}
                  />
                  <textarea
                    className="input-base min-h-24"
                    rows={4}
                    placeholder="내용"
                    value={s.content}
                    onChange={(e) => updateSection(i, 'content', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeSection(i)}
                    className="px-2 py-2 text-sm text-gray-400 hover:text-red-600"
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

      {error && (
        <div className="card border-red-100 bg-red-50 text-red-700 text-sm leading-relaxed">
          <p className="font-bold mb-1">불러오지 못했습니다.</p>
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-gray-600">내 신청서</h2>
          <EventList items={myEvents} />
        </section>
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-gray-600">동료 신청서</h2>
          <EventList items={otherEvents} showCopy />
        </section>
      </div>
    </div>
  );
}
