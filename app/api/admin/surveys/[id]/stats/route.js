import { NextResponse } from 'next/server';
import { isAuthedRequest } from '@/lib/auth';
import { SURVEYS_TAB, getConfigById, getSurveyResponses } from '@/lib/sheets';

export async function GET(request, { params }) {
  if (!isAuthedRequest(request)) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const survey = await getConfigById(SURVEYS_TAB, params.id);
  if (!survey) return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 });

  const { rows } = await getSurveyResponses(survey);

  const questionStats = survey.questions.map((q, qIndex) => {
    const colIndex = qIndex + 1; // column 0 is timestamp
    const answers = rows.map((r) => r[colIndex]).filter((v) => v !== undefined && v !== '');

    if (q.type === 'text') {
      return { id: q.id, text: q.text, type: q.type, answers };
    }

    const counts = {};
    const options = q.type === 'scale5' ? ['1', '2', '3', '4', '5'] : q.options;
    options.forEach((o) => (counts[o] = 0));
    answers.forEach((a) => {
      counts[a] = (counts[a] || 0) + 1;
    });
    const chartData = options.map((o) => ({ name: o, count: counts[o] || 0 }));

    let average = null;
    if (q.type === 'scale5') {
      const nums = answers.map(Number).filter((n) => !Number.isNaN(n));
      if (nums.length) average = nums.reduce((a, b) => a + b, 0) / nums.length;
    }

    return { id: q.id, text: q.text, type: q.type, chartData, total: answers.length, average };
  });

  return NextResponse.json({
    survey: { id: survey.id, title: survey.title },
    totalResponses: rows.length,
    questionStats,
  });
}
