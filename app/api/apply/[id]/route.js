import { NextResponse } from 'next/server';
import { EVENTS_TAB, getConfigById, appendApplyResponse, getApplyCountsByEvent } from '@/lib/sheets';
import { computeEventStatus } from '@/lib/eventStatus';

export async function POST(request, { params }) {
  const event = await getConfigById(EVENTS_TAB, params.id);
  if (!event) return NextResponse.json({ error: '존재하지 않는 신청서입니다.' }, { status: 404 });

  const counts = await getApplyCountsByEvent();
  const status = computeEventStatus(event, counts[event.id] || 0);
  if (status.closed) {
    return NextResponse.json({ error: '모집이 종료되었습니다.' }, { status: 400 });
  }

  const body = await request.json();
  const answers = body.answers || {};
  const questions = event.questions || [];
  const missing = questions.find((q) => {
    if (!q.required) return false;
    const answer = answers[q.id];
    if (Array.isArray(answer)) return answer.length === 0;
    return !answer;
  });

  if (missing) {
    return NextResponse.json({ error: `${missing.text} 항목을 입력해 주세요.` }, { status: 400 });
  }

  await appendApplyResponse({
    eventId: event.id,
    eventTitle: event.title,
  }, questions, answers);

  return NextResponse.json({ ok: true, linkedSurveyId: event.linkedSurveyId || null });
}
