import { useContext } from "react";
import { ReactEChartsWrapper } from "@components/ReactEChartsWrapper";
import { ShowReferenceValuesContext } from "@components/LineChartGroup";
import { type Charts, mutedColorPalette, referenceColors } from "@utils/charts";
import * as echarts from "echarts/core";
import {
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  getLabelFromValueAndDataSeriesName,
  getDataSeriesNameFromShortName,
  type Visualization,
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
} from "echarts";

interface Props {
  title?: string;
  subtitle?: string;
  height?: number;
  data: Visualization.ChartData;
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



const LineChart = ({
  title,
  subtitle,
  height = 400,
  data,
  colors = mutedColorPalette,
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

  console.log("Line Chart xData: ", xData);
  console.log("Line Chart yData: ", yData);

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
      }
      return [
        { ...point, yAxis: yVal, x: "3%" },
        { yAxis: yVal, x: "97%" },
      ];
    }
  );
  
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
    const seriesList: any[] = [];
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
        type: "line",
        data: dataseries.data,
        ...(markLine && { markLine }),
        ...(markArea && { markArea }),
      };
      seriesList.push(series);
    });
    return seriesList;
  };

  const yAxisFormatter = (value: number, _index: number) => {
    if (value === Math.max(0, minMaxYValues[0])) {
      return minMaxYLabels ? `{health|${minMaxYLabels[0]}}` : value.toString();
    }
    if (value === Math.min(1, minMaxYValues[1])) {
      return minMaxYLabels ? `{health|${minMaxYLabels[1]}}` : value.toString();
    }
    return value.toString();
  };

  const legendTooltipFormatter = (params: any) => {
    console.log("Legend Params: ", params);
    const { name } = params;
    console.log("Legend Name: ", name);
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

  const referenceTooltipFormatter = (params: any) => {
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

  const tooltipFormatter = (params: any) => {
    if (
      params.componentType === "markLine" ||
      params.componentType === "markArea"
    ) {
      return referenceTooltipFormatter(params);
    }
    const { seriesName, value, name } = params;
    console.log("Tooltip Params: ", params);
    console.log("Tooltip Series Name: ", seriesName);
    console.log("Tooltip Value: ", value);
    console.log("Tooltip date: ", name);
    const originalValue = getOriginalValueFromNormalizedValueAndDataSeriesName(
      yData,
      value,
      seriesName,
    );
    const label = getLabelFromValueAndDataSeriesName(yData, value, seriesName);
    // const longName = getDataSeriesNameFromShortName(yData, seriesName);
    // const displayName = longName.length > 0 ? longName : seriesName;

    if (originalValue !== null) {
      if (displayNameInTooltip) {
        
          return `
      <div class="tooltip-content">
        ${echarts.format.encodeHTML(seriesName)}<br/>
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
        // @ts-ignore
        renderMode: "html",
        // className: "echarts-tooltip",
        confine: true,
        formatter: (params: any) => legendTooltipFormatter(params),
      },
    },
    tooltip: {
      ...tooltipOptions,
      renderMode: "html",
      // className: "echarts-tooltip",
      confine: true,
      formatter: (params: any) => tooltipFormatter(params),
    },
    // @ts-ignore
    xAxis: {
      ...xAxisOptions,
      type: "category",
      data: xData,
    },
    yAxis: {
      ...yAxisOptions,
      // @ts-ignore
      type: "value",
      min: minMaxYValues[0],
      max: minMaxYValues[1],
      axisLabel: {
        ...yAxisOptions?.axisLabel,
        customValues: minMaxYValuesPosition,
        formatter: (value: number, index: number) =>
          yAxisFormatter(value, index),
        rich: {
          health: {
            // fontWeight: "bold",
          },
        },
      },
      axisTick:{
        ...yAxisOptions?.axisTick,
        customValues: minMaxYValuesPosition,
      }
    },
    grid: {
      ...gridOptions,
    },
    series: generateSeriesList(),
  };

  return (
    <>
      <ReactEChartsWrapper
        option={options}
        chartHeight={height}
        enableExport={enableExport}
        exportFileName={exportFileName ?? title}
      />
    </>
  );
};

export default LineChart;
