/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconProp } from "@fortawesome/fontawesome-svg-core";
import { Tooltip } from "react-tooltip";

import Portal from "@components/Portal";

interface Props {
  onClick: () => void;
  id: string;
  disabled?: boolean;
  label?: string;
  className?: string;
  tooltipText?: string;
}

/**
 * DownloadImageButton component renders a button that allows users to download an image of the chart.
 */
const DownloadImageButton = ({
  onClick,
  id,
  disabled = false,
  label = "Save as image",
  tooltipText = "Download",
  className,
}: Props) => {
  return (
    <div className={`${className}`}>
      <a data-tooltip-id={id}>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={`tw:btn tw:btn-xs tw:btn-circle tw:bg-base-100 tw:border-base-300 tw:shadow-none tw:text-neutral
            tw:hover:bg-base-300 tw:hover:text-base-content
            tw:z-10
            tw:disabled:opacity-40 tw:disabled:cursor-default`}
        >
          <FontAwesomeIcon icon={["fas", "download"] as IconProp} />
        </button>
      </a>
      <Portal>
        <Tooltip
          id={id}
          opacity={1}
          className="custom-tooltip tooltip-light tw:z-10"
        >
          <div className="tw:w-24">
            <div className="tw:text-center tw:text-sm tw:whitespace-normal tw:break-normal">
              {tooltipText ? tooltipText : label}
            </div>
          </div>
        </Tooltip>
      </Portal>
    </div>
  );
};

export default DownloadImageButton;