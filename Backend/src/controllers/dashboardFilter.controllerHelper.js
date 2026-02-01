function buildDateRangeFilter(query) {
  const { month, year } = query;

  // month wins if provided
  if (month !== undefined) {
    const m = String(month).trim();
    const match = /^(\d{4})-(\d{2})$/.exec(m);

    if (!match) {
      return { error: { status: 400, message: "month must be in YYYY-MM format (example: 2026-01)" } };
    }

    const y = Number(match[1]);
    const mm = Number(match[2]); // 1..12

    if (!Number.isInteger(y) || !Number.isInteger(mm) || mm < 1 || mm > 12) {
      return { error: { status: 400, message: "month must be a valid YYYY-MM (month 01 through 12)" } };
    }

    const startDate = new Date(y, mm - 1, 1);
    const endDate = new Date(y, mm, 1);

    return {
      dateFilter: { date: { $gte: startDate, $lt: endDate } },
      range: { type: "month", value: `${y}-${String(mm).padStart(2, "0")}` }
    };
  }

  // year filter
  if (year !== undefined) {
    const y = Number(String(year).trim());

    if (!Number.isInteger(y) || y < 1900 || y > 3000) {
      return { error: { status: 400, message: "year must be a 4-digit number (example: 2026)" } };
    }

    const startDate = new Date(y, 0, 1);      // Jan 1
    const endDate = new Date(y + 1, 0, 1);    // Jan 1 next year

    return {
      dateFilter: { date: { $gte: startDate, $lt: endDate } },
      range: { type: "year", value: y }
    };
  }

  // no date filter
  return null;
}
export default buildDateRangeFilter;