'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState([]);
  const [linkedSurveyId, setLinkedSurveyId] = useState('');
  const [saving, setSaving] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    setPublicUrl(`${window.location.origin}/apply/${id}`);
  }, [id]);

  async function load() {
    const [evRes, svRes] = await Promise.all([
      fetch(`/api/admin/events/${id}`),
      fetch('/api/admin/surveys'),
    ]);
    const evData = await evRes.json();
    const svData = await svRes.json();
    setEvent(evData.event);
    setTitle(evData.event.title);
    setSections(evData.event.sections || []);
    setLinkedSurveyId(evData.event.linkedSurveyId || '');
    setSurveys(svData.surveys || []);
  }

  useEffect(() => {
    load();
  }, [id]);

  function updateSection(i, field, value) {
    setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }
  function addSection() {
    setSections((prev) => [...prev, { label: '', content: '' }]);
  }
  function removeSection(i) {
    setSections((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, sections, linkedSurveyId: linkedSurveyId || null }),
    });
    setSaving(false);
    load();
  }

  async function remove() {
    if (!confirm('이 신청서를 삭제하시겠습니까? 시트에 이미 기록된 응답은 삭제되지 않습니다.')) return;
    await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    router.push('/admin/events');
  }

  if (!event) return <p className="text-gray-400">불러오는 중...</p>;

  const qrSrc = publicUrl ? `/api/qrcode?url=${encodeURIComponent(publicUrl)}` : '';

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">신청서 편집</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">제목</label>
            <input className="input-base" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">안내 내용</label>
            <div className="space-y-3">
              {sections.map((s, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    className="input-base w-32 flex-shrink-0"
                    placeholder="항목명"
                    value={s.label}
                    onChange={(e) => updateSection(i, 'label', e.target.value)}
                  />
                  <textarea
                    className="input-base flex-1"
                    rows={2}
                    value={s.content}
                    onChange={(e) => updateSection(i, 'content', e.target.value)}
                  />
                  <button type="button" onClick={() => removeSection(i)} className="text-gray-400 hover:text-red-600 px-2 py-3">
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
            <label className="block text-sm font-semibold mb-1">연결할 만족도 설문조사</label>
            <select
              className="input-base"
              value={linkedSurveyId}
              onChange={(e) => setLinkedSurveyId(e.target.value)}
            >
              <option value="">연결 안 함</option>
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              신청 완료 후 참여자에게 설문 참여 버튼이 표시됩니다.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
            <button className="text-red-500 text-sm hover:underline ml-auto" onClick={remove}>
              신청서 삭제
            </button>
          </div>
        </div>

        <div className="card space-y-3 text-center">
          <p className="font-semibold text-sm">배포용 QR코드</p>
          {qrSrc && <img src={qrSrc} alt="QR" className="w-full rounded-xl border" />}
          <a href={qrSrc} download={`${title}_신청서_QR.png`} className="btn-primary block">
            QR 다운로드
          </a>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-600 break-all block">
            {publicUrl}
          </a>
        </div>
      </div>
    </div>
  );
}
