/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import { lazy, memo, Suspense, useContext } from "react";
import * as echarts from "echarts/core";

import { ShowReferenceValuesContext } from "@components/ShowReferenceValuesContext";
import type * as Charts from "@utils/charts";
import { tolColorPalette, referenceColors } from "@utils/charts";
import type * as Visualization from "@utils/visualization";
import {
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  getLabelFromValueAndDataSeriesName,
  getDataSeriesNameFromShortName,
} from "@utils/visualization";

import type {
  TitleComponentOption,
  GridComponentOption,
  LegendComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
  TooltipComponentOption,
  LineSeriesOption,
  MarkAreaComponentOption,
  MarkLineComponentOption,
  DefaultLabelFormatterCallbackParams as CallbackDataParams,
  TooltipComponentFormatterCallbackParams as TopLevelFormatterParams,
} from "echarts";

const ReactEChartsWrapper = lazy(() =>
  import("@components/ReactEChartsWrapper").then((module) => ({
    default: module.ReactEChartsWrapper,
  })),
);

type ReferenceTooltipParams = CallbackDataParams & {
  data?: { referenceDescription?: string; referenceValueLabel?: string };
};

interface Props {
  id: string;
  data: Visualization.ChartData;
  title?: string;
  subtitle?: string;
  height?: number;
  colors?: string[];
  titleOptions?: TitleComponentOption;
  legendOptions?: LegendComponentOption;
  gridOptions?: GridComponentOption;
  xAxisOptions?: XAXisComponentOption;
  yAxisOptions?: YAXisComponentOption;
  tooltipOptions?: TooltipComponentOption;
  markAreaOptions?: MarkAreaComponentOption;
  markLineOptions?: MarkLineComponentOption;
  minMaxYLabels?: [string, string];
  minMaxYValues?: [number, number];
  minMaxYValuesPosition?: [number, number];
  showLegendTooltip?: boolean;
  lineOption?: LineSeriesOption;
  displayNameInTooltip?: boolean;
  enableExport?: boolean;
  exportFileName?: string;
  showReferenceValues?: boolean;
}

/**
 * LineChart component renders a line chart using ECharts library.
 */
