import { RECORDS_TAB, getConfigById } from '@/lib/sheets';
import { attachmentKind } from '@/lib/attachmentKind';

export const dynamic = 'force-dynamic';

// Vercel Blob serves every uploaded file with `content-security-policy:
// default-src 'none'`, which kills inline <script> and data: images inside an
// uploaded HTML file (and HTML is sent as content-disposition: attachment).
// So we stream the file through our own origin instead of pointing the reader
// iframe at the blob URL directly. The iframe sandbox does the isolating.
export async function GET(request, { params }) {
  const record = await getConfigById(RECORDS_TAB, params.id);
  const attachment = record?.published ? (record.attachments || [])[Number(params.index)] : null;

  if (!attachment || attachmentKind(attachment) !== 'html') {
    return new Response('not found', { status: 404 });
  }

  let html;
  try {
    const res = await fetch(attachment.url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`blob responded ${res.status}`);
    html = await res.text();
  } catch (error) {
    console.error('Failed to load html attachment', error);
    return new Response('첨부파일을 불러오지 못했습니다.', { status: 502 });
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
