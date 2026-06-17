import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { library } from "@fortawesome/fontawesome-svg-core";
// import { fas } from "@fortawesome/free-solid-svg-icons";
// library.add(fas);

import {
  type Visualization,
} from "@utils/visualization";
// import { globalDimension } from "@utils/mapping";

import type { Errors } from "@utils/errors";

import type { GlobalTypes } from "@customTypes/globalTypes";

import * as _ from "lodash-es";

import "@styles/echartStyles.css";

/** Optional warning data per cell */
interface CellWarning {
  message: string;
  /** Optional severity or custom icon class */
  type?: "warning" | "info" | "error";
}

// Table Props
interface Props {
  data: Visualization.ChartData;
  /** Map of rowId -> columnIndex -> warning info */
  errors?: Errors.DataIssue[];
  /** Optional row tooltip override (defaults to full name) */
  // rowTooltips?: Record<string, string>;
  /** Height constraint for vertical scroll */
  maxHeight?: string;
  minWidth?: string;
  /** Custom cell formatter */
  // formatCell?: (value: number | null, row: Visualization.DataSeries, colIndex: number) => React.ReactNode;
}

const SimpleDataTable = ({
  data,
  errors,
  maxHeight = "600px",
}: Props) => {
  const xData = data.xData;
  console.log("css table original x data: ", xData);
  const yData = data.yData;
  console.log("simple table data yData: ", yData);

  const cellWarnings: Record<string, string[]> = {};

  const errorLinkIds = _.intersection(
    errors?.map((error) => error.context.field),
    yData.map((row) => row.id),
  );

  errors?.forEach((error) => {
    if (error.context.field !== undefined && errorLinkIds.includes(error.context.field)) {
      if (!cellWarnings[error.context.field]) {
        cellWarnings[error.context.field] = [];
      }
      cellWarnings[error.context.field].push(error.message);
    }
  });

  const formatCellValue = (
    value: GlobalTypes.NumberOrNull,
  ): React.ReactNode => {
    if (value === null || value === undefined) return "N/A";
    // replace comma in numbers with dot
    return typeof value === "number"
      ? value.toLocaleString().replace(",", ".")
      : value;
  };

  return (
    <div className="tw:w-full">
      {/* Scrollable container */}
      <div className="tw:overflow-auto" style={{ maxHeight: maxHeight }}>
        <table className=" tw:table">
          <thead>
            <tr>
              {/* Empty corner cell */}
              <th className="tw:w-48 tw:min-w-48">
              </th>
              {xData.map((header, idx) => (
                <th
                  key={idx}
                  className="tw:whitespace-nowrap"
                >
                  <div className="tw:flex tw:justify-center">
                    <span>
                      {header}
                    </span>

                  </div>
                  
                  
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tw:bg-base-100">
            {yData.map((row) => {
              const rowTooltip = row.name;
              
              const warningsForRow = cellWarnings[row.id] || {};

              return (
                <tr key={row.id} className="tw:hover:bg-gray-50">
                  {/* Row header with tooltip */}
                  <th
                    className="tw:tooltip tw:tooltip-top row-header-tooltip tw:w-48 tw:min-w-48 tw:hover:bg-gray-50"
                    data-tip={rowTooltip}
                  >
                    <div className="tw:flex tw:items-center">
                      <span
                        className={`tw:truncate tw:max-w-45 ${row.seriesType === "score" ? "tw:font-bold" : "tw:font-normal"}`}
                      >
                        {row.shortName}
                      </span>
                    </div>
                  </th>

                  {/* Data cells */}
                  {row.originalData.map((value, colIndex) => {
                    const warning = warningsForRow[colIndex];
                    const displayValue = formatCellValue(value);

                    return (
                      <td
                        key={colIndex}
                        className="tw:whitespace-nowrap"
                      >
                        <div
                          className={`tw:flex tw:items-center tw:justify-center ${row.seriesType === "score" ? "tw:font-bold" : "tw:font-normal"}`}
                        >
                          <span>{displayValue}</span>

                          {warning && (
                            <span
                              className="tw:tooltip tw:tooltip-warning tw:tooltip-top"
                              // title={warning}
                              aria-label="Warning"
                            >
                              <div className="tw:tooltip-content">
                                  <div className="tw:min-w-xs tw:max-w-md">
                                    <div className="tw:text-left tw:whitespace-normal tw:break-normal">
                                      {warning}
                                    </div>
                                  </div>
                                </div>
                              <span className="tw:text-warning"><FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" /></span>
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Optional footer with info */}
      <div className="tw:text-xs tw:text-gray-500 tw:px-4 tw:py-2 tw:border-t tw:border-gray-200 tw:bg-gray-50 tw:flex tw:items-center tw:gap-2">
        <span>Rows: {yData.length}</span>
        <span className="tw:text-gray-300">&bull;</span>
        <span>Columns: {xData.length}</span>
        {Object.keys(cellWarnings).length > 0 && (
          <>
            <span className="tw:text-gray-300">&bull;</span>
            <span className="tw:flex tw:items-center tw:gap-1">
              <span className="tw:text-amber-500">
                <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
              </span>{" "}
              Warnings present
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default SimpleDataTable;
