import type * as DateFormat from "./types.d";
import { DEFAULT_DATE_FORMAT_CONFIG } from "./defaultDateFormat";

// Mutated once at boot (see main.tsx) before the mapping pipeline ever runs,
// mirroring how chart colors are applied in @utils/charts/chartColors.
let currentDateFormatConfig: DateFormat.DateFormatConfig =
  DEFAULT_DATE_FORMAT_CONFIG;

export function applyDateFormatConfig(config: DateFormat.DateFormatConfig): void {
  currentDateFormatConfig = config;
}

export function getDateFormatPattern(): string {
  return currentDateFormatConfig.date.format;
}
