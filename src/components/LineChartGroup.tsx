/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import { useRef, useState, useEffect, type ReactNode } from "react";

import DownloadImageButton from "@components/DownloadImageButton";
import ReferenceValuesToggle from "@components/ReferenceValuesToggle";
import { ShowReferenceValuesContext } from "@components/ShowReferenceValuesContext";
import { buildExportFileName, captureAndDownloadElement } from "@utils/export";

interface Props {
  name: string;
  id: string;
  hasReferenceValues?: boolean;
  children: ReactNode;
}

/**
 * LineChartGroup component is a wrapper for a group of line charts that provides functionality for downloading the chart as an image and toggling the display of reference values.
 * It uses a context to pass the state of the reference values toggle to its children.
 * The component also handles the readiness state of the charts to ensure that the download button is only enabled when the charts are fully rendered.
 */
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
    captureAndDownloadElement(
      groupRef.current,
      buildExportFileName(name, "png"),
    );
  };

  return (
    <div className="tw:relative">
      <div
        className={`tw:flex tw:flex-wrap ${hasReferenceValues ? "tw:justify-between" : "tw:justify-end"}`}
      >
        {hasReferenceValues === true && (
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
