
const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "chart";

const timestamp = (): string =>
  new Date().toISOString().replace(/:/g, "-").replace(/\..+$/, "");

export const buildExportFileName = (name: string, extension: string): string =>
  `${slugify(name)}_${timestamp()}.${extension}`;