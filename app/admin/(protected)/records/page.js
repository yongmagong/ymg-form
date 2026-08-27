'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MAX_INLINE_IMAGE_CHARS } from '@/lib/imageData';
import AttachmentUploader from '@/components/AttachmentUploader';

export default function RecordsPage() {
  const [records, setRecords] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [linkedEventId, setLinkedEventId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sections, setSections] = useState([{ label: '후기', content: '' }]);
  const [attachments, setAttachments] = useState([]);
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      const [rRes, eRes] = await Promise.all([fetch('/api/admin/records'), fetch('/api/admin/events')]);
      const rData = await rRes.json();
      const eData = await eRes.json();
      if (!rRes.ok) throw new Error(rData.error || '기록 목록을 불러오지 못했습니다.');
      setRecords(rData.records || []);
      setEvents(eData.events || []);
      setCurrentUser(rData.currentUser || null);
      setOwnerName((prev) => prev || rData.currentUser?.displayName || '');
    } catch (err) {
      setRecords([]);
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
    reader.onload = () => {
      if (String(reader.result || '').length > MAX_INLINE_IMAGE_CHARS) {
        setError('이미지 파일 용량이 큽니다. 대표 이미지는 파일 대신 공개 이미지 링크를 넣어 주세요.');
        return;
      }
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function createRecord(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/admin/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        ownerName,
        linkedEventId,
        imageUrl,
        sections: sections.filter((s) => s.label || s.content),
        attachments,
        published,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || '기록을 만들지 못했습니다.');
      return;
    }
    setShowForm(false);
    setTitle('');
    setLinkedEventId('');
    setImageUrl('');
    setSections([{ label: '후기', content: '' }]);
    setAttachments([]);
    setPublished(true);
    load();
  }

  if (!records) return <p className="text-gray-400">불러오는 중...</p>;

  async function copyRecord(id) {
    setError('');
    const res = await fetch('/api/admin/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ copyFromId: id, ownerName: currentUser?.displayName || ownerName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || '기록을 복사하지 못했습니다.');
      return;
    }
    load();
  }

  const myRecords = records.filter((r) => r.ownerEmail && currentUser?.email && r.ownerEmail === currentUser.email);
  const otherRecords = records.filter((r) => !r.ownerEmail || !currentUser?.email || r.ownerEmail !== currentUser.email);

  function RecordList({ items, showCopy }) {
    if (items.length === 0) return <p className="text-gray-400 text-sm">목록이 없습니다.</p>;
    return (
      <div className="space-y-3">
        {items.map((r) => (
          <div key={r.id} className="card flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
            <Link href={`/admin/records/${r.id}`} className="min-w-0 flex-1 block">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold truncate">{r.title}</p>
                <span className={`text-xs rounded-full px-2 py-1 ${r.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {r.published ? '공개' : '비공개'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString('ko-KR')}</p>
            </Link>
            {showCopy ? (
              <button type="button" onClick={() => copyRecord(r.id)} className="btn-secondary text-xs whitespace-nowrap">
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
        <h1 className="text-xl font-bold">기록함</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? '닫기' : '+ 새 기록 만들기'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createRecord} className="card space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1">제목</label>
            <input className="input-base" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 마을활동가 역량강화교육 후기" required />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">담당자 이름</label>
            <input className="input-base max-w-sm" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="예: 홍길동" required />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">연결된 행사 (선택)</label>
            <select className="input-base" value={linkedEventId} onChange={(e) => setLinkedEventId(e.target.value)}>
              <option value="">연결 안 함</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">대표 이미지</label>
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_14rem]">
              <input className="input-base" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://... 이미지 주소를 붙여넣으세요" />
              <input type="file" accept="image/*" className="input-base text-sm" onChange={(e) => readImageFile(e.target.files?.[0])} />
            </div>
            {imageUrl && <img src={imageUrl} alt="대표 이미지 미리보기" className="mt-3 max-h-72 w-full rounded-lg border object-contain bg-gray-50" />}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">내용 (교육자료, 후기 등 자유롭게 추가)</label>
            <div className="space-y-3">
              {sections.map((s, i) => (
                <div key={i} className="grid gap-2 md:grid-cols-[9rem_minmax(0,1fr)_3.5rem] items-start">
                  <input className="input-base text-sm" placeholder="항목명 (예: 후기)" value={s.label} onChange={(e) => updateSection(i, 'label', e.target.value)} />
                  <textarea className="input-base min-h-24" rows={4} placeholder="내용" value={s.content} onChange={(e) => updateSection(i, 'content', e.target.value)} />
                  <button type="button" onClick={() => removeSection(i)} className="px-2 py-2 text-sm text-gray-400 hover:text-red-600">
                    삭제
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addSection} className="btn-secondary mt-3 text-sm">
              + 항목 추가
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">첨부파일 (PDF, HTML)</label>
            <AttachmentUploader attachments={attachments} setAttachments={setAttachments} />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            홈페이지에 공개
          </label>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? '저장 중...' : '기록 만들기'}
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
          <h2 className="text-sm font-bold text-gray-600">내 기록</h2>
          <RecordList items={myRecords} />
        </section>
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-gray-600">동료 기록</h2>
          <RecordList items={otherRecords} showCopy />
        </section>
      </div>
    </div>
  );
}
