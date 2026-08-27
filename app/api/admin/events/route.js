import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getAuthedRequestUser } from '@/lib/auth';
import { cloneDefaultSurveyTemplate } from '@/lib/defaultSurvey';
import { cloneDefaultApplyTemplate } from '@/lib/defaultApply';
import { validateConfigImages } from '@/lib/imageData';
import { EVENTS_TAB, SURVEYS_TAB, listConfig, upsertConfig } from '@/lib/sheets';

export async function GET(request) {
  const user = await getAuthedRequestUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  try {
    const events = await listConfig(EVENTS_TAB);
    return NextResponse.json({ events, currentUser: user });
  } catch (error) {
    console.error('Failed to load events', error);
    return NextResponse.json(
      { error: '구글시트 설정을 확인해 주세요. GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID가 필요합니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const user = await getAuthedRequestUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  try {
    const body = await request.json();
    if (body.copyFromId) {
      const source = await listConfig(EVENTS_TAB).then((events) => events.find((item) => item.id === body.copyFromId));
      if (!source) return NextResponse.json({ error: '복사할 신청서를 찾을 수 없습니다.' }, { status: 404 });
      let copiedSurveyId = null;
      if (source.linkedSurveyId) {
        const sourceSurvey = await listConfig(SURVEYS_TAB).then((surveys) =>
          surveys.find((item) => item.id === source.linkedSurveyId)
        );
        if (sourceSurvey) {
          const copiedSurvey = {
            ...JSON.parse(JSON.stringify(sourceSurvey)),
            id: crypto.randomUUID(),
            title: `${sourceSurvey.title} 복사본`,
            ownerName: body.ownerName || user.displayName,
            ownerEmail: user.email,
            createdByEmail: user.email,
            createdByName: user.displayName,
            linkedEventId: null,
            createdAt: new Date().toISOString(),
          };
          copiedSurveyId = copiedSurvey.id;
          await upsertConfig(SURVEYS_TAB, copiedSurvey);
        }
      }
      const copied = {
        ...JSON.parse(JSON.stringify(source)),
        id: crypto.randomUUID(),
        title: `${source.title} 복사본`,
        ownerName: body.ownerName || user.displayName,
        ownerEmail: user.email,
        createdByEmail: user.email,
        createdByName: user.displayName,
        linkedSurveyId: copiedSurveyId,
        createdAt: new Date().toISOString(),
      };
      validateConfigImages(copied);
      if (copiedSurveyId) {
        const copiedSurvey = await listConfig(SURVEYS_TAB).then((surveys) =>
          surveys.find((item) => item.id === copiedSurveyId)
        );
        if (copiedSurvey) await upsertConfig(SURVEYS_TAB, { ...copiedSurvey, linkedEventId: copied.id });
      }
      await upsertConfig(EVENTS_TAB, copied);
      return NextResponse.json({ event: copied });
    }
    const eventId = crypto.randomUUID();
    const surveyTemplate = cloneDefaultSurveyTemplate();
    const applyTemplate = cloneDefaultApplyTemplate();
    const survey = {
      ...surveyTemplate,
      id: crypto.randomUUID(),
      title: `${body.title || '제목 없음'} 만족도 조사`,
      ownerName: body.ownerName || user.displayName,
      ownerEmail: user.email,
      createdByEmail: user.email,
      createdByName: user.displayName,
      linkedEventId: eventId,
      createdAt: new Date().toISOString(),
    };
    const event = {
      id: eventId,
      title: body.title || applyTemplate.title,
      ownerName: body.ownerName || user.displayName,
      ownerEmail: user.email,
      createdByEmail: user.email,
      createdByName: user.displayName,
      imageUrl: body.imageUrl || '',
      sections: body.sections || applyTemplate.sections,
      questions: body.questions || applyTemplate.questions,
      linkedSurveyId: survey.id,
      createdAt: new Date().toISOString(),
    };
    validateConfigImages(event);
    await upsertConfig(SURVEYS_TAB, survey);
    await upsertConfig(EVENTS_TAB, event);
    return NextResponse.json({ event });
  } catch (error) {
    console.error('Failed to create event', error);
    return NextResponse.json(
      { error: error.message || '신청서를 만들 수 없습니다. 구글시트 연동 환경변수를 확인해 주세요.' },
      { status: 500 }
    );
  }
}
