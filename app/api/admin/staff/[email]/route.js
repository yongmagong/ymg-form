import { NextResponse } from 'next/server';
import { getAuthedRequestUser } from '@/lib/auth';
import { STAFF_TAB, getConfigById, upsertConfig, deleteConfig } from '@/lib/sheets';

export async function PUT(request, { params }) {
  const user = await getAuthedRequestUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const email = decodeURIComponent(params.email).toLowerCase();
  const existing = await getConfigById(STAFF_TAB, email);
  if (!existing) return NextResponse.json({ error: '찾을 수 없음' }, { status: 404 });
  const body = await request.json();
  const status = body.status === 'blocked' ? 'blocked' : 'allowed';
  const updated = { ...existing, status };
  await upsertConfig(STAFF_TAB, updated);
  return NextResponse.json({ staffMember: updated });
}

export async function DELETE(request, { params }) {
  if (!(await getAuthedRequestUser(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const email = decodeURIComponent(params.email).toLowerCase();
  await deleteConfig(STAFF_TAB, email);
  return NextResponse.json({ ok: true });
}
