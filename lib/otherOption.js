// Convention: an option written as "기타" or "기타:..." lets the respondent
// type their own answer instead of picking a fixed choice.
const OTHER_LABEL = '기타';

function isOtherOption(opt) {
  if (typeof opt !== 'string') return false;
  return opt.split(/[:：]/)[0].trim() === OTHER_LABEL;
}

function formatOtherAnswer(text) {
  const trimmed = (text || '').trim();
  return trimmed ? `${OTHER_LABEL}: ${trimmed}` : OTHER_LABEL;
}

function extractOtherText(value) {
  if (typeof value !== 'string') return '';
  const match = value.match(/^기타\s*[:：]\s*(.*)$/);
  return match ? match[1] : '';
}

export { isOtherOption, formatOtherAnswer, extractOtherText };
