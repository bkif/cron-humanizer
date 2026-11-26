export interface ParsedCronFields {
  minutes: number[];
  hours: number[];
  doms: number[];
  months: number[];
  dows: number[];
}

const MONTH_NAMES = [
  "",
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

const DOW_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function parseField(
  token: string,
  min: number,
  max: number,
  allowSevenAsZero = false
): number[] {
  const values = new Set<number>();
  const parts = token.split(",");

  for (const part of parts) {
    if (!part) {
      throw new Error(`Empty cron field segment in "${token}"`);
    }
    const [rangePart, stepPart] = part.split("/");
    if (part.split("/").length > 2) {
      throw new Error(`Invalid step syntax in "${part}"`);
    }

    const step = stepPart !== undefined ? Number(stepPart) : 1;
    if (!Number.isInteger(step) || step <= 0) {
      throw new Error(`Invalid step "${stepPart}" in "${part}"`);
    }

    let start: number;
    let end: number;

    if (rangePart === "*") {
      start = min;
      end = max;
    } else if (rangePart.includes("-")) {
      const [sStr, eStr] = rangePart.split("-");
      start = Number(sStr);
      end = Number(eStr);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
        throw new Error(`Invalid range "${rangePart}"`);
      }
    } else {
      start = Number(rangePart);
      end = start;
      if (!Number.isInteger(start)) {
        throw new Error(`Invalid value "${rangePart}"`);
      }
    }

    if (start < min || end > max) {
      throw new Error(
        `Value out of bounds [${min}, ${max}] in "${part}"`
      );
    }

    for (let v = start; v <= end; v += step) {
      values.add(allowSevenAsZero && v === 7 ? 0 : v);
    }
  }

  return Array.from(values).sort((a, b) => a - b);
}

export function parseCronExpression(expr: string): ParsedCronFields {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(
      `Expected 5-field cron expression, got ${parts.length} fields`
    );
  }

  return {
    minutes: parseField(parts[0], 0, 59),
    hours: parseField(parts[1], 0, 23),
    doms: parseField(parts[2], 1, 31),
    months: parseField(parts[3], 1, 12),
    dows: parseField(parts[4], 0, 7, true),
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function cronToHuman(expr: string): string {
  const parsed = parseCronExpression(expr);
  const parts = expr.trim().split(/\s+/);
  const [minTok, hourTok, domTok, monthTok, dowTok] = parts;

  if (minTok === "*" && hourTok === "*" && domTok === "*" && monthTok === "*" && dowTok === "*") {
    return "Every minute";
  }

  if (minTok.startsWith("*/") && hourTok === "*" && domTok === "*" && monthTok === "*" && dowTok === "*") {
    const step = Number(minTok.slice(2));
    return `Every ${step} minutes`;
  }

  let timeStr = "";
  if (parsed.minutes.length === 1 && parsed.hours.length === 1) {
    timeStr = `at ${pad2(parsed.hours[0])}:${pad2(parsed.minutes[0])}`;
  } else if (minTok === "0" && hourTok.startsWith("*/")) {
    timeStr = `every ${hourTok.slice(2)} hours`;
  } else {
    timeStr = `at minute ${minTok} of hour ${hourTok}`;
  }

  let dayStr = "every day";
  if (dowTok === "1-5" && domTok === "*") {
    dayStr = "every weekday";
  } else if (dowTok !== "*" && domTok === "*") {
    dayStr = `on ${parsed.dows.map((d) => DOW_NAMES[d]).join(", ")}`;
  } else if (domTok !== "*" && dowTok === "*") {
    dayStr = `on day ${parsed.doms.join(", ")} of the month`;
  }

  let monthStr = "";
  if (monthTok !== "*") {
    monthStr = ` in ${parsed.months.map((m) => MONTH_NAMES[m]).join(", ")}`;
  }

  const combined = `${dayStr} ${timeStr}${monthStr}`.trim();
  return combined.charAt(0).toUpperCase() + combined.slice(1);
}
