const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function normalizeDayToken(token: string): string | null {
  const t = token.trim().toLowerCase();
  return DAY_NAMES.find((d) => d.toLowerCase() === t) ?? null;
}

/** Parses free-text day fields like "Monday — Friday", "Saturday", or "Mon, Wed, Fri" and checks today's membership. */
export function daysStringIncludesToday(days: string, today: Date = new Date()): boolean {
  const todayName = DAY_NAMES[today.getDay()];
  const parts = days.split(",").map((p) => p.trim());

  for (const part of parts) {
    const rangeParts = part
      .split(/—|–|-|to/i)
      .map((p) => p.trim())
      .filter(Boolean);

    if (rangeParts.length === 2) {
      const start = normalizeDayToken(rangeParts[0]);
      const end = normalizeDayToken(rangeParts[1]);
      if (start && end) {
        const startIdx = DAY_NAMES.indexOf(start);
        const endIdx = DAY_NAMES.indexOf(end);
        const todayIdx = DAY_NAMES.indexOf(todayName);
        if (startIdx <= endIdx) {
          if (todayIdx >= startIdx && todayIdx <= endIdx) return true;
        } else if (todayIdx >= startIdx || todayIdx <= endIdx) {
          return true;
        }
        continue;
      }
    }

    if (normalizeDayToken(part) === todayName) return true;
  }

  return false;
}
