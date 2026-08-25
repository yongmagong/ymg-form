import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { isAuthedRequest } from '@/lib/auth';
import { cloneDefaultSurveyTemplate } from '@/lib/defaultSurvey';
import { EVENTS_TAB, SURVEYS_TAB, listConfig, upsertConfig } from '@/lib/sheets';

export async function GET(request) {
  if (!(await isAuthedRequest(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const events = await listConfig(EVENTS_TAB);
  return NextResponse.json({ events });
}

export async function POST(request) {
  if (!(await isAuthedRequest(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const body = await request.json();
  const eventId = crypto.randomUUID();
  const surveyTemplate = cloneDefaultSurveyTemplate();
  const survey = {
    ...surveyTemplate,
    id: crypto.randomUUID(),
    title: `${body.title || '제목 없음'} 만족도 조사`,
    linkedEventId: eventId,
    createdAt: new Date().toISOString(),
  };
  const event = {
    id: eventId,
    title: body.title || '제목 없음',
    sections: body.sections || [],
    linkedSurveyId: survey.id,
    createdAt: new Date().toISOString(),
  };
  await upsertConfig(SURVEYS_TAB, survey);
  await upsertConfig(EVENTS_TAB, event);
  return NextResponse.json({ event });
}
