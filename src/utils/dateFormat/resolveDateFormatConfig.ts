import type * as DateFormat from "./types.d";
import { DEFAULT_DATE_FORMAT_CONFIG } from "./defaultDateFormat";
import { validateDateFormatConfig } from "./validateDateFormatConfig";

// Merges a validated partial config onto the defaults so the result always
// has a valid format, even if dateFormat.json only overrides part of it.
export function resolveDateFormatConfig(
  input: unknown,
): DateFormat.DateFormatConfig {
  const partial = validateDateFormatConfig(input);

  return {
    date: {
      ...DEFAULT_DATE_FORMAT_CONFIG.date,
      ...partial.date,
    },
  };
}
