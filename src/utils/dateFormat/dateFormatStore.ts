/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import type * as DateFormat from "./types.d";
import { DEFAULT_DATE_FORMAT_CONFIG } from "./defaultDateFormat";

// Mutated once at boot (see main.tsx) before the mapping pipeline ever runs,
// mirroring how chart colors are applied in @utils/charts/chartColors.
let currentDateFormatConfig: DateFormat.DateFormatConfig =
  DEFAULT_DATE_FORMAT_CONFIG;

export function applyDateFormatConfig(config: DateFormat.DateFormatConfig): void {
  currentDateFormatConfig = config;
}

export function getDateFormatPattern(): string {
  return currentDateFormatConfig.date.format;
}
