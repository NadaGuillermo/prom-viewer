import type { Colors } from "@utils/colors/types.d";
import { resolveColorConfig } from "@utils/colors/resolveColorConfig";
import { DEFAULT_COLOR_CONFIG } from "@utils/colors/defaultColors";

const COLOR_CONFIG_URL = "/config/colors.json";

// Never throws: any fetch/parse/validation failure falls back to
// DEFAULT_COLOR_CONFIG so the app always ends up with a complete config.
export async function loadColorConfig(): Promise<Colors.ColorConfig> {
  try {
    const response = await fetch(COLOR_CONFIG_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return resolveColorConfig(json);
  } catch (error) {
    console.error(
      "Error loading color config file, falling back to default colors:",
      error,
    );
    return DEFAULT_COLOR_CONFIG;
  }
}
