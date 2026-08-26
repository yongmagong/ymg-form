import { NextResponse } from 'next/server';
import { getAuthedRequestUser } from '@/lib/auth';
import { SURVEYS_TAB, getConfigById, upsertConfig, deleteConfig } from '@/lib/sheets';

export async function GET(request, { params }) {
  if (!(await getAuthedRequestUser(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const survey = await getConfigById(SURVEYS_TAB, params.id);
  if (!survey) return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 });
  return NextResponse.json({ survey });
}

export async function PUT(request, { params }) {
  const user = await getAuthedRequestUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const existing = await getConfigById(SURVEYS_TAB, params.id);
  if (!existing) return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 });
  const body = await request.json();
  const updated = {
    ...existing,
    title: body.title ?? existing.title,
    ownerName: body.ownerName ?? existing.ownerName ?? user.displayName,
    ownerEmail: body.ownerEmail ?? existing.ownerEmail ?? user.email,
    intro: body.intro ?? existing.intro,
    questions:
      body.questions?.map((q, i) => ({
        id: q.id || `q_${i}_${Math.random().toString(36).slice(2, 8)}`,
        text: q.text || `질문 ${i + 1}`,
        type: q.type || 'single',
        options: q.options || [],
        imageUrl: q.imageUrl || '',
        hasImage: !!q.hasImage,
        description: q.description || '',
        defaultChecked: !!q.defaultChecked,
        lowLabel: q.lowLabel,
        highLabel: q.highLabel,
        required: q.required !== false,
      })) ?? existing.questions,
    linkedEventId: body.linkedEventId !== undefined ? body.linkedEventId : existing.linkedEventId,
  };
  await upsertConfig(SURVEYS_TAB, updated);
  return NextResponse.json({ survey: updated });
}

export async function DELETE(request, { params }) {
  if (!(await getAuthedRequestUser(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  await deleteConfig(SURVEYS_TAB, params.id);
  return NextResponse.json({ ok: true });
}
