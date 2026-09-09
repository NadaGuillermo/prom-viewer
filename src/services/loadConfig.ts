import type * as Config from "@utils/config";
import { fetchJsonConfig, resolveConfigUrl } from "./fetchJsonConfig";
import { validatePromConfig } from "./validateConfig";

/**
 * @param injectedConfig - dynamically loaded config file that will overwrite the file from the server
 * @returns the PROMs metadata config
 * @description Loads and validates the PROMs config, always required for the app to run.
 * Validates the fetched JSON against schemas/proms.schema.json before returning it, since in
 * "remote" mode this file is authored outside the codebase. Throws on fetch failure or schema
 * validation failure so callers can surface a fatal config error.
 */
export async function loadConfig(injectedConfig?: unknown): Promise<Config.PromConfig> {
  if (injectedConfig) {
    return validatePromConfig(injectedConfig);
  }
  const data = await fetchJsonConfig(resolveConfigUrl("proms.json"));
  return validatePromConfig(data);
}