import { NextResponse } from 'next/server';
import { getAuthedRequestUser } from '@/lib/auth';
import { sheetUrl } from '@/lib/sheets';

export async function GET(request) {
  if (!(await getAuthedRequestUser(request))) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  return NextResponse.json({ url: sheetUrl() });
}
