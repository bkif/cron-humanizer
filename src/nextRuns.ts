import { parseCronExpression } from "./cronToHuman.js";

export function getNextRuns(
  expr: string,
  count: number,
  fromDate: Date = new Date()
): Date[] {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`Count must be a positive integer, got ${count}`);
  }

  const parsed = parseCronExpression(expr);
  const minSet = new Set(parsed.minutes);
  const hourSet = new Set(parsed.hours);
  const domSet = new Set(parsed.doms);
  const monthSet = new Set(parsed.months);
  const dowSet = new Set(parsed.dows);

  const results: Date[] = [];
  const cursor = new Date(fromDate.getTime());
  cursor.setUTCSeconds(0, 0);
  cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);

  // Safety cap: 4 years of minutes (~2.1M iterations)
  const maxIterations = 4 * 366 * 24 * 60;
  for (let i = 0; i < maxIterations && results.length < count; i++) {
    const month = cursor.getUTCMonth() + 1;
    const dom = cursor.getUTCDate();
    const dow = cursor.getUTCDay();
    const hour = cursor.getUTCHours();
    const minute = cursor.getUTCMinutes();

    if (
      monthSet.has(month) &&
      domSet.has(dom) &&
      dowSet.has(dow) &&
      hourSet.has(hour) &&
      minSet.has(minute)
    ) {
      results.push(new Date(cursor.getTime()));
    }

    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
  }

  return results;
}
