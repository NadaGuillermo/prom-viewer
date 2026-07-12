import type { DateFormat } from "@utils/dateFormat/types.d";
import { resolveDateFormatConfig } from "@utils/dateFormat/resolveDateFormatConfig";
import { DEFAULT_DATE_FORMAT_CONFIG } from "@utils/dateFormat/defaultDateFormat";
import { fetchJsonConfig } from "./fetchJsonConfig";

const DATE_FORMAT_CONFIG_URL = `${import.meta.env.BASE_URL}config/dateFormat.json`;

// Never throws: any fetch/parse/validation failure falls back to
// DEFAULT_DATE_FORMAT_CONFIG (ISO, YYYY-MM-DD).
export async function loadDateFormatConfig(): Promise<DateFormat.DateFormatConfig> {
  try {
    const json = await fetchJsonConfig(DATE_FORMAT_CONFIG_URL);
    return resolveDateFormatConfig(json);
  } catch (error) {
    console.error(
      "Error loading date format config file, falling back to default date format:",
      error,
    );
    return DEFAULT_DATE_FORMAT_CONFIG;
  }
}
