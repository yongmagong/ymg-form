import { NextResponse } from 'next/server';
import { EVENTS_TAB, SURVEYS_TAB, getConfigById, listConfig, appendApplyResponse, ensureAppliedCounts } from '@/lib/sheets';
import { computeEventStatus } from '@/lib/eventStatus';

export async function POST(request, { params }) {
  const event = await getConfigById(EVENTS_TAB, params.id);
  if (!event) return NextResponse.json({ error: '존재하지 않는 신청서입니다.' }, { status: 404 });

  await ensureAppliedCounts([event]);
  const status = computeEventStatus(event);
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

  const surveyIds = event.linkedSurveyIds || (event.linkedSurveyId ? [event.linkedSurveyId] : []);
  let linkedSurveys = [];
  if (surveyIds.length > 0) {
    const allSurveys = await listConfig(SURVEYS_TAB);
    linkedSurveys = surveyIds
      .map((id) => allSurveys.find((sv) => sv.id === id))
      .filter(Boolean)
      .map((sv) => ({ id: sv.id, title: sv.title, round: sv.round || '' }));
  }

  return NextResponse.json({ ok: true, linkedSurveys });
}
