import type { Colors } from "./types.d";
import { DEFAULT_THEME_COLORS, DEFAULT_CATEGORICAL_PALETTES } from "./defaultColors";

const THEME_KEYS = Object.keys(DEFAULT_THEME_COLORS) as Array<
  keyof Colors.ThemeColors
>;
const PALETTE_KEYS = Object.keys(DEFAULT_CATEGORICAL_PALETTES) as Array<
  keyof Colors.CategoricalPalettes
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

// Drops unknown or malformed fields instead of rejecting the whole config,
// so a partially-broken colors.json still improves on the defaults.
function validateThemeColors(
  value: unknown,
): Colors.PartialThemeColors | undefined {
  if (!isRecord(value)) return undefined;
  const theme: Colors.PartialThemeColors = {};
  for (const key of THEME_KEYS) {
    const candidate = value[key];
    if (isNonEmptyString(candidate)) {
      theme[key] = candidate;
    }
  }
  return theme;
}

function validateCategoricalPalettes(
  value: unknown,
): Partial<Colors.CategoricalPalettes> | undefined {
  if (!isRecord(value)) return undefined;
  const palettes: Partial<Colors.CategoricalPalettes> = {};
  for (const key of PALETTE_KEYS) {
    const candidate = value[key];
    if (isStringArray(candidate)) {
      palettes[key] = candidate;
    }
  }
  return palettes;
}

export function validateColorConfig(input: unknown): Colors.PartialColorConfig {
  if (!isRecord(input)) return {};

  const theme = validateThemeColors(input.theme);
  const categoricalPalettes = isRecord(input.charts)
    ? validateCategoricalPalettes(input.charts.categoricalPalettes)
    : undefined;

  return {
    ...(theme && { theme }),
    ...(categoricalPalettes && { charts: { categoricalPalettes } }),
  };
}
