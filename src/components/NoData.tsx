/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

interface Props {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Reusable "No Data" component for chart sections.
 */
const NoData = ({
  title = "No Data Available",
  message = "No data could be found for this visualization. Please try adjusting your filters or time range.",
  action,
}: Props) => {
  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full tw:max-h-96 tw:px-4 tw:pb-4 tw:mt-8 tw:mx-2 tw:text-center tw:bg-base-100 tw:border border-rounded-prominent border-light">
      {/* Content */}
      <h4>{title}</h4>
      <p className="tw:text-sm tw:max-w-md tw:leading-relaxed tw:text-neutral">
        {message}
      </p>

      {/* Optional Action Button */}
      {action !== undefined && (
        <button
          type="button"
          onClick={action.onClick}
          className="tw:btn tw:mt-8 button-accent"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default NoData;
