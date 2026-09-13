/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

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
 * back to the local mock config fixtures (src/mocks/config/data/), served via MSW.
 */
export function resolveConfigUrl(filename: string): string {
  const { VITE_CONFIG_SOURCE, VITE_CONFIG_SERVER_URL } = import.meta.env;
  if (VITE_CONFIG_SOURCE === "remote" && VITE_CONFIG_SERVER_URL !== undefined) {
    return `${VITE_CONFIG_SERVER_URL}/${filename}`;
  }
  return `${import.meta.env.BASE_URL}config/${filename}`;
}
