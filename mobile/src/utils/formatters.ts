import i18n from '@i18n/index';

/** "3945" -> "1:05:45" or "245" -> "4:05" */
export function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function formatDayLabel(dayOfWeek: number): string {
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const key = dayKeys[dayOfWeek];
  return key ? i18n.t(`common.days.${key}`) : '';
}

/** "14:30:00" -> "2:30 PM" */
export function formatTimeOfDay(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}

const MONTH_KEYS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

/** "August 3, 2026" — independent of date-fns's locale system for the same reason as below. */
export function formatFullDate(date: Date): string {
  const month = i18n.t(`common.months.${MONTH_KEYS[date.getMonth()]}`);
  return `${month} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * "15 August 2026" — the day-first form used in article credits. Parsed as a plain
 * calendar date: report_date is a DATE column with no time or zone, so reading it with
 * `new Date()` in a timezone behind UTC would shift it back a day.
 */
export function formatDayMonthYear(input: string | Date): string {
  let year: number;
  let monthIndex: number;
  let day: number;

  if (typeof input === 'string') {
    const [datePart] = input.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    if (!y || !m || !d) return '';
    year = y; monthIndex = m - 1; day = d;
  } else {
    year = input.getFullYear(); monthIndex = input.getMonth(); day = input.getDate();
  }

  const month = i18n.t(`common.months.${MONTH_KEYS[monthIndex]}`);
  return `${day} ${month} ${year}`;
}

/**
 * Short relative-time label ("3h ago", "2d ago"). Written independently of date-fns's
 * locale system, which has no data for Nyanja/Chitonga — this always routes through
 * i18next so it translates into whatever language is active.
 */
export function formatRelativeTime(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return i18n.t('common.timeAgo.justNow');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return i18n.t('common.timeAgo.minutes', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return i18n.t('common.timeAgo.hours', { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return i18n.t('common.timeAgo.days', { count: days });
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return i18n.t('common.timeAgo.weeks', { count: weeks });
  const months = Math.floor(days / 30);
  if (months < 12) return i18n.t('common.timeAgo.months', { count: months });
  const years = Math.floor(days / 365);
  return i18n.t('common.timeAgo.years', { count: years });
}
