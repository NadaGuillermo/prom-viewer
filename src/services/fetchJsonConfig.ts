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
