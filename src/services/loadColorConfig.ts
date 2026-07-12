import type { Colors } from "@utils/colors/types.d";
import { resolveColorConfig } from "@utils/colors/resolveColorConfig";
import { DEFAULT_COLOR_CONFIG } from "@utils/colors/defaultColors";
import { fetchJsonConfig } from "./fetchJsonConfig";

const COLOR_CONFIG_URL = `${import.meta.env.BASE_URL}config/colors.json`;

// Never throws: any fetch/parse/validation failure falls back to
// DEFAULT_COLOR_CONFIG so the app always ends up with a complete config.
export async function loadColorConfig(): Promise<Colors.ColorConfig> {
  try {
    const json = await fetchJsonConfig(COLOR_CONFIG_URL);
    return resolveColorConfig(json);
  } catch (error) {
    console.error(
      "Error loading color config file, falling back to default colors:",
      error,
    );
    return DEFAULT_COLOR_CONFIG;
  }
}
