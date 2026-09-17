import { attachmentKind } from '@/lib/attachmentKind';

// Cards jump straight into the readable attachment when there is one. A record
// that only carries downloads (a PDF on its own) goes to its detail page, so
// the visitor sees what they are about to download before it starts.
function recordCardHref(record) {
  const readableIndex = (record.attachments || []).findIndex((a) => ['html', 'md'].includes(attachmentKind(a)));
  if (readableIndex >= 0) return `/records/${record.id}/read/${readableIndex}`;
  return `/records/${record.id}`;
}

export { recordCardHref };
