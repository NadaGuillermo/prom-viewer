import { ReactEChartsWrapper } from "@components/ReactEChartsWrapper";
// import type { Visualization } from "@utils/visualization";
import { Tooltip, Title } from "@styles/chartLayout";
import * as echarts from "echarts/core";
import {
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  getDataSeriesNameFromShortName, type Visualization,
} from "@utils/visualization";

import "@styles/echartStyles.css";

const LineChart = ({ title, subtitle, data }: Visualization.LineChartProps) => {
  const { xData, yData } = data;

  console.log("Line Chart xData: ", xData);
  console.log("Line Chart yData: ", yData)

  const generateSeriesList = () => {
    const seriesList: any[] = [];
    yData.forEach((dataseries) => {
      const series = {
        name: dataseries.shortName,
        type: "line",
        data: dataseries.data,
        connectNulls: true,
        emphasis: {
          focus: "series",
        },
        endLabel: {
          show: false,
          formatter: "{a}",
          distance: 20,
        },
        // select: {
        //   selectedMode: "series",
        // }
      };
      seriesList.push(series);
    });
    return seriesList;
  };

  // const SPLIT_NUMBER = 5;

  const yAxisFormatter = (value: number, _index: number) => {
    if (value === 0) {
      return `{health|Worst Health}`;
    }
    if (value === 1) {
      return `{health|Best Health}`;
    }
    return value.toString();
  };

  const legendTooltipFormatter = (params: any) => {
    console.log("Legend Params: ", params);
    const { name } = params;
    console.log("Legend Name: ", name);
    const longName = getDataSeriesNameFromShortName(yData, name);
    const questionnaireName = yData.find(
      (series) => series.shortName === name
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

  const options: Visualization.EChartsOption = {
    title: Title({
      text: title,
      subtext: subtitle,
    }),
    legend: {
      tooltip: {
        show: true,
        renderMode: "html",
        className: "echarts-tooltip",
        confine: true,
        formatter: (params: any) => legendTooltipFormatter(params),
      }
    },
    tooltip: {
      show: true,
      renderMode: "html",
      className: "echarts-tooltip",
      confine: true,
      formatter: (params: any) => tooltipFormatter(params),
    },
    xAxis: {
      type: "category",
      data: xData,
    },
    yAxis: {
      type: "value",
      // splitNumber: SPLIT_NUMBER,
      min: 0,
      max: 1,
      axisLine: {
        show: true,
      },
      axisLabel: {
        formatter: (value: number, index: number) =>
          yAxisFormatter(value, index),
        rich: {
          health: {
            // fontWeight: "bold",
          },
        },
      },
    },
    series: generateSeriesList(),
  };
  return (
    <>
      <ReactEChartsWrapper option={options} chartHeight={400} />
    </>
  );
};

export default LineChart;
