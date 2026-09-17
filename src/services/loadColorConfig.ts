/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import type * as Colors from "@utils/colors/types.d";
import { resolveColorConfig } from "@utils/colors/resolveColorConfig";
import { DEFAULT_COLOR_CONFIG } from "@utils/colors/defaultColors";
import { fetchJsonConfig, resolveConfigUrl } from "./fetchJsonConfig";

// Never throws: any fetch/parse/validation failure falls back to
// DEFAULT_COLOR_CONFIG so the app always ends up with a complete config.
export async function loadColorConfig(): Promise<Colors.ColorConfig> {
  try {
    const json = await fetchJsonConfig(resolveConfigUrl("colors.json"));
    return resolveColorConfig(json);
  } catch (error) {
    console.error(
      "Error loading color config file, falling back to default colors:",
      error,
    );
    return DEFAULT_COLOR_CONFIG;
  }
}
