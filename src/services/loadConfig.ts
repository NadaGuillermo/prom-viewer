/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import type * as Config from "@utils/config";
import { fetchJsonConfig, resolveConfigUrl } from "./fetchJsonConfig";
import { validatePromConfig } from "./validateConfig";

/**
 * @returns the PROMs metadata config
 * @description Loads the PROMs config, always required for the app to run.
 * Validates the fetched JSON against schemas/proms.schema.json before returning it, since in
 * "remote" mode this file is authored outside the codebase. Throws on fetch failure or schema
 * validation failure so callers can surface a fatal config error; falls back to the local mock
 * config fixture (served by MSW) when remote mode has no server url set.
 */
export async function loadConfig(): Promise<Config.PromConfig> {
  const data = await fetchJsonConfig(resolveConfigUrl("proms.json"));
  return validatePromConfig(data);
}