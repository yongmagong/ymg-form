'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuestionBuilder from '@/components/QuestionBuilder';
import { cloneDefaultApplyTemplate } from '@/lib/defaultApply';
import { uploadImageFile } from '@/lib/uploadImage';
import { CATEGORY_OPTIONS } from '@/lib/eventOptions';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [title, setTitle] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [linkedSurveyIds, setLinkedSurveyIds] = useState([]);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[2]);
  const [orgLabel, setOrgLabel] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [capacity, setCapacity] = useState('');
  const [recruitStart, setRecruitStart] = useState('');
  const [recruitEnd, setRecruitEnd] = useState('');
  const [published, setPublished] = useState(false);
  const [appliedCount, setAppliedCount] = useState(0);
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
    setOwnerName(evData.event.ownerName || evData.event.createdByName || '');
    setOwnerPhone(evData.event.ownerPhone || '');
    setImageUrl(evData.event.imageUrl || '');
    setSections(evData.event.sections || []);
    setQuestions(evData.event.questions || cloneDefaultApplyTemplate().questions);
    setLinkedSurveyIds(evData.event.linkedSurveyIds || (evData.event.linkedSurveyId ? [evData.event.linkedSurveyId] : []));
    setCategory(evData.event.category || CATEGORY_OPTIONS[2]);
    setOrgLabel(evData.event.orgLabel || '');
    setEventStart(evData.event.eventStart || '');
    setEventEnd(evData.event.eventEnd || '');
    setLocationName(evData.event.locationName || '');
    setLocationAddress(evData.event.locationAddress || '');
    setCapacity(evData.event.capacity || '');
    setRecruitStart(evData.event.recruitStart || '');
    setRecruitEnd(evData.event.recruitEnd || '');
    setPublished(!!evData.event.published);
    setAppliedCount(evData.appliedCount || 0);
    setSurveys(svData.surveys || []);
  }

  useEffect(() => {
    load();
  }, [id]);

  function toggleLinkedSurvey(surveyId) {
    setLinkedSurveyIds((prev) => (prev.includes(surveyId) ? prev.filter((id) => id !== surveyId) : [...prev, surveyId]));
  }

  function updateSection(i, field, value) {
    setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }
  function addSection() {
    setSections((prev) => [...prev, { label: '', content: '' }]);
  }
  function removeSection(i) {
    setSections((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function readImageFile(file) {
    if (!file) return;
    try {
      setImageUrl(await uploadImageFile(file));
    } catch (err) {
      alert(err.message || '이미지 업로드에 실패했습니다.');
    }
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        ownerName,
        ownerPhone,
        imageUrl,
        sections,
        questions: questions.map((q) => ({ ...q, options: (q.options || []).map((o) => o.trim()).filter(Boolean) })),
        linkedSurveyIds,
        category,
        orgLabel,
        eventStart,
        eventEnd,
        locationName,
        locationAddress,
        capacity,
        recruitStart,
        recruitEnd,
        published,
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

  const qrSrc = publicUrl ? `/api/qrcode?url=${encodeURIComponent(publicUrl)}` : '';
  const linkedSurveys = linkedSurveyIds
    .map((sid) => surveys.find((s) => s.id === sid))
    .filter(Boolean)
    .map((s) => ({
      ...s,
      url: typeof window !== 'undefined' ? `${window.location.origin}/survey/${s.id}` : '',
    }))
    .map((s) => ({ ...s, qrSrc: s.url ? `/api/qrcode?url=${encodeURIComponent(s.url)}` : '' }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">신청서 편집</h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="card space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1">제목</label>
            <input className="input-base" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold mb-1">담당자 이름</label>
              <input
                className="input-base"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="예: 홍길동"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">담당자 연락처 (선택)</label>
              <input
                className="input-base"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="예: 031-335-1070"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
            현재 신청 <strong>{appliedCount}명</strong>
            {capacity ? ` / 정원 ${capacity}명` : ' (정원 제한 없음)'}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold mb-1">분류</label>
              <select className="input-base" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">태그 (예: 처인구, 공동체팀)</label>
              <input className="input-base" value={orgLabel} onChange={(e) => setOrgLabel(e.target.value)} placeholder="선택 입력" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold mb-1">시작 일시</label>
              <input
                type="datetime-local"
                className="input-base"
                value={eventStart}
                onClick={(e) => e.currentTarget.showPicker?.()}
                onChange={(e) => setEventStart(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">종료 일시 (선택)</label>
              <input
                type="datetime-local"
                className="input-base"
                value={eventEnd}
                onClick={(e) => e.currentTarget.showPicker?.()}
                onChange={(e) => setEventEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold mb-1">장소명</label>
              <input className="input-base" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="예: 오이도작은도서관" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">주소</label>
              <input className="input-base" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} placeholder="지도 링크에 사용됩니다" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold mb-1">정원 (0 = 제한 없음)</label>
              <input type="number" min="0" className="input-base" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">모집 시작일</label>
              <input type="date" className="input-base" value={recruitStart} onClick={(e) => e.currentTarget.showPicker?.()} onChange={(e) => setRecruitStart(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">모집 마감일</label>
              <input type="date" className="input-base" value={recruitEnd} onClick={(e) => e.currentTarget.showPicker?.()} onChange={(e) => setRecruitEnd(e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            홈페이지에 공개
          </label>

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
            <label className="block text-sm font-semibold mb-1">연결할 만족도 설문조사 (복수 선택 가능)</label>
            <div className="rounded-lg border border-gray-200 divide-y max-h-64 overflow-y-auto">
              {surveys.length === 0 && <p className="text-gray-400 text-sm p-3">설문조사가 없습니다.</p>}
              {surveys.map((s) => (
                <label key={s.id} className="flex items-center gap-2 p-2.5 text-sm cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={linkedSurveyIds.includes(s.id)}
                    onChange={() => toggleLinkedSurvey(s.id)}
                  />
                  <span className="flex-1 truncate">{s.title}</span>
                  {s.round && <span className="text-xs rounded-full bg-gray-100 text-gray-600 px-2 py-0.5">{s.round}</span>}
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              1차, 2차처럼 회차별로 여러 설문을 연결할 수 있습니다. 신청 완료 후 참여자에게 연결된 모든 설문 참여 버튼이 표시됩니다.
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

          {linkedSurveys.map((s) => (
            <div key={s.id} className="border-t pt-5 space-y-3">
              <p className="font-semibold text-sm">
                {s.round ? `${s.round} ` : ''}만족도 설문 QR코드
              </p>
              <p className="text-xs text-gray-400 -mt-2 truncate">{s.title}</p>
              {s.qrSrc && <img src={s.qrSrc} alt="만족도 설문 QR" className="w-full rounded-xl border" />}
              <a href={s.qrSrc} download={`${s.title}_QR.png`} className="btn-primary block">
                만족도 QR 다운로드
              </a>
              <a href={s.url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 break-all block">
                {s.url}
              </a>
            </div>
          ))}

          {linkedSurveys.length === 0 && (
            <p className="text-xs text-gray-400 border-t pt-4">
              연결된 만족도 설문조사가 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
