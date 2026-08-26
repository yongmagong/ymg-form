import { NextResponse } from 'next/server';
import { getAuthedRequestUser } from '@/lib/auth';
import { EVENTS_TAB, getConfigById, upsertConfig, deleteConfig } from '@/lib/sheets';

export async function GET(request, { params }) {
  if (!(await getAuthedRequestUser(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const event = await getConfigById(EVENTS_TAB, params.id);
  if (!event) return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 });
  return NextResponse.json({ event });
}

export async function PUT(request, { params }) {
  const user = await getAuthedRequestUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const existing = await getConfigById(EVENTS_TAB, params.id);
  if (!existing) return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 });
  const body = await request.json();
  const updated = {
    ...existing,
    title: body.title ?? existing.title,
    ownerName: body.ownerName ?? existing.ownerName ?? user.displayName,
    ownerEmail: body.ownerEmail ?? existing.ownerEmail ?? user.email,
    imageUrl: body.imageUrl ?? existing.imageUrl ?? '',
    sections: body.sections ?? existing.sections,
    questions: body.questions ?? existing.questions,
    linkedSurveyId: body.linkedSurveyId !== undefined ? body.linkedSurveyId : existing.linkedSurveyId,
  };
  await upsertConfig(EVENTS_TAB, updated);
  return NextResponse.json({ event: updated });
}

export async function DELETE(request, { params }) {
  if (!(await getAuthedRequestUser(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  await deleteConfig(EVENTS_TAB, params.id);
  return NextResponse.json({ ok: true });
}
