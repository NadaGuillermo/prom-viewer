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
import { validateDateFormatConfig } from "./validateDateFormatConfig";

// Merges a validated partial config onto the defaults so the result always
// has a valid format, even if dateFormat.json only overrides part of it.
export function resolveDateFormatConfig(
  input: unknown,
): DateFormat.DateFormatConfig {
  const partial = validateDateFormatConfig(input);

  return {
    date: {
      ...DEFAULT_DATE_FORMAT_CONFIG.date,
      ...partial.date,
    },
  };
}
