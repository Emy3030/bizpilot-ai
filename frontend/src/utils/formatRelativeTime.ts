export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (diffSeconds < 30) return 'just now';

  const thresholds: [number, number, string][] = [
    [60, 1, 'second'],
    [3600, 60, 'minute'],
    [86400, 3600, 'hour'],
    [604800, 86400, 'day'],
    [2629800, 604800, 'week'],
    [31557600, 2629800, 'month'],
    [Number.POSITIVE_INFINITY, 31557600, 'year'],
  ];

  for (const [max, divisor, label] of thresholds) {
    if (diffSeconds < max) {
      const value = Math.max(1, Math.floor(diffSeconds / divisor));
      return `${value} ${label}${value === 1 ? '' : 's'} ago`;
    }
  }

  return '';
}
