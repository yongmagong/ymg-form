import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getAuthedRequestUser } from '@/lib/auth';

// Uploaded through our own server instead of straight from the browser to
// Vercel Blob: the direct client-upload path (@vercel/blob/client) hit a
// CORS/400 wall against https://vercel.com/api/blob that other developers
// have hit too with no fix. Proxying through our server avoids it, at the
// cost of Vercel's serverless request-body size limit (a few MB on Hobby).
function safeStorageName(filename) {
  const ext = (filename || '').split('.').pop()?.toLowerCase() || 'bin';
  return `attachment-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

export async function POST(request) {
  const user = await getAuthedRequestUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });

    const blob = await put(safeStorageName(file.name), file, { access: 'public' });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Blob upload failed', error);
    return NextResponse.json({ error: error.message || '업로드에 실패했습니다.' }, { status: 400 });
  }
}
