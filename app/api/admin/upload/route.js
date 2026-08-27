import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getAuthedRequestUser } from '@/lib/auth';

const ALLOWED_TYPES = ['application/pdf', 'text/html'];

export async function POST(request) {
  const user = await getAuthedRequestUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => ({
        allowedContentTypes: ALLOWED_TYPES,
        addRandomSuffix: true,
        maximumSizeInBytes: 25 * 1024 * 1024,
      }),
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Blob upload failed', error);
    return NextResponse.json({ error: error.message || '업로드에 실패했습니다.' }, { status: 400 });
  }
}
