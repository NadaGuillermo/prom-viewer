import { fetchJsonConfig, resolveConfigUrl } from "./fetchJsonConfig";

/**
 * @returns the PROMs metadata config
 * @description Loads the PROMs config, always required for the app to run.
 * Throws on failure so callers can surface a fatal config error; falls back
 * to the local mock config fixture (served by MSW) when remote mode has no server url set.
 */
export async function loadConfig(): Promise<any> {
  return fetchJsonConfig(resolveConfigUrl("proms.json"));
}