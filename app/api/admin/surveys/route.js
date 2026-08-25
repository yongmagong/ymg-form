import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { isAuthedRequest } from '@/lib/auth';
import { SURVEYS_TAB, listConfig, upsertConfig } from '@/lib/sheets';

export async function GET(request) {
  if (!isAuthedRequest(request)) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const surveys = await listConfig(SURVEYS_TAB);
  return NextResponse.json({ surveys });
}

export async function POST(request) {
  if (!isAuthedRequest(request)) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const body = await request.json();
  const survey = {
    id: crypto.randomUUID(),
    title: body.title || '제목 없음',
    intro: body.intro || '',
    questions: (body.questions || []).map((q, i) => ({
      id: q.id || `q_${i}_${Math.random().toString(36).slice(2, 8)}`,
      text: q.text || `질문 ${i + 1}`,
      type: q.type || 'single',
      options: q.options || [],
      lowLabel: q.lowLabel,
      highLabel: q.highLabel,
      required: q.required !== false,
    })),
    linkedEventId: body.linkedEventId || null,
    createdAt: new Date().toISOString(),
  };
  await upsertConfig(SURVEYS_TAB, survey);
  return NextResponse.json({ survey });
}
