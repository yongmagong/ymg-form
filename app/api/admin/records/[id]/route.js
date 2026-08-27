import { NextResponse } from 'next/server';
import { getAuthedRequestUser } from '@/lib/auth';
import { validateInlineImage } from '@/lib/imageData';
import { RECORDS_TAB, getConfigById, upsertConfig, deleteConfig } from '@/lib/sheets';

function validateRecordImages(record) {
  validateInlineImage(record.imageUrl);
  (record.images || []).forEach((url) => validateInlineImage(url));
}

export async function GET(request, { params }) {
  if (!(await getAuthedRequestUser(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const record = await getConfigById(RECORDS_TAB, params.id);
  if (!record) return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 });
  return NextResponse.json({ record });
}

export async function PUT(request, { params }) {
  const user = await getAuthedRequestUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const existing = await getConfigById(RECORDS_TAB, params.id);
  if (!existing) return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 });
  const body = await request.json();
  const updated = {
    ...existing,
    title: body.title ?? existing.title,
    ownerName: body.ownerName ?? existing.ownerName ?? user.displayName,
    ownerEmail: body.ownerEmail ?? existing.ownerEmail ?? user.email,
    linkedEventId: body.linkedEventId !== undefined ? body.linkedEventId : existing.linkedEventId,
    imageUrl: body.imageUrl ?? existing.imageUrl ?? '',
    sections: body.sections ?? existing.sections,
    images: body.images ?? existing.images ?? [],
    published: body.published !== undefined ? !!body.published : existing.published ?? false,
  };
  validateRecordImages(updated);
  await upsertConfig(RECORDS_TAB, updated);
  return NextResponse.json({ record: updated });
}

export async function DELETE(request, { params }) {
  if (!(await getAuthedRequestUser(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  await deleteConfig(RECORDS_TAB, params.id);
  return NextResponse.json({ ok: true });
}
