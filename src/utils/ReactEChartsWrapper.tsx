import { useRef, useEffect, forwardRef } from "react";
import type { CSSProperties } from "react";

import { CanvasRenderer } from "echarts/renderers";
import { init, use } from "echarts/core";
import {
  HeatmapChart,
  ScatterChart,
  LineChart,
  BarChart,
  PieChart,
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
import type { ECharts, ComposeOption, SetOptionOpts } from "echarts/core";
import type {
  BarSeriesOption,
  LineSeriesOption,
  ScatterSeriesOption,
} from "echarts/charts";
import type {
  TitleComponentOption,
  GridComponentOption,
} from "echarts/components";

// Register the required components
use([
  LegendComponent,
  ScatterChart,
  LineChart,
  BarChart,
  HeatmapChart,
  PieChart,
  MatrixComponent,
  VisualMapComponent,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  ToolboxComponent, // A group of utility tools, which includes export, data view, dynamic type switching, data area zooming, and reset.
  DataZoomComponent, // Used in Line Graph Charts
  CanvasRenderer, // If you only need to use the canvas rendering mode, the bundle will not include the SVGRenderer module, which is not needed.
]);

// Combine an Option type with only required components and charts via ComposeOption
export type EChartsOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | GridComponentOption
  | ScatterSeriesOption
>;

export interface ReactEChartsWrapperProps {
  option: EChartsOption;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  theme?: "light" | "dark";
}

export const ReactEChartsWrapper = forwardRef<
  ECharts | null,
  ReactEChartsWrapperProps
>(
  (
    {
      option,
      style,
      settings,
      loading = false,
      theme,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ECharts | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

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
      chartRef.current = init(containerRef.current, theme);

      // Expose chart instance via ref
      if (ref) {
        if (typeof ref === 'function') {
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
    // className={`tw:min-h-${chartExpansionFactor * 100}`}
    return (
      <div
        ref={containerRef}
        className="tw:w-full tw:h-full tw:min-h-100"
        style={{ ...style }}
      />
    );
  },
);

ReactEChartsWrapper.displayName = "ReactEChartsWrapper";
