/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/


/**
 * @param value - the string to convert into a file-name-safe slug
 * @returns the lowercased value with non-alphanumeric runs replaced by hyphens and leading/trailing hyphens trimmed, or "chart" if the result would be empty
 */
const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "chart";

/**
 * @returns the current time as an ISO timestamp with colons replaced by hyphens and sub-second precision removed, so it is safe to use in a file name
 */
const timestamp = (): string =>
  new Date().toISOString().replace(/:/g, "-").replace(/\..+$/, "");

/**
 * @param name - the base name for the exported file (e.g. a chart title)
 * @param extension - the file extension to append (without a leading dot)
 * @returns a file name combining a slugified version of `name` with the current timestamp and `extension`
 */
export const buildExportFileName = (name: string, extension: string): string =>
  `${slugify(name)}_${timestamp()}.${extension}`;