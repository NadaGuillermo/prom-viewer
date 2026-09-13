/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import type * as Colors from "./types.d";
import { DEFAULT_COLOR_CONFIG } from "./defaultColors";
import { validateColorConfig } from "./validateColorConfig";

// Merges a validated partial config onto the defaults so every field is
// guaranteed to be present, even if colors.json only overrides a few keys.
export function resolveColorConfig(input: unknown): Colors.ColorConfig {
  const partial = validateColorConfig(input);

  return {
    theme: {
      ...DEFAULT_COLOR_CONFIG.theme,
      ...partial.theme,
    },
    charts: {
      categoricalPalettes: {
        ...DEFAULT_COLOR_CONFIG.charts.categoricalPalettes,
        ...partial.charts?.categoricalPalettes,
      },
      reference: {
        ...DEFAULT_COLOR_CONFIG.charts.reference,
        ...partial.charts?.reference,
        box: {
          ...DEFAULT_COLOR_CONFIG.charts.reference.box,
          ...partial.charts?.reference?.box,
        },
      },
    },
  };
}
