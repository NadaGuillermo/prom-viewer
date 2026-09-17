/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  type CSSProperties,
} from "react";
import type { ECharts, SetOptionOpts } from "echarts/core";
import { init, use as registerEChartsComponents } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, RadarChart } from "echarts/charts";
import {
  LegendComponent,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  MarkLineComponent,
  MarkAreaComponent,
} from "echarts/components";

import DownloadImageButton from "@components/DownloadImageButton";
import type * as Charts from "@utils/charts";
import { buildExportFileName, captureAndDownloadElement } from "@utils/export";

registerEChartsComponents([
  LegendComponent,
  LineChart,
  RadarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  CanvasRenderer,
  MarkLineComponent,
  MarkAreaComponent,
]);

interface Props {
  chartId: string;
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

/**
 * A React wrapper component for ECharts that handles chart initialization, option updates, loading state, and exporting the chart as an image.
 * It uses a forwardRef to expose the ECharts instance to parent components.
 * The component also includes a download button for exporting the chart as an image if enabled.
 */
export const ReactEChartsWrapper = forwardRef<ECharts | null, Props>(
  (
    {
      chartId,
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
    /**
     * Initialize / Reinitialize chart (theme changes require dispose)
     */
    useEffect(() => {
      if (!containerRef.current) return;

      const notReadyFrame = requestAnimationFrame(() => setIsChartReady(false));

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
        cancelAnimationFrame(notReadyFrame);

        resizeObserverRef.current?.disconnect();
        resizeObserverRef.current = null;

        chartRef.current?.dispose();
        chartRef.current = null;
      };
    }, [theme, ref, chartHeight]);

    /**
     * Update chart options
     */
    useEffect(() => {
      if (!chartRef.current) return;

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
    }, [option, settings, theme]);

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

    return (
      <div
        className={`tw:relative ${useMinHeight ? "tw:h-full tw:w-full tw:min-h-100" : "tw:h-full tw:w-full"}`}
      >
        <div
          ref={containerRef}
          className="tw:h-full tw:w-full"
          style={{ ...style }}
        />
        {enableExport === true && (
          <DownloadImageButton
            id={chartId}
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
