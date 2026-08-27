import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getAuthedRequestUser } from '@/lib/auth';
import { validateInlineImage } from '@/lib/imageData';
import { RECORDS_TAB, listConfig, upsertConfig } from '@/lib/sheets';

function validateRecordImages(record) {
  validateInlineImage(record.imageUrl);
  (record.images || []).forEach((url) => validateInlineImage(url));
}

export async function GET(request) {
  const user = await getAuthedRequestUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  try {
    const records = await listConfig(RECORDS_TAB);
    return NextResponse.json({ records, currentUser: user });
  } catch (error) {
    console.error('Failed to load records', error);
    return NextResponse.json(
      { error: '구글시트 설정을 확인해 주세요. GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID가 필요합니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const user = await getAuthedRequestUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  try {
    const body = await request.json();
    if (body.copyFromId) {
      const source = await listConfig(RECORDS_TAB).then((records) => records.find((item) => item.id === body.copyFromId));
      if (!source) return NextResponse.json({ error: '복사할 기록을 찾을 수 없습니다.' }, { status: 404 });
      const copied = {
        ...JSON.parse(JSON.stringify(source)),
        id: crypto.randomUUID(),
        title: `${source.title} 복사본`,
        ownerName: body.ownerName || user.displayName,
        ownerEmail: user.email,
        createdByEmail: user.email,
        createdByName: user.displayName,
        createdAt: new Date().toISOString(),
      };
      validateRecordImages(copied);
      await upsertConfig(RECORDS_TAB, copied);
      return NextResponse.json({ record: copied });
    }

    const record = {
      id: crypto.randomUUID(),
      title: body.title || '제목 없음',
      ownerName: body.ownerName || user.displayName,
      ownerEmail: user.email,
      createdByEmail: user.email,
      createdByName: user.displayName,
      linkedEventId: body.linkedEventId || '',
      imageUrl: body.imageUrl || '',
      sections: body.sections || [],
      images: body.images || [],
      attachments: body.attachments || [],
      published: body.published !== undefined ? !!body.published : true,
      createdAt: new Date().toISOString(),
    };
    validateRecordImages(record);
    await upsertConfig(RECORDS_TAB, record);
    return NextResponse.json({ record });
  } catch (error) {
    console.error('Failed to create record', error);
    return NextResponse.json(
      { error: error.message || '기록을 만들 수 없습니다. 구글시트 연동 환경변수를 확인해 주세요.' },
      { status: 500 }
    );
  }
}