const LineChart = ({
  id,
  data,
  title,
  subtitle,
  height = 400,
  colors = tolColorPalette,
  titleOptions,
  legendOptions,
  gridOptions,
  xAxisOptions,
  yAxisOptions,
  tooltipOptions,
  markAreaOptions,
  markLineOptions,
  minMaxYLabels,
  minMaxYValues = [0, 1],
  minMaxYValuesPosition,
  showLegendTooltip = true,
  lineOption,
  displayNameInTooltip = true,
  enableExport = false,
  exportFileName,
  showReferenceValues,
}: Props) => {
  const { xData, yData } = data;
  const groupShowReferenceValues = useContext(ShowReferenceValuesContext);
  const shouldShowReferenceValues =
    showReferenceValues ?? groupShowReferenceValues;

  const formatReferenceValue = (value: Visualization.NumberOrTuple): string =>
    Array.isArray(value) ? `${value[0]} - ${value[1]}` : `${value}`;

  const buildReferenceMarkLine = (
    referenceValues: Visualization.ReferenceRange[],
  ) => {
    const data = referenceValues
      .filter((ref) => typeof ref.normalizedValue === "number")
      .map((ref) => {
        const yVal = ref.normalizedValue as number;
        const point = {
          name: ref.name,
          referenceDescription: ref.description,
          referenceValueLabel: formatReferenceValue(ref.value),
          lineStyle: { color: referenceColors.line },
          label: { show: false },
        };
        return [
          { ...point, yAxis: yVal, x: "3%" },
          { yAxis: yVal, x: "97%" },
        ];
      });

    if (data.length === 0) return undefined;
    return {
      ...markLineOptions,
      symbol: ["none", "none"] as [string, string],
      data,
    };
  };

  const buildReferenceMarkArea = (
    referenceValues: Visualization.ReferenceRange[],
  ) => {
    const ranges = referenceValues.filter((ref) =>
      Array.isArray(ref.normalizedValue),
    );
    const data = ranges.map((ref, index) => {
      const [min, max] = ref.normalizedValue as [number, number];
      const opacity =
        referenceColors.box.opacities[
          Math.min(index, referenceColors.box.opacities.length - 1)
        ];
      const point = {
        name: ref.name,
        referenceDescription: ref.description,
        referenceValueLabel: formatReferenceValue(ref.value),
        itemStyle: { color: referenceColors.box.color, opacity },
        label: { show: false },
      };
      return [
        { ...point, yAxis: min, x: "95%" },
        { ...point, yAxis: max, x: "5%" },
      ];
    });
    if (data.length === 0) return undefined;
    return {
      ...markAreaOptions,
      data,
    };
  };

  const generateSeriesList = () => {
    const seriesList: LineSeriesOption[] = [];
    yData.forEach((dataseries) => {
      const referenceValues =
        shouldShowReferenceValues && dataseries.referenceValues
          ? dataseries.referenceValues
          : [];
      const markLine = buildReferenceMarkLine(referenceValues);
      const markArea = buildReferenceMarkArea(referenceValues);
      const series = {
        ...lineOption,
        name: dataseries.shortName,
        type: "line" as const,
        data: dataseries.data,
        ...(markLine && { markLine }),
        ...(markArea && { markArea }),
      };
      seriesList.push(series as LineSeriesOption);
    });
    return seriesList;
  };

  const yAxisFormatter = (value: number) => {
    if (value === Math.max(0, minMaxYValues[0])) {
      return minMaxYLabels ? `{health|${minMaxYLabels[0]}}` : value.toString();
    }
    if (value === Math.min(1, minMaxYValues[1])) {
      return minMaxYLabels ? `{health|${minMaxYLabels[1]}}` : value.toString();
    }
    return value.toString();
  };

  const legendTooltipFormatter = (params: { name: string }) => {
    const { name } = params;
    const longName = getDataSeriesNameFromShortName(yData, name);
    const questionnaireName = yData.find(
      (series) => series.shortName === name,
    )?.questionnaireName;
    const questionnaireLabel = questionnaireName ? `${questionnaireName}` : "";
    return `
      <div class="tooltip-content">
        ${echarts.format.encodeHTML(name)}: ${echarts.format.encodeHTML(longName ? longName : "")} (${echarts.format.encodeHTML(questionnaireLabel)})
      </div>
    `;
  };

  const referenceTooltipFormatter = (params: ReferenceTooltipParams) => {
    const { name, data } = params;
    const description = data?.referenceDescription;
    const valueLabel = data?.referenceValueLabel;
    return `
      <div class="tooltip-content">
        ${echarts.format.encodeHTML(name ?? "")}
        ${description ? `<br/>${echarts.format.encodeHTML(description)}` : ""}
        <br/><b>${echarts.format.encodeHTML(valueLabel ?? "")}</b>
      </div>
    `;
  };

  const tooltipFormatter = (params: CallbackDataParams) => {
    if (
      params.componentType === "markLine" ||
      params.componentType === "markArea"
    ) {
      return referenceTooltipFormatter(params as ReferenceTooltipParams);
    }
    const { seriesName, value, name } = params;
    const originalValue = getOriginalValueFromNormalizedValueAndDataSeriesName(
      yData,
      Number(value),
      seriesName ?? "",
    );
    const label = getLabelFromValueAndDataSeriesName(
      yData,
      Number(value),
      seriesName ?? "",
    );

    if (originalValue !== null) {
      if (displayNameInTooltip) {
        return `
      <div class="tooltip-content">
        ${echarts.format.encodeHTML(seriesName ?? "")}<br/>
        ${echarts.format.encodeHTML(name)}:
        &nbsp;<b>${echarts.format.encodeHTML(originalValue.toString())}</b>${label.length > 0 ? " (" + echarts.format.encodeHTML(label) + ")" : ""}
      </div>
      `;
      }

      return `
      <div class="tooltip-content">
        ${echarts.format.encodeHTML(name)}:
        &nbsp;<b>${echarts.format.encodeHTML(originalValue.toString())}</b>${label.length > 0 ? " (" + echarts.format.encodeHTML(label) + ")" : ""}
      </div>
      `;
    }

    return "";
  };

  const options: Charts.EChartsOption = {
    color: colors,
    title: {
      ...titleOptions,
      ...(title && { text: title }),
      ...(subtitle && { subtext: subtitle }),
    },
    legend: {
      ...legendOptions,
      tooltip: {
        ...tooltipOptions,
        show: showLegendTooltip,
        formatter: (params: { name: string }) => legendTooltipFormatter(params),
      },
    },
    tooltip: {
      ...tooltipOptions,
      formatter: (params: TopLevelFormatterParams) =>
        tooltipFormatter(Array.isArray(params) ? params[0] : params),
    },
    // @ts-expect-error: Seems to be a bug in ECharts types
    xAxis: {
      ...xAxisOptions,
      type: "category",
      data: xData,
    },
    yAxis: {
      ...yAxisOptions,
      // @ts-expect-error: Seems to be a bug in ECharts types
      type: "value",
      min: minMaxYValues[0],
      max: minMaxYValues[1],
      axisLabel: {
        ...yAxisOptions?.axisLabel,
        customValues: minMaxYValuesPosition,
        formatter: (value: number,) =>
          yAxisFormatter(value,),
        rich: {
          health: {},
        },
      },
      axisTick: {
        ...yAxisOptions?.axisTick,
        customValues: minMaxYValuesPosition,
      },
    },
    grid: {
      ...gridOptions,
    },
    series: generateSeriesList(),
  };

  return (
    <Suspense
      fallback={
        <div
          className="tw:flex tw:h-full tw:w-full tw:items-center tw:justify-center"
          style={{ height }}
        >
          <span className="tw:loading tw:loading-spinner tw:loading-md" />
        </div>
      }
    >
      <ReactEChartsWrapper
        chartId={id}
        option={options}
        chartHeight={height}
        enableExport={enableExport}
        exportFileName={exportFileName ?? title}
      />
    </Suspense>
  );
};

export default memo(LineChart);
