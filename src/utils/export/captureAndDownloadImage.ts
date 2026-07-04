import { toPng } from "html-to-image";

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
