import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { isAuthedRequest } from '@/lib/auth';
import { cloneDefaultSurveyTemplate } from '@/lib/defaultSurvey';
import { cloneDefaultApplyTemplate } from '@/lib/defaultApply';
import { EVENTS_TAB, SURVEYS_TAB, listConfig, upsertConfig } from '@/lib/sheets';

export async function GET(request) {
  if (!(await isAuthedRequest(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  try {
    const events = await listConfig(EVENTS_TAB);
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to load events', error);
    return NextResponse.json(
      { error: '구글시트 설정을 확인해 주세요. GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID가 필요합니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  if (!(await isAuthedRequest(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  try {
    const body = await request.json();
    const eventId = crypto.randomUUID();
    const surveyTemplate = cloneDefaultSurveyTemplate();
    const applyTemplate = cloneDefaultApplyTemplate();
    const survey = {
      ...surveyTemplate,
      id: crypto.randomUUID(),
      title: `${body.title || '제목 없음'} 만족도 조사`,
      linkedEventId: eventId,
      createdAt: new Date().toISOString(),
    };
    const event = {
      id: eventId,
      title: body.title || applyTemplate.title,
      imageUrl: body.imageUrl || '',
      sections: body.sections || applyTemplate.sections,
      questions: body.questions || applyTemplate.questions,
      linkedSurveyId: survey.id,
      createdAt: new Date().toISOString(),
    };
    await upsertConfig(SURVEYS_TAB, survey);
    await upsertConfig(EVENTS_TAB, event);
    return NextResponse.json({ event });
  } catch (error) {
    console.error('Failed to create event', error);
    return NextResponse.json(
      { error: '신청서를 만들 수 없습니다. 구글시트 연동 환경변수를 확인해 주세요.' },
      { status: 500 }
    );
  }
}
