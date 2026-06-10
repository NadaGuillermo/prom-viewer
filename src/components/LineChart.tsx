import { ReactEChartsWrapper } from "@components/ReactEChartsWrapper";
import type { Charts } from "@utils/charts";
import * as echarts from "echarts/core";
import {
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  getDataSeriesNameFromShortName,
  type Visualization,
} from "@utils/visualization";

import "@styles/echartStyles.css";

import type {
  TitleComponentOption,
  GridComponentOption,
  LegendComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
  TooltipComponentOption,
  LineSeriesOption,
} from "echarts";

interface Props {
  title?: string;
  subtitle?: string;
  height?: number;
  data: Visualization.ChartData;
  titleOptions?: TitleComponentOption;
  legendOptions?: LegendComponentOption;
  gridOptions?: GridComponentOption;
  xAxisOptions?: XAXisComponentOption;
  yAxisOptions?: YAXisComponentOption;
  tooltipOptions?: TooltipComponentOption;
  minMaxYLabels?: [string, string];
  minMaxYValues?: [number, number];
  minMaxYValuesPosition?: [number, number];
  showLegendTooltip?: boolean;
  lineOption?: LineSeriesOption;
}

const LineChart = ({
  title,
  subtitle,
  height = 400,
  data,
  titleOptions,
  legendOptions,
  gridOptions,
  xAxisOptions,
  yAxisOptions,
  tooltipOptions,
  minMaxYLabels,
  minMaxYValues = [0, 1],
  minMaxYValuesPosition,
  showLegendTooltip = true,
  lineOption,
}: Props) => {
  const { xData, yData } = data;

  console.log("Line Chart xData: ", xData);
  console.log("Line Chart yData: ", yData);

  const generateSeriesList = () => {
    const seriesList: any[] = [];
    yData.forEach((dataseries) => {
      const series = {
        name: dataseries.shortName,
        type: "line",
        data: dataseries.data,
        ...lineOption,
        // connectNulls: true,
        // symbol: "circle",
        // symbolSize: 7,
        // emphasis: {
        //   focus: "series",
        // },
        // endLabel: {
        //   show: false,
        //   formatter: "{a}",
        //   distance: 20,
        // },
        // lineStyle: {
        //   width: 3,
        // }
        // select: {
        //   selectedMode: "series",
        // }
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

  const tooltipFormatter = (params: any) => {
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
    const longName = getDataSeriesNameFromShortName(yData, seriesName);
    const displayName = longName ? longName : seriesName;

    if (originalValue !== null) {
      return `
      <div class="tooltip-content">
        ${echarts.format.encodeHTML(seriesName)}<br/>
        ${echarts.format.encodeHTML(name)}:
        &nbsp;<b>${echarts.format.encodeHTML(originalValue.toString())}</b>
      </div>
      `;
    }

    return `
    <div class="tooltip-content">
      ${echarts.format.encodeHTML(value)}
    </div>
    `;
  };

  const options: Charts.EChartsOption = {
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
        className: "echarts-tooltip",
        confine: true,
        formatter: (params: any) => legendTooltipFormatter(params),
      },
    },
    tooltip: {
      ...tooltipOptions,
      renderMode: "html",
      className: "echarts-tooltip",
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
      <ReactEChartsWrapper option={options} chartHeight={height} />
    </>
  );
};

export default LineChart;
