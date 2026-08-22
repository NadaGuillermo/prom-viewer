import type { Config } from "@utils/config";
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