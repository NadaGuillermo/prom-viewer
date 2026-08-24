import { describe, expect, it } from "vitest";

import {
  formatDate,
  isValidDateFormatPattern,
  parseFormattedDate,
} from "@utils/dateFormat/dateFormatter";

describe("isValidDateFormatPattern", () => {
  it("accepts a pattern with all three tokens separated by dots", () => {
    expect(isValidDateFormatPattern("DD.MM.YYYY")).toBe(true);
  });

  it("accepts a pattern with all three tokens separated by dashes", () => {
    expect(isValidDateFormatPattern("YYYY-MM-DD")).toBe(true);
  });

  it("accepts a pattern with all three tokens separated by slashes", () => {
    expect(isValidDateFormatPattern("MM/DD/YYYY")).toBe(true);
  });

  it("accepts a pattern with tokens separated by spaces", () => {
    expect(isValidDateFormatPattern("DD MM YYYY")).toBe(true);
  });

  it("rejects a pattern missing a token", () => {
    expect(isValidDateFormatPattern("MM-DD")).toBe(false);
  });

  it("rejects a pattern with a duplicated token", () => {
    expect(isValidDateFormatPattern("YYYY-YYYY-DD")).toBe(false);
  });

  it("rejects a pattern with an unsupported token like a month name", () => {
    expect(isValidDateFormatPattern("DD-MMM-YYYY")).toBe(false);
  });

  it("rejects a pattern with a disallowed separator character", () => {
    expect(isValidDateFormatPattern("DD_MM_YYYY")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidDateFormatPattern("")).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(isValidDateFormatPattern(undefined)).toBe(false);
    expect(isValidDateFormatPattern(null)).toBe(false);
    expect(isValidDateFormatPattern(42)).toBe(false);
  });
});

describe("formatDate", () => {
  it("formats an ISO date string with a dot-separated pattern", () => {
    expect(formatDate("2024-03-07", "DD.MM.YYYY")).toBe("07.03.2024");
  });

  it("formats an ISO date-time string using the UTC date components", () => {
    expect(formatDate("2024-03-07T23:15:00Z", "YYYY-MM-DD")).toBe(
      "2024-03-07",
    );
  });

  it("pads single-digit month and day values", () => {
    expect(formatDate("2024-01-05", "DD/MM/YYYY")).toBe("05/01/2024");
  });

  it("falls back to ISO format when the pattern is invalid", () => {
    expect(formatDate("2024-03-07", "DD-MMM-YYYY")).toBe("2024-03-07");
  });

  it("returns the raw input when the date string cannot be parsed", () => {
    expect(formatDate("not-a-date", "DD.MM.YYYY")).toBe("not-a-date");
  });
});

describe("parseFormattedDate", () => {
  it("parses a dot-separated formatted date into ISO format", () => {
    expect(parseFormattedDate("07.03.2024", "DD.MM.YYYY")).toBe("2024-03-07");
  });

  it("parses a slash-separated formatted date into ISO format", () => {
    expect(parseFormattedDate("03/07/2024", "MM/DD/YYYY")).toBe("2024-03-07");
  });

  it("is the inverse of formatDate for a valid pattern", () => {
    const pattern = "DD-MM-YYYY";
    const formatted = formatDate("2024-03-07", pattern);
    expect(parseFormattedDate(formatted, pattern)).toBe("2024-03-07");
  });

  it("falls back to ISO pattern when the given pattern is invalid", () => {
    expect(parseFormattedDate("2024-03-07", "DD-MMM-YYYY")).toBe(
      "2024-03-07",
    );
  });

  it("returns the raw input when it does not match the pattern", () => {
    expect(parseFormattedDate("not-a-date", "DD.MM.YYYY")).toBe("not-a-date");
  });
});
