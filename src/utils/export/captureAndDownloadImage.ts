import { toPng } from "html-to-image";

// enlarge canvas of exported image to prevent unexpected cuts
const EXPORT_BOTTOM_BUFFER_PX = 20;
const EXPORT_RIGHT_BUFFER_PX = 10;

/**
 * @param element - DOM node to rasterize; its own bounds (scrollWidth/scrollHeight) size the export
 * @param fileName - download file name, including extension
 * @returns Promise<void> - resolves once the browser download has been triggered
 * Captures an element as a PNG via html-to-image and triggers a download of it.
 */
export const captureAndDownloadElement = async (
  element: HTMLElement,
  fileName: string,
): Promise<void> => {
  const dataUrl = await toPng(element, {
    pixelRatio: 1,
    backgroundColor: "#ffffff",
    width: element.scrollWidth + EXPORT_RIGHT_BUFFER_PX,
    height: element.scrollHeight + EXPORT_BOTTOM_BUFFER_PX,
  });

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
};
