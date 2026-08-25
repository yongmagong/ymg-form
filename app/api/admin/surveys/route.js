import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { isAuthedRequest } from '@/lib/auth';
import { SURVEYS_TAB, listConfig, upsertConfig } from '@/lib/sheets';

export async function GET(request) {
  if (!(await isAuthedRequest(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  try {
    const surveys = await listConfig(SURVEYS_TAB);
    return NextResponse.json({ surveys });
  } catch (error) {
    console.error('Failed to load surveys', error);
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
  } catch (error) {
    console.error('Failed to create survey', error);
    return NextResponse.json(
      { error: '설문조사를 만들 수 없습니다. 구글시트 연동 환경변수를 확인해 주세요.' },
      { status: 500 }
    );
  }
}
