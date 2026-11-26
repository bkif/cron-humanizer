const DOW_MAP: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

function parseTime(timeStr: string): { hour: number; minute: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
  if (!match) {
    throw new Error(`Invalid time format "${timeStr}", expected HH:MM`);
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error(`Time out of bounds: "${timeStr}"`);
  }
  return { hour, minute };
}

export function humanToCron(phrase: string): string {
  const normalized = phrase.trim().toLowerCase().replace(/\s+/g, " ");

  if (normalized === "every minute") {
    return "* * * * *";
  }

  const everyNMinutes = /^every (\d+) minutes?$/.exec(normalized);
  if (everyNMinutes) {
    const n = Number(everyNMinutes[1]);
    if (n < 1 || n > 59) {
      throw new Error(`Minute interval out of bounds [1, 59]: ${n}`);
    }
    return `*/${n} * * * *`;
  }

  const everyNHours = /^every (\d+) hours?$/.exec(normalized);
  if (everyNHours) {
    const n = Number(everyNHours[1]);
    if (n < 1 || n > 23) {
      throw new Error(`Hour interval out of bounds [1, 23]: ${n}`);
    }
    return `0 */${n} * * *`;
  }

  const everyDayAt = /^every day at (\d{1,2}:\d{2})$/.exec(normalized);
  if (everyDayAt) {
    const { hour, minute } = parseTime(everyDayAt[1]);
    return `${minute} ${hour} * * *`;
  }

  const everyWeekdayAt = /^every weekday at (\d{1,2}:\d{2})$/.exec(normalized);
  if (everyWeekdayAt) {
    const { hour, minute } = parseTime(everyWeekdayAt[1]);
    return `${minute} ${hour} * * 1-5`;
  }

  const everyDowAt = /^every ([a-z]+) at (\d{1,2}:\d{2})$/.exec(normalized);
  if (everyDowAt) {
    const dowName = everyDowAt[1];
    if (!(dowName in DOW_MAP)) {
      throw new Error(`Unknown day of week "${dowName}"`);
    }
    const { hour, minute } = parseTime(everyDowAt[2]);
    return `${minute} ${hour} * * ${DOW_MAP[dowName]}`;
  }

  throw new Error(`Unsupported natural schedule phrase: "${phrase}"`);
}
