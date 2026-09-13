/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import { useEffect, useState } from "react";
import type * as Colors from "./types.d";
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
