import { NextResponse } from 'next/server';
import { EVENTS_TAB, getConfigById, appendApplyResponse } from '@/lib/sheets';

export async function POST(request, { params }) {
  const event = await getConfigById(EVENTS_TAB, params.id);
  if (!event) return NextResponse.json({ error: '존재하지 않는 신청서입니다.' }, { status: 404 });

  const body = await request.json();
  const { name, phone1, phone2, org, noOrg, referral, region, regionEtc, consentInfo, consentPhoto } = body;

  if (!name || !phone1 || !phone2 || !referral || !region) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해 주세요.' }, { status: 400 });
  }
  if (!consentInfo || !consentPhoto) {
    return NextResponse.json({ error: '필수 동의 항목에 모두 동의해 주세요.' }, { status: 400 });
  }

  const phone = `010-${phone1}-${phone2}`;
  const orgValue = noOrg ? '없음' : org || '없음';
  const regionValue = region === '기타' && regionEtc ? `기타(${regionEtc})` : region;

  await appendApplyResponse({
    eventId: event.id,
    eventTitle: event.title,
    name,
    phone,
    org: orgValue,
    referral,
    region: regionValue,
    consentInfo,
    consentPhoto,
  });

  return NextResponse.json({ ok: true, linkedSurveyId: event.linkedSurveyId || null });
}
