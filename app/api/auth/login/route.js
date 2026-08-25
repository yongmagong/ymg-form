import { NextResponse } from 'next/server';
import { COOKIE_NAME, signToken, checkPassword } from '@/lib/auth';

export async function POST(request) {
  const { password } = await request.json();
  if (!checkPassword(password)) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, signToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
