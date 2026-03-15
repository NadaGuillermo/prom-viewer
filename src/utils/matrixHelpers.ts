import type { Visualization } from "@customTypes/visualization";

export const buildRows = (
  dimensions: Visualization.MatrixDimension[],
  expanded: Set<string>,
): Visualization.RowMeta[] => {
  let rows: Visualization.RowMeta[] = [];
  let rowIndex = 0;

  for (const dim of dimensions) {
    let dimensionRows: Visualization.RowMeta[] = [];
    const startIndex = rowIndex;

    dimensionRows.push({
      rowIndex: rowIndex++,
      dimensionId: dim.id,
      isDimension: true,
      label: dim.label,
    });

    if (expanded.has(dim.id)) {
      for (const item of dim.items) {
        dimensionRows.push({
          rowIndex: rowIndex++,
          dimensionId: dim.id,
          isDimension: false,
          itemId: item.id,
          label: item.label,
        });
      }
    }

    const endIndex = rowIndex - 1;  

    if (endIndex > startIndex + 1) {
      // Reverse dimensionRows
      dimensionRows.reverse();

      // Correct row indices
      // dimensionRows.map((r) => {
      //   r.rowIndex = endIndex - r.rowIndex + startIndex;
      // });
    }

    // Push to rows
    rows = dimensionRows.concat(rows);
  }

  return rows;
}

export const buildSeriesData = (
  dimensions: Visualization.MatrixDimension[],
  rows: Visualization.RowMeta[],
  columns: string[],
): [number, number, number][] => {
  const dimMap = new Map(dimensions.map((d) => [d.id, d]));
  const data: [number, number, number][] = [];

  for (const row of rows) {
    const dim = dimMap.get(row.dimensionId)!;
    const reversedRowIndex = rows.length - 1 - row.rowIndex;


    let values: number[];
    if (row.isDimension) {
      values = dim.dimensionValues;
    } else {
      const item = dim.items.find((i) => i.id === row.itemId)!;
      values = item.values;
    }

    for (let colIdx = 0; colIdx < columns.length; colIdx++) {
      // ECharts heatmap uses [colIndex, rowIndex, value]
      data.push([colIdx, reversedRowIndex, values[colIdx]]);
    }
  }

  return data;
}