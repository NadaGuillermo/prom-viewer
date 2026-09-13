/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import type * as Errors from "@utils/errors";

interface Props {
  data: Errors.DataIssue[];
}

/**
 * ErrorCard component displays a list of data issues, categorized into errors and warnings.
 */
const ErrorCard = ({ data }: Props) => {
  return (
    <div className="tw:card tw:card-border tw:rounded-xl tw:max-w-xl tw:md:w-xl tw:overflow-y-auto tw:max-h-80 card">
      <div className="tw:card-body">
        <div className="tw:flex tw:flex-col tw:gap-y-2">
          {data.some((issue) => issue.level === "error") && (
            <div>
              <span className="tw:font-semibold">Errors </span>
              <span>(possibly flawed data)</span>
            </div>
          )}
          {data
            .filter((issue) => issue.level === "error")
            .map((issue) => (
              <div
                key={issue.id}
                role="tw:alert"
                className="tw:alert tw:alert-error tw:alert-outline border-rounded"
              >
                <p>{issue.userMessage ?? issue.message}</p>
              </div>
            ))}
          {data.some((issue) => issue.level === "warning") && (
            <div>
              <span className="tw:font-semibold">Warnings </span>
              <span>(possibly ill-formatted data)</span>
            </div>
          )}
          {data
            .filter((issue) => issue.level === "warning")
            .map((issue) => (
              <div
                key={issue.id}
                role="tw:alert"
                className="tw:alert tw:alert-warning tw:alert-outline border-rounded"
              >
                <p>{issue.userMessage ?? issue.message}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ErrorCard;
