function csvEscape(value) {
  const str = value === undefined || value === null ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Prefixes a UTF-8 BOM so Excel on Windows (what the center actually uses)
// renders Korean text correctly instead of garbling it.
function toCsv(headers, rows) {
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(','));
  }
  const BOM = '﻿';
  return BOM + lines.join('\r\n');
}

export { toCsv };
