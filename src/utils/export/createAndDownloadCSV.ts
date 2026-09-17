/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import type * as Visualization from "@utils/visualization";
import type * as Mapping from "@utils/mapping";
import * as _ from "lodash-es";

export const createAndDownloadCSV = (
  data: Visualization.ChartData,
  fileName: string,
) => {
  const xData = _.cloneDeep(data.xData)
  xData.unshift("Item");
  const yValues = _.cloneDeep(data.yData.map((series) => series.originalData));
  const rowNames = _.cloneDeep(data.yData.map((series) => series.name));
  const csvArray: (string | Mapping.Value)[][] = [xData];
  rowNames.forEach((name, i) => {
    const row: (string | Mapping.Value)[] = yValues[i];
    row.unshift(name);
    csvArray.push(row);
  });

  let csvContent = "";
  csvArray.forEach((row) => {
    csvContent += row.join(",")+"\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-16,' });
  const objUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objUrl;
  link.download = fileName;
  link.click();
}