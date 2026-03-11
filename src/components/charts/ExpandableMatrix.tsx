import React, { useEffect, useRef, useState, useCallback } from "react";
import * as echarts from "echarts";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MatrixRow {
  id: string;
  label: string;
  values: number[]; // one value per column
}

export interface ExpandableMatrixProps {
  /** The first row — always visible and acts as the toggle trigger. */
  headerRow: MatrixRow;
  /** All subsequent rows — hidden until expanded. */
  itemRows: MatrixRow[];
  columns: string[];
  colorRange?: [string, string, string];
  valueRange?: [number, number];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CELL_SIZE = 48;
const LABEL_WIDTH = 160;
const CHART_TOP = 60;
const CHART_BOTTOM = 20;
const CHART_RIGHT = 20;

// ─── Component ────────────────────────────────────────────────────────────────

export const ExpandableMatrix: React.FC<ExpandableMatrixProps> = ({
  headerRow,
  itemRows,
  columns,
  colorRange = ["#dbeafe", "#3b82f6", "#1e3a8a"],
  valueRange = [0, 100],
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [chartHeight, setChartHeight] = useState<number>(0);

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  const renderChart = useCallback(() => {
    if (!instanceRef.current) return;

    // Build the flat row list: always header first, items only when expanded
    const visibleRows: MatrixRow[] = expanded
      ? [headerRow, ...itemRows]
      : [headerRow];

      // ECharts renders y-axis categories bottom-to-top, so we reverse the label
    // order and invert row indices so the header stays at the top visually.
    const totalRows = visibleRows.length;

    // Y-axis labels — reversed so index 0 = bottom, last = top (header on top)
    const yLabels = [...visibleRows].reverse().map((row, i) => {
      const isHeader = i === totalRows - 1; // header is last after reversing
      if (isHeader) return (expanded ? "▾ " : "▸ ") + row.label;
      return "    " + row.label;
    });

     // Series data: [colIndex, invertedRowIndex, value]
    const seriesData: [number, number, number][] = [];
    visibleRows.forEach((row, rowIdx) => {
      const invertedIdx = totalRows - 1 - rowIdx;
      row.values.forEach((val, colIdx) => {
        seriesData.push([colIdx, invertedIdx, val]);
      });
    });

    
    setChartHeight(CHART_TOP + CHART_BOTTOM + (visibleRows.length + 1) * CELL_SIZE);

    //const chartHeight =
    //  CHART_TOP + CHART_BOTTOM + visibleRows.length * CELL_SIZE;
    if (chartRef.current) {
      chartRef.current.style.height = `${chartHeight}px`;
    }
    instanceRef.current.resize();

    const option: echarts.EChartsOption = {
      animation: false,
      grid: {
        show: true,
        containLabel: true,
        borderWidth: 0,
      },
      xAxis: {
        type: "category",
        data: columns,
        splitLine: {
          show: true
        }
      },
      yAxis: {
        type: "category",
        data: yLabels,
        splitLine: { show: true },
        axisLabel: {
          rich: {
            header: { fontWeight: "bold", color: "#1e3a5f" },
            item: { color: "#64748b" },
          },
          formatter: (_value: string, index: number) => {
            const label = yLabels[index] ?? "";
            return index === visibleRows.length - 1 ? `{header|${label}}` : `{item|${label}}`;
          },
        },
        triggerEvent: true, // enables click events on axis labels
        //inverse: true, // keep header at top when expanded
      },
      visualMap: {
         type: "piecewise",
        pieces: [
          {
            min: 0.65,
            label: "Good",
            color: "#80F1BE",
            symbol: "circle",
            symbolSize: 30,
          },
          {
            min: 0.3,
            max: 0.65,
            label: "Mediocre",
            color: "#fec42c",
            symbol: "rect",
            symbolSize: 30,
          },
          {
            max: 0.3,
            label: "Bad",
            color: "#FF684A",
            symbol: "diamond",
            symbolSize: 30,
          },
        ],
        showLabel: true,
        orient: "vertical",
        left: "right",
        top: "middle",
        // bottom: '10%'
      },
      series: [
        {
          // name: "Matrix",
          type: "scatter",
          data: seriesData,
          label: {
            show: true,
            formatter: (params: any) => params.value[2].toFixed(2),
          },
          itemStyle: {
            opacity:1,
          },
        },
      ],
    };

    instanceRef.current.setOption(option, { notMerge: true });
  }, [headerRow, itemRows, columns, colorRange, valueRange, expanded]);

  // Init chart once
  useEffect(() => {
    if (!chartRef.current) return;
    instanceRef.current = echarts.init(chartRef.current, undefined, {
      renderer: "canvas",
    });
    return () => {
      instanceRef.current?.dispose();
      instanceRef.current = null;
    };
  }, []);

  // Re-register click handler whenever expanded changes (avoids stale closure)
  useEffect(() => {
    if (!instanceRef.current) return;
    instanceRef.current.off("click");

    instanceRef.current.on("click", (params: any) => {
      const totalRows = expanded ? 1 + itemRows.length : 1;
      const headerInvertedIdx = totalRows - 1; // header is top = last index after inversion
      const isHeaderCell =
        params.componentType === "series" &&
        params.componentSubType === "scatter" &&
        params.value[1] === headerInvertedIdx;

      const isHeaderLabel =
        params.componentType === "yAxis" && params.dataIndex === headerInvertedIdx;

      if (isHeaderCell || isHeaderLabel) toggle();
    });
  }, [expanded, toggle]);

  // Re-render chart on any relevant change
  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // Resize on container width change
  useEffect(() => {
    const obs = new ResizeObserver(() => instanceRef.current?.resize());
    if (chartRef.current) obs.observe(chartRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <div ref={chartRef} style={{ width: "100%", height: `${chartHeight}px`, minHeight: "206px" }} />
    </div>
  );
};

export default ExpandableMatrix;

// ─── Demo ─────────────────────────────────────────────────────────────────────

export const ExpandableMatrixDemo: React.FC = () => {
  const columns = ["08.08.2025", "08.09.2025", "08.10.2025", "08.11.2025", "08.12.2025", "08.01.2026"];

  const headerRow: MatrixRow = {
    id: "total",
    label: "Dim 1",
    values: [0.84, 0.19, 0.34, 0.8, 0.87, 0.84],
  };

  const itemRows: MatrixRow[] = [
    { id: "product", label: " Item 1", values: [0.80, 0.15, 0.28, 0.3, 0.1, 0.85] },
    { id: "services", label: "Item 2", values: [0.6, 0.81, 0.93, 0.9, 0.5, 0.0] },
    { id: "licensing", label: "Item 3", values: [0.2, 0.2, 0.85, 0.80, 0.88, 0.82] },
    { id: "consulting", label: "Item 4", values: [0.40, 0.4, 0.7, 0.3, 0.8, 0.4] },
  ];

  return (
    <>
        <ExpandableMatrix
          headerRow={headerRow}
          itemRows={itemRows}
          columns={columns}
          
        />
      </>
  );
};
