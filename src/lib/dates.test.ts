import { describe, expect, it } from "vitest";

import { formatDateInputValue, parseDateInputValue } from "@/lib/dates";

describe("formatDateInputValue", () => {
  it("formats using local date parts, zero-padded", () => {
    expect(formatDateInputValue(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(formatDateInputValue(new Date(2026, 9, 31))).toBe("2026-10-31");
  });
});

describe("parseDateInputValue", () => {
  it("parses a YYYY-MM-DD value", () => {
    const date = parseDateInputValue("2026-03-14");
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(2);
    expect(date?.getDate()).toBe(14);
  });

  it("rejects malformed input", () => {
    expect(parseDateInputValue("")).toBeUndefined();
    expect(parseDateInputValue("14/03/2026")).toBeUndefined();
    expect(parseDateInputValue("not-a-date")).toBeUndefined();
  });

  it("round-trips with formatDateInputValue", () => {
    const original = new Date(2026, 5, 20);
    const formatted = formatDateInputValue(original);
    const parsed = parseDateInputValue(formatted);
    expect(parsed && formatDateInputValue(parsed)).toBe(formatted);
  });
});
