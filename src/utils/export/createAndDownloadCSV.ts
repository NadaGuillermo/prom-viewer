import type { Visualization } from "@utils/visualization";
import * as _ from "lodash-es";

export const createAndDownloadCSV = (
  data: Visualization.ChartData,
  fileName: string,
) => {
  const xData = _.cloneDeep(data.xData)
  xData.unshift("Item");
  const yValues = _.cloneDeep(data.yData.map((series) => series.originalData));
  const rowNames = _.cloneDeep(data.yData.map((series) => series.name));
  const csvArray = [xData];
  rowNames.forEach((name, i) => {
    const row = yValues[i];
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