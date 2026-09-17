/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import type * as DateFormat from "@utils/dateFormat/types.d";
import { resolveDateFormatConfig } from "@utils/dateFormat/resolveDateFormatConfig";
import { DEFAULT_DATE_FORMAT_CONFIG } from "@utils/dateFormat/defaultDateFormat";
import { fetchJsonConfig, resolveConfigUrl } from "./fetchJsonConfig";

// Never throws: any fetch/parse/validation failure falls back to
// DEFAULT_DATE_FORMAT_CONFIG (ISO, YYYY-MM-DD).
export async function loadDateFormatConfig(): Promise<DateFormat.DateFormatConfig> {
  try {
    const json = await fetchJsonConfig(resolveConfigUrl("dateFormat.json"));
    return resolveDateFormatConfig(json);
  } catch (error) {
    console.error(
      "Error loading date format config file, falling back to default date format:",
      error,
    );
    return DEFAULT_DATE_FORMAT_CONFIG;
  }
}
