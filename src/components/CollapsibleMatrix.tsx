import { useEffect, useRef, useState, useCallback } from "react";
import type { ECharts } from "echarts/core";
import { buildRows, buildSeriesData } from "@utils/helpers";
import { ReactEChartsWrapper } from "@components/ReactEChartsWrapper";
import type { Visualization } from "@customTypes/visualization";

const THRESHOLDS = [0.3, 0.65];

const CELL_SIZE = 80;
// const LABEL_WIDTH = 160;
// const CHART_TOP = 20;
// const CHART_BOTTOM = 20;
// const CHART_RIGHT = 20;

const CollapsibleMatrix = ({
  dimensions,
  columns,
  allRowsExpanded,
}: Visualization.CollapsibleMatrixProps) => {
  const instanceRef = useRef<ECharts | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [option, setOption] = useState<Visualization.EChartsOption>({});
  const [chartHeight, setChartHeight] = useState<number>(0);

  // Use refs to keep latest values for click handler
  const dimensionsRef = useRef(dimensions);
  const expandedRef = useRef(expanded);

  dimensionsRef.current = dimensions;
  expandedRef.current = expanded;

  const expandAllRows = useCallback((dimIds: string[]) => {
    setExpanded(new Set(dimIds));
  }, []);

  const collapseAllRows = useCallback(() => {
    setExpanded(new Set());
  }, []);

  const toggle = useCallback((dimId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(dimId) ? next.delete(dimId) : next.add(dimId);
      return next;
    });
  }, []);

  // Build chart option whenever dimensions or expansion changes
  useEffect(() => {
    const rows = buildRows(dimensions, expanded);
    const seriesData = buildSeriesData(dimensions, rows, columns);
    seriesData.forEach((d) => {
      d[2] === null ? (d[2] = Infinity) : d[2];
    });

    const yLabels = rows.map((r) => {
      const isOpen = r.isDimension && expanded.has(r.dimensionId);
      const prefix = r.isDimension ? (isOpen ? "\u25BE " : "\u25B8 ") : "";
      return prefix + r.label;
    });

    setChartHeight(rows.length * CELL_SIZE);

    const newOption: Visualization.EChartsOption = {
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
          show: false,
        },
        //splitArea: { show: true },
        // axisLabel: {
        //   fontSize: 12,
        //   fontFamily: "'IBM Plex Mono', monospace",
        //   color: "#334155",
        // },
        // axisTick: { show: false },
        // axisLine: { show: false },
      },
      yAxis: {
        type: "category",
        data: yLabels,
        splitLine: {
          show: true,
        },
        //splitArea: { show: true },
        axisLabel: {
          // fontSize: 12,
          // fontFamily: "'IBM Plex Mono', monospace",
          // color: "#334155",
          rich: {
            dim: { fontWeight: "bold", color: "#1e3a5f" },
            item: { color: "#64748b" },
          },
          formatter: (value: string, index: number) => {
            const row = rows[index];
            if (!row) return value;
            return row.isDimension ? `{dim|${value}}` : `{item|${value}}`;
          },
        },
        // axisTick: { show: false },
        // axisLine: { show: false },
        triggerEvent: true, // ← allows clicking on yAxis labels
      },
      visualMap: {
        type: "piecewise",
        pieces: [
          {
            min: THRESHOLDS[1],
            max: 1,
            label: "Light",
            color: "#80F1BE",
            symbol: "circle",
            symbolSize: 30,
          },
          {
            min: THRESHOLDS[0],
            max: THRESHOLDS[1],
            label: "Moderate",
            color: "#fec42c",
            symbol: "rect",
            symbolSize: 30,
          },
          {
            max: THRESHOLDS[0],
            label: "Severe",
            color: "#FF684A",
            symbol: "triangle",
            symbolSize: 30,
          },
        ],
        showLabel: true,
        orient: "horizontal",
        left: "center",
        // bottom: '20px'
      },
      series: [
        {
          // name: "Matrix",
          type: "scatter",
          //coordinateSystem: "matrix",
          data: seriesData,
          itemStyle: {
            opacity: 1,
          },
          label: {
            show: true,
            position: "bottom",
            formatter: (params: any) =>
              params.value[2] !== null ? params.value[2].toFixed(2) : "",
          },
        },
      ],
    };

    setOption(newOption);
  }, [dimensions, expanded, columns]);

  // Attach click handlers when chart instance is ready
  useEffect(() => {
    if (!instanceRef.current) {
      return;
    }

    const handleClick = (params: any) => {
      // Click on a scatter point whose row is a dimension
      if (
        params.componentType === "series" &&
        params.componentSubType === "scatter"
      ) {
        const rows = buildRows(dimensionsRef.current, expandedRef.current);
        const rowMeta = rows[params.value[1]];
        if (rowMeta?.isDimension) toggle(rowMeta.dimensionId);
      }

      // Click directly on a y-axis label
      if (params.componentType === "yAxis") {
        const rows = buildRows(dimensionsRef.current, expandedRef.current);
        const rowMeta = rows[params.dataIndex];
        if (rowMeta?.isDimension) toggle(rowMeta.dimensionId);
      }
    };

    instanceRef.current.on("click", handleClick);

    return () => {
      instanceRef.current?.off("click", handleClick);
    };
  }, [toggle]); // Re-attach when toggle function changes //instanceRef.current oder toggle

  // expand or collapse all
  useEffect(() => {
    if (allRowsExpanded) {
      expandAllRows(dimensions.map((d) => d.id));
    } else {
      collapseAllRows();
    }
  }, [allRowsExpanded, dimensions, expandAllRows, collapseAllRows]); // allRowsExpanded, instanceRef.current oder dimensions, expandAllRows, collapseAllRows

  // + 100 pixel for legend  height: `${chartHeight}px`
  return (
    <div style={{ width: "100%", height: `${chartHeight}px` }}>
      <ReactEChartsWrapper ref={instanceRef} option={option} />
    </div>
  );
};

