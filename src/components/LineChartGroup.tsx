import { useRef, useState, useEffect, type ReactNode } from "react";
import DownloadImageButton from "@components/DownloadImageButton";
import {
  buildExportFileName,
  captureAndDownloadElement,
} from "@utils/export";

interface Props {
  name: string;
  children: ReactNode;
}

const LineChartGroup = ({ name, children }: Props) => {
  const groupRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
    let frame1 = 0;
    let frame2 = 0;
    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => setIsReady(true));
    });
    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [children]);

  const handleDownload = () => {
    if (!groupRef.current) return;
    captureAndDownloadElement(groupRef.current, buildExportFileName(name, "png"));
  };

  return (
    <div className="tw:relative">
      <div ref={groupRef}>{children}</div>
      <DownloadImageButton
        onClick={handleDownload}
        disabled={!isReady}
        className="tw:absolute tw:-top-8 tw:right-2"
        tooltipText="Save as image"
      />
    </div>
  );
};

export default LineChartGroup;
