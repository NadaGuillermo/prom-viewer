import type { DateFormat } from "./types.d";

export const ISO_DATE_FORMAT = "YYYY-MM-DD";

export const DEFAULT_DATE_FORMAT_CONFIG: DateFormat.DateFormatConfig = {
  date: {
    format: ISO_DATE_FORMAT,
  },
};
