'use client';

import { useState } from 'react';
import { REFERRAL_OPTIONS, REGION_OPTIONS, PRIVACY_CONSENT_TEXT, PHOTO_CONSENT_TEXT } from '@/lib/applyOptions';

function ChoiceGroup({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          onClick={() => onChange(opt)}
          className={`choice-btn text-center ${value === opt ? 'selected' : ''}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ConsentBox({ text, checked, onChange, label }) {
  return (
    <div className="border-2 border-gray-200 rounded-2xl p-4 space-y-3">
      <div className="max-h-40 overflow-y-auto text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">
        {text}
      </div>
      <label className="flex items-center gap-2 font-semibold cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-5 h-5" />
        {label}
      </label>
    </div>
  );
}

export default function ApplyForm({ eventId }) {
  const [name, setName] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [org, setOrg] = useState('');
  const [noOrg, setNoOrg] = useState(false);
  const [referral, setReferral] = useState('');
  const [region, setRegion] = useState('');
  const [regionEtc, setRegionEtc] = useState('');
  const [consentInfo, setConsentInfo] = useState(false);
  const [consentPhoto, setConsentPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await fetch(`/api/apply/${eventId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone1,
        phone2,
        org,
        noOrg,
        referral,
        region,
        regionEtc,
        consentInfo,
        consentPhoto,
      }),
    });
    setSubmitting(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || '제출에 실패했습니다.');
      return;
    }
    setResult(data);
  }

  if (result) {
    return (
      <div className="card text-center space-y-4">
        <p className="text-2xl">✅</p>
        <p className="font-bold text-lg">신청이 완료되었습니다.</p>
        <p className="text-gray-500 text-sm">참여해 주셔서 감사합니다.</p>
        {result.linkedSurveyId && (
          <a href={`/survey/${result.linkedSurveyId}`} className="btn-primary inline-block mt-2">
            만족도 설문에 참여하기 →
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-6">
      <div>
        <label className="block font-semibold mb-2">신청인 이름 *</label>
        <input className="input-base" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <label className="block font-semibold mb-2">연락처 *</label>
        <div className="flex items-center gap-2">
          <span className="input-base w-20 text-center bg-gray-50">010</span>
          <span>-</span>
          <input
            className="input-base"
            maxLength={4}
            inputMode="numeric"
            value={phone1}
            onChange={(e) => setPhone1(e.target.value.replace(/\D/g, ''))}
            required
          />
          <span>-</span>
          <input
            className="input-base"
            maxLength={4}
            inputMode="numeric"
            value={phone2}
            onChange={(e) => setPhone2(e.target.value.replace(/\D/g, ''))}
            required
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-2">소속공동체, 단체</label>
        <input
          className="input-base disabled:bg-gray-100"
          value={org}
          disabled={noOrg}
          onChange={(e) => setOrg(e.target.value)}
        />
        <label className="flex items-center gap-2 mt-2 text-sm text-gray-500 cursor-pointer">
          <input type="checkbox" checked={noOrg} onChange={(e) => setNoOrg(e.target.checked)} />
          없음
        </label>
      </div>

      <div>
        <label className="block font-semibold mb-2">이 행사(교육)을 알게된 경로를 선택해 주세요 *</label>
        <ChoiceGroup options={REFERRAL_OPTIONS} value={referral} onChange={setReferral} />
      </div>

      <div>
        <label className="block font-semibold mb-2">거주하시는 지역이 어디신가요? *</label>
        <ChoiceGroup options={REGION_OPTIONS} value={region} onChange={setRegion} />
        {region === '기타' && (
          <input
            className="input-base mt-2"
            placeholder="거주 지역을 입력해 주세요"
            value={regionEtc}
            onChange={(e) => setRegionEtc(e.target.value)}
          />
        )}
      </div>

      <ConsentBox
        text={PRIVACY_CONSENT_TEXT}
        checked={consentInfo}
        onChange={setConsentInfo}
        label="개인정보 수집·이용에 동의합니다 (필수)"
      />
      <ConsentBox
        text={PHOTO_CONSENT_TEXT}
        checked={consentPhoto}
        onChange={setConsentPhoto}
        label="사진·영상 촬영 및 제공에 동의합니다 (필수)"
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        className="btn-primary w-full text-lg"
        disabled={submitting || !name || !phone1 || !phone2 || !referral || !region || !consentInfo || !consentPhoto}
      >
        {submitting ? '제출 중...' : '제출하기'}
      </button>
    </form>
  );
}
