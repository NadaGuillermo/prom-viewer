// Shared by the UI config loaders (colors, date format, ...): fetches a JSON
// file from /public and throws on a non-OK response or invalid JSON. Callers
// decide how to fall back; this only handles the raw fetch.
export async function fetchJsonConfig(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * @param filename - config file name, e.g. "colors.json"
 * @returns the url to fetch that config file from
 * @description Resolves a config file url based on VITE_CONFIG_SOURCE: "remote"
 * with VITE_CONFIG_SERVER_URL set fetches from that server, otherwise falls
 * back to the local public/config folder.
 */
export function resolveConfigUrl(filename: string): string {
  const { VITE_CONFIG_SOURCE, VITE_CONFIG_SERVER_URL } = import.meta.env;
  if (VITE_CONFIG_SOURCE === "remote" && VITE_CONFIG_SERVER_URL !== undefined) {
    return `${VITE_CONFIG_SERVER_URL}/${filename}`;
  }
  return `${import.meta.env.BASE_URL}config/${filename}`;
}
