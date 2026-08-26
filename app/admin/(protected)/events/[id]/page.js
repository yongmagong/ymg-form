'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuestionBuilder from '@/components/QuestionBuilder';
import { cloneDefaultApplyTemplate } from '@/lib/defaultApply';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
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
    setImageUrl(evData.event.imageUrl || '');
    setSections(evData.event.sections || []);
    setQuestions(evData.event.questions || cloneDefaultApplyTemplate().questions);
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

  function readImageFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result);
    reader.readAsDataURL(file);
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        imageUrl,
        sections,
        questions: questions.map((q) => ({ ...q, options: (q.options || []).map((o) => o.trim()).filter(Boolean) })),
        linkedSurveyId: linkedSurveyId || null,
      }),
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

  const linkedSurvey = surveys.find((s) => s.id === linkedSurveyId);
  const qrSrc = publicUrl ? `/api/qrcode?url=${encodeURIComponent(publicUrl)}` : '';
  const surveyUrl =
    typeof window !== 'undefined' && linkedSurveyId ? `${window.location.origin}/survey/${linkedSurveyId}` : '';
  const surveyQrSrc = surveyUrl ? `/api/qrcode?url=${encodeURIComponent(surveyUrl)}` : '';

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">신청서 편집</h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="card space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1">제목</label>
            <input className="input-base" value={title} onChange={(e) => setTitle(e.target.value)} />
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
              <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img src={imageUrl} alt="포스터 미리보기" className="max-h-80 w-full object-contain" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">안내 내용</label>
            <div className="space-y-3">
              {sections.map((s, i) => (
                <div key={i} className="grid gap-2 md:grid-cols-[8rem_minmax(0,1fr)_3.5rem] items-start">
                  <input
                    className="input-base text-sm"
                    placeholder="항목명"
                    value={s.label}
                    onChange={(e) => updateSection(i, 'label', e.target.value)}
                  />
                  <textarea
                    className="input-base min-h-24"
                    rows={4}
                    value={s.content}
                    onChange={(e) => updateSection(i, 'content', e.target.value)}
                  />
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

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold">참가신청서 문항</label>
              <button
                type="button"
                onClick={() => setQuestions(cloneDefaultApplyTemplate().questions)}
                className="text-xs text-brand-600 hover:underline"
              >
                기본 샘플 양식 불러오기
              </button>
            </div>
            <QuestionBuilder questions={questions} setQuestions={setQuestions} />
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

        <div className="card space-y-5 text-center h-fit lg:sticky lg:top-6">
          <div className="space-y-3">
            <p className="font-semibold text-sm">참가신청서 QR코드</p>
            {qrSrc && <img src={qrSrc} alt="참가신청서 QR" className="w-full rounded-xl border" />}
            <a href={qrSrc} download={`${title}_신청서_QR.png`} className="btn-primary block">
              신청서 QR 다운로드
            </a>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-600 break-all block">
              {publicUrl}
            </a>
          </div>

          {linkedSurveyId && (
            <div className="border-t pt-5 space-y-3">
              <p className="font-semibold text-sm">만족도 설문 QR코드</p>
              {surveyQrSrc && <img src={surveyQrSrc} alt="만족도 설문 QR" className="w-full rounded-xl border" />}
              <a href={surveyQrSrc} download={`${linkedSurvey?.title || title + '_만족도'}_QR.png`} className="btn-primary block">
                만족도 QR 다운로드
              </a>
              <a href={surveyUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-600 break-all block">
                {surveyUrl}
              </a>
            </div>
          )}

          {!linkedSurveyId && (
            <p className="text-xs text-gray-400 border-t pt-4">
              연결된 만족도 설문조사가 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
