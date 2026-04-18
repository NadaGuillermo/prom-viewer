import { useRef, useEffect, forwardRef } from "react";
import type { Visualization } from "@customTypes/visualization";
import type { ECharts } from "echarts/core";
import { init, use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
  HeatmapChart,
  ScatterChart,
  LineChart,
  BarChart,
  PieChart,
  RadarChart,
} from "echarts/charts";
import {
  LegendComponent,
  GridComponent,
  TooltipComponent,
  ToolboxComponent,
  VisualMapComponent,
  TitleComponent,
  DataZoomComponent,
  MatrixComponent,
} from "echarts/components";

use([
  LegendComponent,
  ScatterChart,
  LineChart,
  BarChart,
  HeatmapChart,
  PieChart,
  RadarChart,
  MatrixComponent,
  VisualMapComponent,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  ToolboxComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

export const ReactEChartsWrapper = forwardRef<
  ECharts | null,
  Visualization.ReactEChartsWrapperProps
>(({ option, style, settings, loading = false, theme, chartHeight, useMinHeight }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  // const [chartHeight, setChartHeight] = useState<number>(0);
  // const [height, setHeight] = useState<number>(chartHeight ?? 0);
// 
  /**
   * Initialize / Reinitialize chart (theme changes require dispose)
   */
  useEffect(() => {
    if (!containerRef.current) return;

    // Dispose existing instance (important for theme changes)
    if (chartRef.current) {
      chartRef.current.dispose();
      chartRef.current = null;
    }
    // Initialize new instance
    
      chartRef.current = init(containerRef.current, theme, {
        height: chartHeight,
      });
    
    // Expose chart instance via ref
    if (ref) {
      if (typeof ref === "function") {
        ref(chartRef.current);
      } else {
        ref.current = chartRef.current;
      }
    }

    // Attach ResizeObserver for embedded layouts
    resizeObserverRef.current = new ResizeObserver(() => {
      chartRef.current?.resize();
    });

    resizeObserverRef.current.observe(containerRef.current);

    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;

      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, [theme, ref]);

  /**
   * Update chart options
   */
  useEffect(() => {
    if (!chartRef.current) return;

    // Update chart

    // const chart = getInstanceByDom(chartRef.current);
    // chart?.setOption(option, settings);
    // const chartInstanceRef = useRef<ECharts | null>(null);
    chartRef.current?.setOption(option, {
      notMerge: false,
      replaceMerge: undefined,
      lazyUpdate: false,
      ...settings,
    });
    requestAnimationFrame(() => {
      chartRef.current?.resize();
    });
  }, [option, settings, theme]); // Whenever theme changes we need to add option and setting due to it being deleted in cleanup function

  /**
   * Loading state handling
   */
  useEffect(() => {
    if (!chartRef.current) return;

    if (loading) {
      chartRef.current.showLoading();
    } else {
      chartRef.current.hideLoading();
    }
  }, [loading, theme]);

  // tw:min-h-100 Höhen ändern !!
  // height: chartHeight ? `${chartHeight}px` : undefined,
  return (
    <div
      ref={containerRef}
      className={`${useMinHeight ? "tw:h-full tw:w-full tw:min-h-100" : "tw:h-full tw:w-full"}`}
      style={{ ...style }}
    />
  );
});

ReactEChartsWrapper.displayName = "ReactEChartsWrapper";
