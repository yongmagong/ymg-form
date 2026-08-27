const KIND_LABELS = { pdf: 'PDF', html: 'HTML', md: 'Markdown', other: '파일' };

function attachmentKind(attachment) {
  if (attachment.kind) return attachment.kind;
  const name = (attachment.name || '').toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.md') || name.endsWith('.markdown')) return 'md';
  if (name.endsWith('.html') || name.endsWith('.htm')) return 'html';
  if (attachment.contentType === 'application/pdf') return 'pdf';
  if (attachment.contentType === 'text/html') return 'html';
  return 'other';
}

export { attachmentKind, KIND_LABELS };
