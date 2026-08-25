import { NextResponse } from 'next/server';
import { isAuthedRequest } from '@/lib/auth';
import { EVENTS_TAB, getConfigById, upsertConfig, deleteConfig } from '@/lib/sheets';

export async function GET(request, { params }) {
  if (!(await isAuthedRequest(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const event = await getConfigById(EVENTS_TAB, params.id);
  if (!event) return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 });
  return NextResponse.json({ event });
}

export async function PUT(request, { params }) {
  if (!(await isAuthedRequest(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const existing = await getConfigById(EVENTS_TAB, params.id);
  if (!existing) return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 });
  const body = await request.json();
  const updated = {
    ...existing,
    title: body.title ?? existing.title,
    sections: body.sections ?? existing.sections,
    linkedSurveyId: body.linkedSurveyId !== undefined ? body.linkedSurveyId : existing.linkedSurveyId,
  };
  await upsertConfig(EVENTS_TAB, updated);
  return NextResponse.json({ event: updated });
}

export async function DELETE(request, { params }) {
  if (!(await isAuthedRequest(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  await deleteConfig(EVENTS_TAB, params.id);
  return NextResponse.json({ ok: true });
}
