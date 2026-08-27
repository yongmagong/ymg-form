const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function computeEventStatus(event, appliedCount = 0) {
  const now = new Date();

  if (event.recruitEnd) {
    const end = new Date(`${event.recruitEnd}T23:59:59+09:00`);
    if (!Number.isNaN(end.getTime()) && now > end) {
      return { label: '모집종료', closed: true };
    }
  }

  const capacity = Number(event.capacity) || 0;
  if (capacity > 0 && appliedCount >= capacity) {
    return { label: '모집종료', closed: true };
  }

  return { label: '모집중', closed: false };
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}(${WEEKDAYS[date.getDay()]})`;
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${formatDate(value)} ${hh}:${mm}`;
}

function formatDateRange(start, end) {
  if (!start) return '';
  const startText = formatDateTime(start);
  if (!end) return startText;
  const sameDay = String(start).slice(0, 10) === String(end).slice(0, 10);
  const endText = sameDay ? formatDateTime(end).split(' ')[1] : formatDateTime(end);
  return `${startText} ~ ${endText}`;
}

function formatRecruitPeriod(start, end) {
  if (!start && !end) return '';
  if (start && end) return `${formatDate(start)} ~ ${formatDate(end)}`;
  return formatDate(start || end);
}

export { computeEventStatus, formatDate, formatDateTime, formatDateRange, formatRecruitPeriod };
