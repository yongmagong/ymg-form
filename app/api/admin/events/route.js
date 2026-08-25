import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { isAuthedRequest } from '@/lib/auth';
import { EVENTS_TAB, listConfig, upsertConfig } from '@/lib/sheets';

export async function GET(request) {
  if (!(await isAuthedRequest(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const events = await listConfig(EVENTS_TAB);
  return NextResponse.json({ events });
}

export async function POST(request) {
  if (!(await isAuthedRequest(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const body = await request.json();
  const event = {
    id: crypto.randomUUID(),
    title: body.title || '제목 없음',
    sections: body.sections || [],
    linkedSurveyId: body.linkedSurveyId || null,
    createdAt: new Date().toISOString(),
  };
  await upsertConfig(EVENTS_TAB, event);
  return NextResponse.json({ event });
}
