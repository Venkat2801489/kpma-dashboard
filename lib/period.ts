export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type YearMonth = { year: number; month: number }; // month is 1-12

export type Period = {
  /** Inclusive list of every (year, month) covered — always at least one. */
  months: YearMonth[];
  /** Human-readable label for the header, e.g. "September 2026" or "Jan–Mar 2026". */
  label: string;
};

export function monthKey({ year, month }: YearMonth): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function currentYearMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function singleMonthPeriod(year: number, month: number): Period {
  return {
    months: [{ year, month }],
    label: `${MONTH_NAMES[month - 1]} ${year}`,
  };
}

/** Builds every (year, month) between two dates, inclusive, for custom ranges. */
export function rangePeriod(start: Date, end: Date): Period {
  const months: YearMonth[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= last) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  if (months.length === 0) {
    return singleMonthPeriod(start.getFullYear(), start.getMonth() + 1);
  }

  const first = months[0];
  const lastMonth = months[months.length - 1];
  const label =
    months.length === 1
      ? `${MONTH_NAMES[first.month - 1]} ${first.year}`
      : first.year === lastMonth.year
        ? `${MONTH_NAMES[first.month - 1]} – ${MONTH_NAMES[lastMonth.month - 1]} ${first.year}`
        : `${MONTH_NAMES[first.month - 1]} ${first.year} – ${MONTH_NAMES[lastMonth.month - 1]} ${lastMonth.year}`;

  return { months, label };
}

/**
 * Reads `year`+`month` (single month) or `start`+`end` (YYYY-MM, custom
 * range) from query params, defaulting to the current month.
 */
export function periodFromSearchParams(searchParams: URLSearchParams): Period {
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  if (start && end) {
    const [sy, sm] = start.split("-").map(Number);
    const [ey, em] = end.split("-").map(Number);
    if (sy && sm && ey && em) {
      return rangePeriod(new Date(sy, sm - 1, 1), new Date(ey, em - 1, 1));
    }
  }

  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  if (year && month) {
    return singleMonthPeriod(year, month);
  }

  const now = currentYearMonth();
  return singleMonthPeriod(now.year, now.month);
}

/** Last `count` months ending at (year, month), oldest first — for trend charts. */
export function trailingMonths(year: number, month: number, count: number): YearMonth[] {
  const result: YearMonth[] = [];
  const cursor = new Date(year, month - 1, 1);
  cursor.setMonth(cursor.getMonth() - (count - 1));
  for (let i = 0; i < count; i++) {
    result.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return result;
}
