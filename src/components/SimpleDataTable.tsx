import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";

/* import all the icons in Free Solid, Free Regular, and Brands styles */
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fas);

import {
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  isScoreSeries,
  getNameForDataSeriesFromShortName,
  type Visualization,
} from "@utils/visualization";
import { globalDimension } from "@utils/mapping";

import type { GlobalTypes } from "@customTypes/globalTypes";

import * as _ from "lodash-es";

import "@styles/echartStyles.css";
import "@styles/style.css";

/** Optional warning data per cell */
interface CellWarning {
  message: string;
  /** Optional severity or custom icon class */
  type?: "warning" | "info" | "error";
}

// Table Props
interface Props {
  data: Visualization.ChartData;
  domains: string[];
  /** Map of rowId -> columnIndex -> warning info */
  errors?: GlobalTypes.DataIssue[];
  /** Optional row tooltip override (defaults to full name) */
  // rowTooltips?: Record<string, string>;
  /** Table title / caption */
  title?: string;
  // className?: string;
  /** Height constraint for vertical scroll */
  maxHeight?: string;
  minWidth?: string;
  /** Custom cell formatter */
  // formatCell?: (value: number | null, row: Visualization.DataSeries, colIndex: number) => React.ReactNode;
}

const SimpleDataTable = ({
  data,
  domains,
  errors,
  title,
  maxHeight = "600px",
}: Props) => {
  const xData = data.xData;
  console.log("css table original x data: ", xData);
  const scores = data.yData.filter((series) => series.seriesType === "score");
  const globalScores = scores.filter(
    (score) => score.domain === globalDimension,
  );
  const dimensionScores = _.difference(scores, globalScores);
  const dimensionScoresGroupedByDomain = domains.flatMap((domain) =>
    dimensionScores.filter((score) => score.domain === domain),
  );

  const itemsNotReferencedInScoreExpressions = data.yData.filter(
    (series) =>
      series.seriesType === "item" &&
      !scores.some((score) => score.referencedItems?.includes(series.id)),
  );

  const dimensionScoresWithReferencedItems =
    dimensionScoresGroupedByDomain.map((score) => {
      const referencedItems = data.yData.filter(
        (series) =>
          series.seriesType === "item" &&
          score.referencedItems?.includes(series.id),
      );
      return { score: score, items: referencedItems };
    });

  const sortedDataSeries = [
    ...globalScores,
    ...dimensionScoresWithReferencedItems.flatMap((scoreItemObj) => [
      scoreItemObj.score,
      ...scoreItemObj.items,
    ]),
    ...itemsNotReferencedInScoreExpressions,
  ];
  const yData = sortedDataSeries;

  console.log("simple table data yData: ", yData);

  const cellWarnings: Record<string, string[]> = {};

  const errorLinkIds = _.intersection(
    errors?.map((error) => error.linkId),
    yData.map((row) => row.id),
  );

  errors?.forEach((error) => {
    if (error.linkId !== undefined && errorLinkIds.includes(error.linkId)) {
      if (!cellWarnings[error.linkId]) {
        cellWarnings[error.linkId] = [];
      }
      cellWarnings[error.linkId].push(error.message);
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
          <thead className="tw:bg-gray-50">
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
          <tbody className="tw:bg-white">
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
                        {row.shortName || row.name}
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
                              className="tw:tooltip tw:text-amber-500 tw:hover:text-amber-600"
                              data-tip={warning}
                              // title={warning}
                              aria-label="Warning"
                            >
                              <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
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
