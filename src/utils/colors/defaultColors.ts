import type { Colors } from "./types.d";

// Mirrors the "prolight" daisyUI theme defined in src/index.css.
// Used whenever /config/colors.json is missing, unreachable, or invalid.
export const DEFAULT_THEME_COLORS: Colors.ThemeColors = {
  base100: "oklch(99.5% 0.002 240)",
  base200: "oklch(98.4% 0.003 247.858)",
  base300: "oklch(96.8% 0.007 247.896)",
  baseContent: "oklch(27.9% 0.041 260.031)",
  baseContentLight: "oklch(55.4% 0.046 257.417)",
  primary: "oklch(54.6% 0.245 262.881)",
  primaryContent: "oklch(99.5% 0.002 240)",
  secondary: "oklch(69.6% 0.17 162.48)",
  secondaryContent: "oklch(99.5% 0.002 240)",
  accent: "oklch(54.1% 0.281 293.009)",
  accentContent: "oklch(99.5% 0.002 240)",
  neutral: "oklch(55.4% 0.046 257.417)",
  neutralContent: "oklch(99.5% 0.002 240)",
  info: "oklch(68.5% 0.169 237.323)",
  infoContent: "oklch(99.5% 0.002 240)",
  success: "oklch(69.6% 0.17 162.48)",
  successContent: "oklch(97.9% 0.021 166.113)",
  warning: "oklch(76.9% 0.188 70.08)",
  warningContent: "oklch(98.7% 0.022 95.277)",
  error: "oklch(64.5% 0.246 16.439)",
  errorContent: "oklch(96.9% 0.015 12.422)",
  borderLight: "oklch(92.9% 0.013 255.508)",
  borderMedium: "oklch(86.9% 0.022 252.894)",
};

// Tol Muted
const DEFAULT_MUTED_PALETTE: string[] = [
  "#332288",
  "#88ccee",
  "#44aa99",
  "#117733",
  "#999933",
  "#ddcc77",
  "#cc6677",
  "#882255",
  "#aa4499",
];

// Okabe Ito
const DEFAULT_OKABE_ITO_PALETTE: string[] = [
  "#E69F00",
  "#56B4E9",
  "#009E73",
  "#F0E442",
  "#0072B2",
  "#D55E00",
  "#CC79A7",
  "#000000",
];

export const DEFAULT_CATEGORICAL_PALETTES: Colors.CategoricalPalettes = {
  muted: DEFAULT_MUTED_PALETTE,
  okabeIto: DEFAULT_OKABE_ITO_PALETTE,
};

export const DEFAULT_REFERENCE_COLORS: Colors.ReferenceColors = {
  line: "#6B7280",
  box: {
    color: "#6B7280",
    opacities: [0.3, 0.2, 0.12],
  },
};

export const DEFAULT_COLOR_CONFIG: Colors.ColorConfig = {
  theme: DEFAULT_THEME_COLORS,
  charts: {
    categoricalPalettes: DEFAULT_CATEGORICAL_PALETTES,
    reference: DEFAULT_REFERENCE_COLORS,
  },
};

// Chart colors that stand in for Tailwind/theme colors instead of hardcoding hex.
export function buildChartColorRecord(
  theme: Colors.ThemeColors,
): Record<string, string> {
  return {
    title: theme.baseContent,
    subTitle: theme.baseContentLight,
    axisLine: theme.borderMedium,
    splitLine: theme.borderLight,
    text: theme.baseContent,
    textLight: theme.baseContentLight,
    tooltipBackground: theme.base100,
  };
}
