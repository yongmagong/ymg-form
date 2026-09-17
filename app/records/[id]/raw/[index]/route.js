import { RECORDS_TAB, getConfigById } from '@/lib/sheets';
import { attachmentKind } from '@/lib/attachmentKind';

export const dynamic = 'force-dynamic';

const CONTENT_TYPES = {
  pdf: 'application/pdf',
  html: 'text/html; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
  other: 'application/octet-stream',
};

// Vercel Blob serves every uploaded file with `content-security-policy:
// default-src 'none'`, which kills inline <script> and data: images inside an
// uploaded HTML file (and HTML is sent as content-disposition: attachment).
// It also stores files under a generated ASCII name, because Blob rejects
// non-ASCII pathnames — so a direct blob download saves as "attachment-x9f2.pdf"
// instead of the Korean name the staff uploaded. Serving through our own origin
// fixes both. The reader iframe sandbox does the isolating.
export async function GET(request, { params }) {
  const record = await getConfigById(RECORDS_TAB, params.id);
  const attachment = record?.published ? (record.attachments || [])[Number(params.index)] : null;
  if (!attachment) return new Response('not found', { status: 404 });

  const kind = attachmentKind(attachment);
  const download = new URL(request.url).searchParams.get('download') === '1';

  // Without ?download=1 this only renders HTML inline. Everything else is a
  // download, so there is no way to frame a PDF or an unknown file type here.
  if (!download && kind !== 'html') return new Response('not found', { status: 404 });

  let upstream;
  try {
    upstream = await fetch(attachment.url, { cache: 'no-store' });
    if (!upstream.ok) throw new Error(`blob responded ${upstream.status}`);
  } catch (error) {
    console.error('Failed to load attachment', error);
    return new Response('첨부파일을 불러오지 못했습니다.', { status: 502 });
  }

  const headers = {
    'Content-Type': CONTENT_TYPES[kind] || CONTENT_TYPES.other,
    'Cache-Control': 'public, max-age=300',
  };
  if (download) {
    // filename* carries the original Korean name. The plain filename is the
    // ASCII fallback for clients that ignore filename*, so it gets stripped
    // rather than percent-encoded — a readable name beats %EC%A3%BC%EB%AF%BC.
    const name = attachment.name || `attachment.${kind}`;
    const ascii = name.replace(/[^\x20-\x7E]/g, '').replace(/["\\]/g, '').trim() || `attachment.${kind}`;
    headers['Content-Disposition'] = `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
  }
  const length = upstream.headers.get('content-length');
  if (length) headers['Content-Length'] = length;

  // Streamed, not buffered: attachments can be up to 200MB.
  return new Response(upstream.body, { headers });
}
