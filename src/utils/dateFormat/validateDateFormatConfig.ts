import type * as DateFormat from "./types.d";
import { isValidDateFormatPattern } from "./dateFormatter";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Drops the whole "date" section if its format pattern is invalid, so an
// unparseable pattern falls back to the default instead of formatting dates
// incorrectly.
export function validateDateFormatConfig(
  input: unknown,
): DateFormat.PartialDateFormatConfig {
  if (!isRecord(input) || !isRecord(input.date)) return {};

  const format = input.date.format;
  if (!isValidDateFormatPattern(format)) return {};

  return { date: { format } };
}
