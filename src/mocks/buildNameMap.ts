/**
 * @param modules - result of import.meta.glob(..., { eager: true }) over a folder of .json fixtures
 * @returns a map from bare file name (without extension) to the fixture's parsed JSON content
 * @description Used by MSW handlers to look up a fixture by the :name route param.
 */
export function buildNameMap(modules: Record<string, { default: unknown }>): Record<string, unknown> {
  const map: Record<string, unknown> = {};
  for (const [path, module] of Object.entries(modules)) {
    const fileName = path.split("/").pop() ?? path;
    map[fileName.replace(/\.json$/, "")] = module.default;
  }
  return map;
}
