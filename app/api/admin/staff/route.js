import { NextResponse } from 'next/server';
import { getAuthedRequestUser } from '@/lib/auth';
import { STAFF_TAB, listConfig, getConfigById, upsertConfig } from '@/lib/sheets';

export async function GET(request) {
  const user = await getAuthedRequestUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const staff = await listConfig(STAFF_TAB);
  return NextResponse.json({ staff, currentUser: user });
}

export async function POST(request) {
  const user = await getAuthedRequestUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  const body = await request.json();
  const email = (body.email || '').trim().toLowerCase();
  if (!email) return NextResponse.json({ error: '이메일을 입력해 주세요.' }, { status: 400 });

  const existing = await getConfigById(STAFF_TAB, email);
  const now = new Date().toISOString();
  const entry = existing
    ? { ...existing, status: 'allowed', name: body.name || existing.name }
    : {
        id: email,
        email,
        name: body.name || '',
        status: 'allowed',
        source: 'manual',
        firstLoginAt: null,
        lastLoginAt: null,
        createdAt: now,
      };
  await upsertConfig(STAFF_TAB, entry);
  return NextResponse.json({ staffMember: entry });
}