export default CollapsibleMatrix;

// ─── Demo usage (remove in production) ───────────────────────────────────────
// export interface CollapsibleMatrixDemoProps {
//   allExpanded: boolean;
// }

// export const CollapsibleMatrixDemo = ({
//   allExpanded,
// }: CollapsibleMatrixDemoProps) => {
//   const columns = ["08.08.2025", "08.09.2025", "08.10.2025", "08.11.2025"];
//   const allRowsExpanded = allExpanded;
//   const dimensions: Visualization.MatrixDimension[] = [
//     {
//       id: "dim1",
//       name: "Dim 1",
//       questionnaire: eq5d5lQuestionnaire,
//       dimensionValues: [0.82, 0.74, 0.91, 0.88],
//       items: {
//         "item11": [{linkId: "item11", answer: 1}, {linkId: "item11", answer: 2}, {linkId: "item11", answer: 3}]

//       }
//     },
//     // {
//     //   id: "dim2",
//     //   label: "Dim 2",
//     //   dimensionValues: [0.55, 0.62, 0.48, 0.51],
//     //   items: [
//     //     { id: "item21", label: "Item 1", values: [0.6, 0.65, 0.52, 0.55] },
//     //     { id: "item22", label: "Item 2", values: [0.5, 0.59, 0.44, 0.47] },
//     //   ],
//     // },
//     // {
//     //   id: "dim3",
//     //   label: "Dim 3",
//     //   dimensionValues: [0.9, 0.85, 0.93, 0.88],
//     //   items: [
//     //     { id: "item31", label: "Item 1", values: [0.92, 0.87, 0.95, 0.9] },
//     //     { id: "item32", label: "Item 2", values: [0.88, 0.83, 0.91, 0.86] },
//     //     { id: "item33", label: "Item 3", values: [0.9, 0.85, 0.93, 0.88] },
//     //   ],
//     // },
//     // {
//     //   id: "dim4",
//     //   label: "Dim 4",
//     //   dimensionValues: [0.67, 0.71, 0.75, 0.1],
//     //   items: [
//     //     {
//     //       id: "item41",
//     //       label: "Item 1",
//     //       values: [0.65, 0.7, 0.74, 0.79],
//     //     },
//     //     {
//     //       id: "item42",
//     //       label: "Item 2",
//     //       values: [0.69, 0.72, 0.76, 0.81],
//     //     },
//     //   ],
//     // },
//   ];

//   return (
//     <CollapsibleMatrix
//       dimensions={dimensions}
//       columns={columns}
//       allRowsExpanded={allRowsExpanded}
//     />
//   );
// };
