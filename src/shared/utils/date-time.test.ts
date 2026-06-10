import { describe, expect, it } from "vitest";
import {
  formatBackendTimestampForDateTimeInput,
  formatBackendTimestampForDisplay,
  getCairoMonthKey,
  parseBackendTimestamp,
} from "./date-time";

describe("date-time Cairo presentation helpers", () => {
  it("parses backend UTC timestamps without changing the instant", () => {
    const parsed = parseBackendTimestamp("2026-05-02T19:00:00.000Z");

    expect(parsed).not.toBeNull();
    expect(parsed?.toISOString()).toBe("2026-05-02T19:00:00.000Z");
  });

  it("formats backend UTC timestamps in Cairo timezone without manual offsets", () => {
    expect(
      formatBackendTimestampForDisplay("2026-04-30T22:30:00.000Z", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    ).toBe("May 01, 2026, 01:30");
  });

  it("handles Cairo DST correctly across winter and summer timestamps", () => {
    expect(
      formatBackendTimestampForDisplay("2026-01-15T20:00:00.000Z", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    ).toBe("22:00");

    expect(
      formatBackendTimestampForDisplay("2026-07-01T20:00:00.000Z", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    ).toBe("23:00");
  });

  it("hydrates datetime-local edit values using Cairo local time", () => {
    expect(
      formatBackendTimestampForDateTimeInput("2026-04-30T22:30:00.000Z"),
    ).toBe("2026-05-01T01:30");
  });

  it("derives month keys using Cairo local month boundaries", () => {
    expect(getCairoMonthKey("2026-04-30T22:30:00.000Z")).toBe("2026-05");
    expect(getCairoMonthKey("2026-01-31T20:30:00.000Z")).toBe("2026-01");
  });
});
