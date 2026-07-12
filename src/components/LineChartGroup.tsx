import { createContext, useRef, useState, useEffect, type ReactNode } from "react";
import DownloadImageButton from "@components/DownloadImageButton";
import ReferenceValuesToggle from "@components/ReferenceValuesToggle";
import {
  buildExportFileName,
  captureAndDownloadElement,
} from "@utils/export";

// Lets LineChart instances nested anywhere within a group's children (not
// necessarily direct children) pick up the group's toggle state without the
// group having to walk/clone its own children tree.
export const ShowReferenceValuesContext = createContext(false);

interface Props {
  name: string;
  hasReferenceValues?: boolean;
  children: ReactNode;
}

const LineChartGroup = ({
  name,
  hasReferenceValues = false,
  children,
}: Props) => {
  const groupRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [showReferenceValues, setShowReferenceValues] = useState(false);

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
      <div className={`tw:flex tw:flex-wrap ${hasReferenceValues ? "tw:justify-between" : "tw:justify-end"}`}>
      {hasReferenceValues && (
        <ReferenceValuesToggle
          checked={showReferenceValues}
          onChange={setShowReferenceValues}
        />
      )}
      <DownloadImageButton
        onClick={handleDownload}
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
