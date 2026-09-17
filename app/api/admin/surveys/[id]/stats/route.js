import { NextResponse } from 'next/server';
import { isAuthedRequest } from '@/lib/auth';
import { SURVEYS_TAB, getConfigById, getSurveyResponses } from '@/lib/sheets';
import { answerableQuestions } from '@/lib/answerableQuestions';
import { isOtherOption, extractOtherText } from '@/lib/otherOption';

const TEXT_TYPES = ['text', 'textarea'];
const CATEGORY_TYPES = ['single', 'dropdown'];
const FREE_VALUE_TYPES = ['date', 'time'];

function withPercent(rows, base) {
  return rows.map((r) => ({ ...r, percent: base > 0 ? Math.round((r.count / base) * 100) : 0 }));
}

// A multi-select answer is stored as "옵션A, 옵션B" (see appendSurveyResponse), so
// counting whole cells scores every multi-pick response as its own category and
// leaves each real option at zero. Split first, then match.
function splitMulti(value) {
  return String(value)
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

export async function GET(request, { params }) {
  if (!(await isAuthedRequest(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const survey = await getConfigById(SURVEYS_TAB, params.id);
  if (!survey) return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 });

  const { rows } = await getSurveyResponses(survey);
  const totalResponses = rows.length;

  const questionStats = answerableQuestions(survey.questions).map((q, qIndex) => {
    const colIndex = qIndex + 1; // column 0 is the timestamp
    const raw = rows.map((r) => (r[colIndex] === undefined ? '' : String(r[colIndex]).trim()));
    const answers = raw.filter((v) => v !== '');
    const base = { id: q.id, text: q.text, type: q.type, answered: answers.length, unanswered: totalResponses - answers.length };

    if (TEXT_TYPES.includes(q.type)) {
      return { ...base, kind: 'text', answers };
    }

    if (q.type === 'checkbox') {
      const rowsOut = [
        { name: '동의합니다', count: answers.length },
        { name: '응답 안 함', count: totalResponses - answers.length },
      ];
      return { ...base, kind: 'category', chartData: withPercent(rowsOut, totalResponses) };
    }

    if (q.type === 'scale5') {
      const options = ['1', '2', '3', '4', '5'];
      const counts = Object.fromEntries(options.map((o) => [o, 0]));
      answers.forEach((a) => {
        if (counts[a] !== undefined) counts[a] += 1;
      });
      const nums = answers.map(Number).filter((n) => !Number.isNaN(n));
      return {
        ...base,
        kind: 'scale',
        chartData: withPercent(options.map((o) => ({ name: o, count: counts[o] })), answers.length),
        average: nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null,
        lowLabel: q.lowLabel || '',
        highLabel: q.highLabel || '',
      };
    }

    if (FREE_VALUE_TYPES.includes(q.type)) {
      const counts = {};
      answers.forEach((a) => (counts[a] = (counts[a] || 0) + 1));
      const rowsOut = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return { ...base, kind: 'bars', chartData: withPercent(rowsOut, answers.length) };
    }

    // single / dropdown / multi all draw from the question's own option list, so
    // an option nobody picked still shows as a zero row rather than vanishing.
    const options = q.options || [];
    const counts = Object.fromEntries(options.map((o) => [o, 0]));
    const otherTexts = [];
    const otherOption = options.find(isOtherOption);

    const tally = (value) => {
      if (counts[value] !== undefined) {
        counts[value] += 1;
        return;
      }
      if (isOtherOption(value) && otherOption) {
        counts[otherOption] += 1;
        const typed = extractOtherText(value);
        if (typed) otherTexts.push(typed);
      }
    };

    if (q.type === 'multi') {
      answers.forEach((a) => {
        const parts = splitMulti(a);
        // Dedupe: the same option twice in one response is still one respondent.
        new Set(parts).forEach(tally);
      });
      const rowsOut = options.map((o) => ({ name: o, count: counts[o] }));
      const selections = rowsOut.reduce((sum, r) => sum + r.count, 0);
      return { ...base, kind: 'bars', selections, chartData: withPercent(rowsOut, selections), otherTexts };
    }

    answers.forEach(tally);
    const rowsOut = options.map((o) => ({ name: o, count: counts[o] }));
    return {
      ...base,
      kind: CATEGORY_TYPES.includes(q.type) ? 'category' : 'bars',
      chartData: withPercent(rowsOut, answers.length),
      otherTexts,
    };
  });

  return NextResponse.json({
    survey: { id: survey.id, title: survey.title },
    totalResponses,
    questionStats,
  });
}
