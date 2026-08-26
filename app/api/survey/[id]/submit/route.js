import { NextResponse } from 'next/server';
import { SURVEYS_TAB, getConfigById, appendSurveyResponse } from '@/lib/sheets';

export async function POST(request, { params }) {
  const survey = await getConfigById(SURVEYS_TAB, params.id);
  if (!survey) return NextResponse.json({ error: '존재하지 않는 설문입니다.' }, { status: 404 });

  const body = await request.json();
  const answers = body.answers || {};

  for (const q of survey.questions) {
    const answer = answers[q.id];
    const missing = Array.isArray(answer) ? answer.length === 0 : !answer;
    if (q.required && missing) {
      return NextResponse.json({ error: `"${q.text}" 항목에 응답해 주세요.` }, { status: 400 });
    }
  }

  await appendSurveyResponse(survey, answers);
  return NextResponse.json({ ok: true });
}
