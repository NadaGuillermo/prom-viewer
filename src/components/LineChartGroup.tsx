import { useRef, useState, useEffect, type ReactNode } from "react";
import DownloadImageButton from "@components/DownloadImageButton";
import ReferenceValuesToggle from "@components/ReferenceValuesToggle";
import { ShowReferenceValuesContext } from "@components/ShowReferenceValuesContext";
import {
  buildExportFileName,
  captureAndDownloadElement,
} from "@utils/export";

interface Props {
  name: string;
  id: string;
  hasReferenceValues?: boolean;
  children: ReactNode;
}

const LineChartGroup = ({
  name,
  id,
  hasReferenceValues = false,
  children,
}: Props) => {
  const groupRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [showReferenceValues, setShowReferenceValues] = useState(false);

  useEffect(() => {
    let frame0 = 0;
    let frame1 = 0;
    let frame2 = 0;
    frame0 = requestAnimationFrame(() => {
      setIsReady(false);
      frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => setIsReady(true));
      });
    });
    return () => {
      cancelAnimationFrame(frame0);
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
      <div className={`tw:flex tw:flex-wrap ${hasReferenceValues ? "tw:justify-between" : "tw:justify-end"}`}>
      {hasReferenceValues && (
        <ReferenceValuesToggle
          checked={showReferenceValues}
          onChange={setShowReferenceValues}
        />
      )}
      <DownloadImageButton
        onClick={handleDownload}
        id={id}
        disabled={!isReady}
        className={`${hasReferenceValues ? "" : ""}`}
        tooltipText="Save as image"
      />
      </div>
      <div ref={groupRef}>
        <ShowReferenceValuesContext.Provider value={showReferenceValues}>
          {children}
        </ShowReferenceValuesContext.Provider>
      </div>
    </div>
  );
};

export default LineChartGroup;
