import { toPng } from "html-to-image";

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "chart";

const timestamp = (): string =>
  new Date().toISOString().replace(/:/g, "-").replace(/\..+$/, "");

export const buildExportFileName = (baseName?: string): string =>
  `${slugify(baseName ?? "chart")}_${timestamp()}.png`;

export const captureAndDownloadElement = async (
  element: HTMLElement,
  fileName: string,
): Promise<void> => {
  const dataUrl = await toPng(element, {
    pixelRatio: 1,
    backgroundColor: "#ffffff",
  });

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
};
