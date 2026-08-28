import { NextResponse } from 'next/server';
import { getAuthedRequestUser } from '@/lib/auth';
import { cloneDefaultSurveyTemplate } from '@/lib/defaultSurvey';
import { cloneDefaultApplyTemplate } from '@/lib/defaultApply';
import { validateConfigImages } from '@/lib/imageData';
import { shortId } from '@/lib/shortId';
import { EVENTS_TAB, SURVEYS_TAB, listConfig, upsertConfig, getApplyCountsByEvent } from '@/lib/sheets';

export async function GET(request) {
  const user = await getAuthedRequestUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  try {
    const [events, appliedCounts] = await Promise.all([listConfig(EVENTS_TAB), getApplyCountsByEvent()]);
    return NextResponse.json({ events, appliedCounts, currentUser: user });
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
      const eventId = shortId();
      const sourceSurveyIds = source.linkedSurveyIds || (source.linkedSurveyId ? [source.linkedSurveyId] : []);
      const allSurveys = await listConfig(SURVEYS_TAB);
      const copiedSurveyIds = [];
      for (const surveyId of sourceSurveyIds) {
        const sourceSurvey = allSurveys.find((item) => item.id === surveyId);
        if (!sourceSurvey) continue;
        const copiedSurvey = {
          ...JSON.parse(JSON.stringify(sourceSurvey)),
          id: shortId(),
          title: `${sourceSurvey.title} 복사본`,
          ownerName: body.ownerName || user.displayName,
          ownerEmail: user.email,
          createdByEmail: user.email,
          createdByName: user.displayName,
          linkedEventId: eventId,
          createdAt: new Date().toISOString(),
        };
        copiedSurveyIds.push(copiedSurvey.id);
        await upsertConfig(SURVEYS_TAB, copiedSurvey);
      }
      const copied = {
        ...JSON.parse(JSON.stringify(source)),
        id: eventId,
        title: `${source.title} 복사본`,
        ownerName: body.ownerName || user.displayName,
        ownerEmail: user.email,
        createdByEmail: user.email,
        createdByName: user.displayName,
        linkedSurveyIds: copiedSurveyIds,
        createdAt: new Date().toISOString(),
      };
      delete copied.linkedSurveyId;
      validateConfigImages(copied);
      await upsertConfig(EVENTS_TAB, copied);
      return NextResponse.json({ event: copied });
    }
    const eventId = shortId();
    const surveyTemplate = cloneDefaultSurveyTemplate();
    const applyTemplate = cloneDefaultApplyTemplate();
    const survey = {
      ...surveyTemplate,
      id: shortId(),
      title: `${body.title || '제목 없음'} 만족도 조사`,
      ownerName: body.ownerName || user.displayName,
      ownerEmail: user.email,
      createdByEmail: user.email,
      createdByName: user.displayName,
      linkedEventId: eventId,
      round: '',
      published: false,
      createdAt: new Date().toISOString(),
    };
    const event = {
      id: eventId,
      title: body.title || applyTemplate.title,
      ownerName: body.ownerName || user.displayName,
      ownerPhone: body.ownerPhone || '',
      ownerEmail: user.email,
      createdByEmail: user.email,
      createdByName: user.displayName,
      imageUrl: body.imageUrl || '',
      sections: body.sections || applyTemplate.sections,
      questions: body.questions || applyTemplate.questions,
      linkedSurveyIds: [survey.id],
      category: body.category || '행사',
      orgLabel: body.orgLabel || '',
      eventStart: body.eventStart || '',
      eventEnd: body.eventEnd || '',
      locationName: body.locationName || '',
      locationAddress: body.locationAddress || '',
      capacity: body.capacity ? Number(body.capacity) : 0,
      recruitStart: body.recruitStart || '',
      recruitEnd: body.recruitEnd || '',
      published: body.published !== undefined ? !!body.published : true,
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
