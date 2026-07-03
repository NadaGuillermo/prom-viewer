import { ISO_DATE_FORMAT } from "./defaultDateFormat";

type DateToken = "YYYY" | "MM" | "DD";

const DATE_TOKENS: DateToken[] = ["YYYY", "MM", "DD"];
const SEPARATOR_CHARACTERS = [".", "-", "/", " "];

interface PatternSegment {
  type: "token" | "separator";
  value: string;
}

// Structural tokenizer instead of a single parsing regex: walks the pattern
// left to right, greedily matching a known token or a single allowed
// separator. Anything else (letters, e.g. a month name like "MMM"/"Jan") is
// unsupported and makes the pattern invalid.
function tokenizePattern(pattern: string): PatternSegment[] | null {
  const segments: PatternSegment[] = [];
  let index = 0;

  while (index < pattern.length) {
    const matchedToken = DATE_TOKENS.find((token) =>
      pattern.startsWith(token, index),
    );
    if (matchedToken) {
      segments.push({ type: "token", value: matchedToken });
      index += matchedToken.length;
      continue;
    }

    if (SEPARATOR_CHARACTERS.includes(pattern[index])) {
      segments.push({ type: "separator", value: pattern[index] });
      index += 1;
      continue;
    }

    return null;
  }

  return segments;
}

// A pattern is valid if it tokenizes cleanly and contains exactly one of
// each numeric token (YYYY, MM, DD) - no month names, no duplicated tokens.
export function isValidDateFormatPattern(pattern: unknown): pattern is string {
  if (typeof pattern !== "string" || pattern.length === 0) return false;

  const segments = tokenizePattern(pattern);
  if (!segments) return false;

  const tokenCounts: Partial<Record<DateToken, number>> = {};
  for (const segment of segments) {
    if (segment.type === "token") {
      const token = segment.value as DateToken;
      tokenCounts[token] = (tokenCounts[token] ?? 0) + 1;
    }
  }

  return DATE_TOKENS.every((token) => tokenCounts[token] === 1);
}

function getTokenValue(token: DateToken, date: Date): string {
  switch (token) {
    case "YYYY":
      return String(date.getUTCFullYear());
    case "MM":
      return String(date.getUTCMonth() + 1).padStart(2, "0");
    case "DD":
      return String(date.getUTCDate()).padStart(2, "0");
  }
}

// Formats an ISO date/date-time string according to `pattern`, using the
// Date object for actual date parsing/arithmetic rather than regex. Falls
// back to ISO (YYYY-MM-DD) if the pattern is invalid, and returns the raw
// input untouched if it isn't a parseable date - either way this never
// throws, so a bad config or a malformed "authored" value can't break
// mapping.
export function formatDate(isoDateString: string, pattern: string): string {
  const date = new Date(isoDateString);
  if (Number.isNaN(date.getTime())) {
    return isoDateString;
  }

  const effectivePattern = isValidDateFormatPattern(pattern)
    ? pattern
    : ISO_DATE_FORMAT;
  const segments = tokenizePattern(effectivePattern) ?? tokenizePattern(ISO_DATE_FORMAT)!;

  return segments
    .map((segment) =>
      segment.type === "token"
        ? getTokenValue(segment.value as DateToken, date)
        : segment.value,
    )
    .join("");
}

// Reverse of `formatDate`: builds a regex from `pattern`'s segments (each
// token becomes a capturing group of digits, each separator is matched
// literally) and reassembles the captured YYYY/MM/DD groups into an ISO
// date string. Falls back to ISO (YYYY-MM-DD) if the pattern is invalid,
// and returns the raw input untouched if it doesn't match the pattern -
// either way this never throws.
export function parseFormattedDate(formattedDateString: string, pattern: string): string {
  const effectivePattern = isValidDateFormatPattern(pattern)
    ? pattern
    : ISO_DATE_FORMAT;
  const segments = tokenizePattern(effectivePattern) ?? tokenizePattern(ISO_DATE_FORMAT)!;

  const tokenGroupCounts: Record<DateToken, number> = { YYYY: 4, MM: 2, DD: 2 };
  const tokenOrder: DateToken[] = [];
  const regexSource = segments
    .map((segment) => {
      if (segment.type === "token") {
        const token = segment.value as DateToken;
        tokenOrder.push(token);
        return `(\\d{${tokenGroupCounts[token]}})`;
      }
      return segment.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("");

  const match = new RegExp(`^${regexSource}$`).exec(formattedDateString);
  if (!match) {
    return formattedDateString;
  }

  const values: Partial<Record<DateToken, string>> = {};
  tokenOrder.forEach((token, index) => {
    values[token] = match[index + 1];
  });

  return `${values.YYYY}-${values.MM}-${values.DD}`;
}
