import { NextResponse } from 'next/server';
import { getAuthedRequestUser } from '@/lib/auth';
import { validateConfigImages } from '@/lib/imageData';
import { EVENTS_TAB, SURVEYS_TAB, getConfigById, upsertConfig, deleteConfig, getApplyCountsByEvent } from '@/lib/sheets';

function effectiveSurveyIds(event) {
  return event.linkedSurveyIds || (event.linkedSurveyId ? [event.linkedSurveyId] : []);
}

export async function GET(request, { params }) {
  if (!(await getAuthedRequestUser(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const event = await getConfigById(EVENTS_TAB, params.id);
  if (!event) return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 });
  const counts = await getApplyCountsByEvent();
  return NextResponse.json({ event, appliedCount: counts[event.id] || 0 });
}

export async function PUT(request, { params }) {
  const user = await getAuthedRequestUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const existing = await getConfigById(EVENTS_TAB, params.id);
  if (!existing) return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 });
  const body = await request.json();
  const oldSurveyIds = effectiveSurveyIds(existing);
  const newSurveyIds = body.linkedSurveyIds !== undefined ? body.linkedSurveyIds : oldSurveyIds;
  const updated = {
    ...existing,
    title: body.title ?? existing.title,
    ownerName: body.ownerName ?? existing.ownerName ?? user.displayName,
    ownerEmail: body.ownerEmail ?? existing.ownerEmail ?? user.email,
    imageUrl: body.imageUrl ?? existing.imageUrl ?? '',
    sections: body.sections ?? existing.sections,
    questions: body.questions ?? existing.questions,
    linkedSurveyIds: newSurveyIds,
    category: body.category ?? existing.category ?? '행사',
    orgLabel: body.orgLabel ?? existing.orgLabel ?? '',
    eventStart: body.eventStart ?? existing.eventStart ?? '',
    eventEnd: body.eventEnd ?? existing.eventEnd ?? '',
    locationName: body.locationName ?? existing.locationName ?? '',
    locationAddress: body.locationAddress ?? existing.locationAddress ?? '',
    capacity: body.capacity !== undefined ? Number(body.capacity) || 0 : existing.capacity ?? 0,
    recruitStart: body.recruitStart ?? existing.recruitStart ?? '',
    recruitEnd: body.recruitEnd ?? existing.recruitEnd ?? '',
    published: body.published !== undefined ? !!body.published : existing.published ?? false,
  };
  delete updated.linkedSurveyId;
  validateConfigImages(updated);
  await upsertConfig(EVENTS_TAB, updated);

  const added = newSurveyIds.filter((sid) => !oldSurveyIds.includes(sid));
  const removed = oldSurveyIds.filter((sid) => !newSurveyIds.includes(sid));
  if (added.length > 0 || removed.length > 0) {
    for (const surveyId of added) {
      const survey = await getConfigById(SURVEYS_TAB, surveyId);
      if (survey) await upsertConfig(SURVEYS_TAB, { ...survey, linkedEventId: updated.id });
    }
    for (const surveyId of removed) {
      const survey = await getConfigById(SURVEYS_TAB, surveyId);
      if (survey && survey.linkedEventId === updated.id) {
        await upsertConfig(SURVEYS_TAB, { ...survey, linkedEventId: null });
      }
    }
  }

  return NextResponse.json({ event: updated });
}

export async function DELETE(request, { params }) {
  if (!(await getAuthedRequestUser(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  await deleteConfig(EVENTS_TAB, params.id);
  return NextResponse.json({ ok: true });
}
