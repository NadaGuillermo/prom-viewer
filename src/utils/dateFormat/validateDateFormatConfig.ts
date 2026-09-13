/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import type * as DateFormat from "./types.d";
import { isValidDateFormatPattern } from "./dateFormatter";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Drops the whole "date" section if its format pattern is invalid, so an
// unparseable pattern falls back to the default instead of formatting dates
// incorrectly.
export function validateDateFormatConfig(
  input: unknown,
): DateFormat.PartialDateFormatConfig {
  if (!isRecord(input) || !isRecord(input.date)) return {};

  const format = input.date.format;
  if (!isValidDateFormatPattern(format)) return {};

  return { date: { format } };
}
