import { describe, expect, it } from "vitest";
import { cronToHuman, getNextRuns, humanToCron } from "../src/index.js";

describe("cronToHuman", () => {
  it("describes standard weekday schedule", () => {
    expect(cronToHuman("45 6 * * 1-5")).toBe("Every weekday at 06:45");
  });

  it("describes interval minutes", () => {
    expect(cronToHuman("*/15 * * * *")).toBe("Every 15 minutes");
  });

  it("rejects out-of-bounds fields", () => {
    expect(() => cronToHuman("60 0 * * *")).toThrow();
    expect(() => cronToHuman("0 24 * * *")).toThrow();
    expect(() => cronToHuman("0 0 32 * *")).toThrow();
    expect(() => cronToHuman("0 0 * 13 *")).toThrow();
  });
});

describe("humanToCron", () => {
  it("converts natural phrases to 5-field cron", () => {
    expect(humanToCron("every day at 07:30")).toBe("30 7 * * *");
    expect(humanToCron("every weekday at 06:45")).toBe("45 6 * * 1-5");
    expect(humanToCron("every 15 minutes")).toBe("*/15 * * * *");
    expect(humanToCron("every sunday at 20:00")).toBe("0 20 * * 0");
  });
});

describe("getNextRuns", () => {
  it("handles midnight rollover", () => {
    const ref = new Date("2026-01-01T23:50:00.000Z");
    const runs = getNextRuns("15 0 * * *", 2, ref);
    expect(runs[0].toISOString()).toBe("2026-01-02T00:15:00.000Z");
    expect(runs[1].toISOString()).toBe("2026-01-03T00:15:00.000Z");
  });

  it("handles leap year Feb 29", () => {
    const ref = new Date("2024-02-28T12:00:00.000Z");
    const runs = getNextRuns("0 8 29 2 *", 1, ref);
    expect(runs[0].toISOString()).toBe("2024-02-29T08:00:00.000Z");
  });
});
