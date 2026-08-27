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
        <div className="flex items-center justify-between gap-3">
          <a href={`/records/${record.id}`} className="text-sm text-gray-500 hover:text-brand-600 truncate">
            ← {record.title}
          </a>
          <a href={attachment.url} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline whitespace-nowrap">
            파일 다운로드
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-xs text-gray-400">{KIND_LABELS[kind]}</p>
            <h1 className="font-bold text-lg">{attachment.name}</h1>
          </div>

          {kind === 'pdf' && <iframe src={attachment.url} title={attachment.name} className="w-full h-[80vh]" />}

          {kind === 'html' && (
            <iframe
              src={attachment.url}
              title={attachment.name}
              sandbox="allow-scripts allow-same-origin"
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

          {kind === 'other' && (
            <div className="p-10 text-center text-gray-400 text-sm">
              이 파일 형식은 미리보기를 지원하지 않습니다. 위의 "파일 다운로드"를 이용해 주세요.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
