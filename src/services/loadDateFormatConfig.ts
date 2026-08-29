import type * as DateFormat from "@utils/dateFormat/types.d";
import { resolveDateFormatConfig } from "@utils/dateFormat/resolveDateFormatConfig";
import { DEFAULT_DATE_FORMAT_CONFIG } from "@utils/dateFormat/defaultDateFormat";
import { fetchJsonConfig, resolveConfigUrl } from "./fetchJsonConfig";

// Never throws: any fetch/parse/validation failure falls back to
// DEFAULT_DATE_FORMAT_CONFIG (ISO, YYYY-MM-DD).
export async function loadDateFormatConfig(): Promise<DateFormat.DateFormatConfig> {
  try {
    const json = await fetchJsonConfig(resolveConfigUrl("dateFormat.json"));
    return resolveDateFormatConfig(json);
  } catch (error) {
    console.error(
      "Error loading date format config file, falling back to default date format:",
      error,
    );
    return DEFAULT_DATE_FORMAT_CONFIG;
  }
}
