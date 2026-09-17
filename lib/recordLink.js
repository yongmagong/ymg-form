import { attachmentKind } from '@/lib/attachmentKind';

// Cards jump straight into the readable attachment when there is one. A record
// that only carries downloads (a PDF on its own) goes to its detail page, so
// the visitor sees what they are about to download before it starts.
function recordCardHref(record) {
  const attachments = record.attachments || [];
  // A record with both lands on the write-up, not the PDF of the same thing.
  const readable =
    attachments.findIndex((a) => ['html', 'md'].includes(attachmentKind(a)));
  const index = readable >= 0 ? readable : attachments.findIndex((a) => attachmentKind(a) === 'pdf');
  if (index >= 0) return `/records/${record.id}/read/${index}`;
  return `/records/${record.id}`;
}

export { recordCardHref };
