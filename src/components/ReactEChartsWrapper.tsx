import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  type CSSProperties,
} from "react";
import type { Charts } from "@utils/charts";
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
  SankeyChart,
} from "echarts/charts";
import {
  LegendComponent,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  TitleComponent,
  DataZoomComponent,
  MatrixComponent,
  MarkLineComponent,
  MarkAreaComponent,
} from "echarts/components";

import DownloadImageButton from "@components/DownloadImageButton";
import {
  buildExportFileName,
  captureAndDownloadElement,
} from "@utils/export";

import type { SetOptionOpts } from "echarts/core";

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
  DataZoomComponent,
  CanvasRenderer,
  SankeyChart,
  MarkLineComponent,
  MarkAreaComponent,
]);

interface Props {
  option: Charts.EChartsOption;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  theme?: "light" | "dark";
  chartHeight?: number;
  useMinHeight?: boolean;
  enableExport?: boolean;
  exportFileName?: string;
}

export const ReactEChartsWrapper = forwardRef<ECharts | null, Props>(
  (
    {
      option,
      style,
      settings,
      loading = false,
      theme,
      chartHeight,
      useMinHeight,
      enableExport = false,
      exportFileName,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ECharts | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const [isChartReady, setIsChartReady] = useState(false);
    // const [chartHeight, setChartHeight] = useState<number>(0);
    // const [height, setHeight] = useState<number>(chartHeight ?? 0);
    //
    /**
     * Initialize / Reinitialize chart (theme changes require dispose)
     */
    useEffect(() => {
      if (!containerRef.current) return;

      setIsChartReady(false);

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
        notMerge: true,
        replaceMerge: undefined,
        lazyUpdate: false,
        ...settings,
      });
      requestAnimationFrame(() => {
        chartRef.current?.resize();
        setIsChartReady(true);
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

    const handleDownload = () => {
      if (!containerRef.current) return;
      captureAndDownloadElement(
        containerRef.current,
        buildExportFileName(exportFileName ?? "file", "png"),
      );
    };

    // tw:min-h-100 Höhen ändern !!
    // height: chartHeight ? `${chartHeight}px` : undefined,
    return (
      <div
        className={`tw:relative ${useMinHeight ? "tw:h-full tw:w-full tw:min-h-100" : "tw:h-full tw:w-full"}`}
      >
        <div
          ref={containerRef}
          className="tw:h-full tw:w-full"
          style={{ ...style }}
        />
        {enableExport && (
          <DownloadImageButton
            onClick={handleDownload}
            disabled={!isChartReady}
            className="tw:absolute tw:top-4 tw:right-2"
            tooltipText="Save as image"
          />
        )}
      </div>
    );
  },
);

ReactEChartsWrapper.displayName = "ReactEChartsWrapper";
