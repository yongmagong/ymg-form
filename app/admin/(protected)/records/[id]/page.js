'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { uploadImageFile } from '@/lib/uploadImage';
import AttachmentUploader from '@/components/AttachmentUploader';

export default function RecordDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState(null);
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [linkedEventId, setLinkedEventId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sections, setSections] = useState([]);
  const [images, setImages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    setPublicUrl(`${window.location.origin}/records/${id}`);
  }, [id]);

  async function load() {
    const [rRes, eRes] = await Promise.all([fetch(`/api/admin/records/${id}`), fetch('/api/admin/events')]);
    const rData = await rRes.json();
    const eData = await eRes.json();
    setRecord(rData.record);
    setTitle(rData.record.title);
    setOwnerName(rData.record.ownerName || rData.record.createdByName || '');
    setLinkedEventId(rData.record.linkedEventId || '');
    setImageUrl(rData.record.imageUrl || '');
    setSections(rData.record.sections || []);
    setImages(rData.record.images || []);
    setAttachments(rData.record.attachments || []);
    setPublished(!!rData.record.published);
    setEvents(eData.events || []);
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

  async function readImageFile(file, callback) {
    if (!file) return;
    try {
      callback(await uploadImageFile(file));
    } catch (err) {
      alert(err.message || '이미지 업로드에 실패했습니다.');
    }
  }

  function updateImage(i, value) {
    setImages((prev) => prev.map((url, idx) => (idx === i ? value : url)));
  }
  function addImage() {
    setImages((prev) => [...prev, '']);
  }
  function removeImage(i) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        ownerName,
        linkedEventId: linkedEventId || null,
        imageUrl,
        sections,
        images: images.filter(Boolean),
        attachments,
        published,
      }),
    });
    setSaving(false);
    load();
  }

  async function remove() {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return;
    await fetch(`/api/admin/records/${id}`, { method: 'DELETE' });
    router.push('/admin/records');
  }

  if (!record) return <p className="text-gray-400">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">기록 편집</h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="card space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1">제목</label>
            <input className="input-base" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">담당자 이름</label>
            <input className="input-base max-w-sm" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="예: 홍길동" />
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
              <input type="file" accept="image/*" className="input-base text-sm" onChange={(e) => readImageFile(e.target.files?.[0], setImageUrl)} />
            </div>
            {imageUrl && (
              <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img src={imageUrl} alt="대표 이미지 미리보기" className="max-h-80 w-full object-contain" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">내용</label>
            <div className="space-y-3">
              {sections.map((s, i) => (
                <div key={i} className="grid gap-2 md:grid-cols-[8rem_minmax(0,1fr)_3.5rem] items-start">
                  <input className="input-base text-sm" placeholder="항목명" value={s.label} onChange={(e) => updateSection(i, 'label', e.target.value)} />
                  <textarea className="input-base min-h-24" rows={4} value={s.content} onChange={(e) => updateSection(i, 'content', e.target.value)} />
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
            <label className="block text-sm font-semibold mb-2">사진 갤러리</label>
            <div className="space-y-3">
              {images.map((url, i) => (
                <div key={i} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_10rem_3.5rem] items-start">
                  <input className="input-base text-sm" placeholder="이미지 링크 주소" value={url} onChange={(e) => updateImage(i, e.target.value)} />
                  <input
                    type="file"
                    accept="image/*"
                    className="input-base text-sm"
                    onChange={(e) => readImageFile(e.target.files?.[0], (v) => updateImage(i, v))}
                  />
                  <button type="button" onClick={() => removeImage(i)} className="px-2 py-2 text-sm text-gray-400 hover:text-red-600">
                    삭제
                  </button>
                  {url && <img src={url} alt="" className="md:col-span-3 max-h-56 w-full rounded-lg border object-contain bg-gray-50" />}
                </div>
              ))}
            </div>
            <button type="button" onClick={addImage} className="btn-secondary mt-3 text-sm">
              + 사진 추가
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">첨부파일 (PDF, HTML, MD)</label>
            <AttachmentUploader attachments={attachments} setAttachments={setAttachments} />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            홈페이지에 공개
          </label>

          <div className="flex gap-3">
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
            <button className="text-red-500 text-sm hover:underline ml-auto" onClick={remove}>
              기록 삭제
            </button>
          </div>
        </div>

        <div className="card space-y-3 text-center h-fit lg:sticky lg:top-6">
          <p className="font-semibold text-sm">공개 페이지 주소</p>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-600 break-all block">
            {publicUrl}
          </a>
        </div>
      </div>
    </div>
  );
}
