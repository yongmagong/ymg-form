import { marked } from 'marked';
import { RECORDS_TAB, getConfigById } from '@/lib/sheets';
import { attachmentKind, KIND_LABELS } from '@/lib/attachmentKind';
import SiteHeader from '../../../../SiteHeader';

export const dynamic = 'force-dynamic';

export default async function RecordAttachmentReaderPage({ params }) {
  const record = await getConfigById(RECORDS_TAB, params.id);
  const attachment = record?.published ? (record.attachments || [])[Number(params.index)] : null;

  if (!record || !record.published || !attachment) {
    return (
      <main className="min-h-screen">
        <SiteHeader />
        <div className="flex items-center justify-center p-6">
          <p className="text-gray-500">존재하지 않는 첨부파일입니다.</p>
        </div>
      </main>
    );
  }

  const kind = attachmentKind(attachment);
  const inlineHref = `/records/${record.id}/raw/${params.index}`;
  const downloadHref = `${inlineHref}?download=1`;

  // Reading material stays on screen; the PDF next to it is what people take
  // home. Surfaced here because the records list links straight to this page.
  const downloads = (record.attachments || [])
    .map((a, i) => ({ ...a, index: i }))
    .filter((a) => attachmentKind(a) === 'pdf');

  let mdHtml = '';
  if (kind === 'md') {
    try {
      const res = await fetch(attachment.url, { cache: 'no-store' });
      mdHtml = marked.parse(await res.text());
    } catch (error) {
      console.error('Failed to load markdown attachment', error);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <SiteHeader />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <a href={`/records/${record.id}`} className="text-sm text-gray-500 hover:text-brand-600 truncate">
            ← {record.title}
          </a>
          {downloads.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {downloads.map((a) => (
                <a
                  key={a.index}
                  href={`/records/${record.id}/raw/${a.index}?download=1`}
                  className="btn-secondary text-sm whitespace-nowrap"
                >
                  ⬇ {downloads.length > 1 ? a.name : 'PDF 내려받기'}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-xs text-gray-400">{KIND_LABELS[kind]}</p>
            <h1 className="font-bold text-lg">{attachment.name}</h1>
          </div>

          {kind === 'html' && (
            <iframe
              src={`/records/${record.id}/raw/${params.index}`}
              title={attachment.name}
              sandbox="allow-scripts allow-popups"
              className="w-full h-[80vh] bg-white"
            />
          )}

          {kind === 'md' && (
            <article
              className="markdown-view mx-auto px-8 py-10"
              style={{ maxWidth: '46rem' }}
              dangerouslySetInnerHTML={{ __html: mdHtml }}
            />
          )}

          {/* No sandbox here on purpose: the browser's built-in PDF viewer is
              what renders this, and sandboxing stops it from loading. */}
          {kind === 'pdf' && (
            <>
              <iframe src={inlineHref} title={attachment.name} className="w-full h-[80vh] bg-gray-50" />
              <div className="px-6 py-3 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">
                  화면에 문서가 보이지 않으면{' '}
                  <a href={inlineHref} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                    새 탭에서 열기
                  </a>
                  를 눌러주세요. 휴대폰에서는 이 방법이 더 잘 보입니다.
                </p>
              </div>
            </>
          )}

          {kind === 'other' && (
            <div className="p-10 text-center space-y-4">
              <p className="text-gray-500 text-sm">내려받아 보실 수 있는 자료입니다.</p>
              <a href={downloadHref} className="btn-primary inline-block">
                ⬇ 내려받기
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
