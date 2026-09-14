import { NextResponse } from 'next/server';
import { isAuthedRequest } from '@/lib/auth';
import { SURVEYS_TAB, getConfigById, getSurveyResponses } from '@/lib/sheets';
import { toCsv } from '@/lib/csv';

export async function GET(request, { params }) {
  if (!(await isAuthedRequest(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const survey = await getConfigById(SURVEYS_TAB, params.id);
  if (!survey) return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 });

  const { headers, rows } = await getSurveyResponses(survey);
  const csv = toCsv(headers, rows);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(survey.title || '설문')}_응답.csv"`,
    },
  });
}
