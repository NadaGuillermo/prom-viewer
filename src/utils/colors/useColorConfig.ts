import { useEffect, useState } from "react";
import type { Colors } from "./types.d";
import { DEFAULT_COLOR_CONFIG } from "./defaultColors";
import { applyThemeColorsToRoot } from "./applyColorConfig";
import { loadColorConfig } from "@services/loadColorConfig";
import { applyChartColorConfig } from "@utils/charts/chartColors";

interface UseColorConfigResult {
  colorConfig: Colors.ColorConfig;
  isLoading: boolean;
}

// Optional convenience hook for components mounted after app boot that want
// to (re)fetch and (re)apply the color config, e.g. a future settings panel.
// The default boot path in main.tsx does not use this hook: it loads and
// applies colors once, before the app tree is even imported, to avoid a
// redundant second fetch and a colors-then-repaint flash.
export function useColorConfig(): UseColorConfigResult {
  const [colorConfig, setColorConfig] =
    useState<Colors.ColorConfig>(DEFAULT_COLOR_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loadColorConfig().then((resolved) => {
      if (cancelled) return;
      applyThemeColorsToRoot(resolved.theme);
      applyChartColorConfig(resolved);
      setColorConfig(resolved);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { colorConfig, isLoading };
}
