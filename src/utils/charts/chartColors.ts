import type { Colors } from "@utils/colors/types.d";
import { DEFAULT_COLOR_CONFIG, buildChartColorRecord } from "@utils/colors/defaultColors";

// Initialized with the same defaults as index.css / DEFAULT_COLOR_CONFIG.
// applyChartColorConfig() mutates these in place once the real color config
// is resolved (see main.tsx), so anything importing these bindings picks up
// the resolved values as long as it evaluates after that call.
export const chartColorRecord: Record<string, string> = buildChartColorRecord(
  DEFAULT_COLOR_CONFIG.theme,
);

export const mutedColorPalette: string[] = [
  ...DEFAULT_COLOR_CONFIG.charts.categoricalPalettes.muted,
];

export const colorPalette: string[] = [
  ...DEFAULT_COLOR_CONFIG.charts.categoricalPalettes.okabeIto,
];

export function applyChartColorConfig(config: Colors.ColorConfig): void {
  Object.assign(chartColorRecord, buildChartColorRecord(config.theme));
  mutedColorPalette.splice(
    0,
    mutedColorPalette.length,
    ...config.charts.categoricalPalettes.muted,
  );
  colorPalette.splice(
    0,
    colorPalette.length,
    ...config.charts.categoricalPalettes.okabeIto,
  );
}
