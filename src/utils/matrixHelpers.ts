export interface MatrixItem {
  id: string;
  label: string;
  values: number[]; // one value per column
}

export interface MatrixDimension {
  id: string;
  label: string;
  items: MatrixItem[];
  /** Aggregate value shown when the dimension is collapsed (one per column). */
  dimensionValues: number[];
}

export interface CollapsibleMatrixProps {
  dimensions: MatrixDimension[];
  columns: string[];
  allRowsExpanded: boolean;
}

interface RowMeta {
  rowIndex: number;
  dimensionId: string;
  isDimension: boolean;
  itemId?: string;
  label: string;
}

export const buildRows = (
  dimensions: MatrixDimension[],
  expanded: Set<string>,
): RowMeta[] => {
  let rows: RowMeta[] = [];
  let rowIndex = 0;

  for (const dim of dimensions) {
    let dimensionRows: RowMeta[] = [];
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
  dimensions: MatrixDimension[],
  rows: RowMeta[],
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