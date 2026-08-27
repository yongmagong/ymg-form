function recordCardHref(record) {
  if ((record.attachments || []).length > 0) return `/records/${record.id}/read/0`;
  return `/records/${record.id}`;
}

export { recordCardHref };
