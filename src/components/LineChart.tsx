import { ReactEChartsWrapper } from "@components/ReactEChartsWrapper";
import type { Visualization } from "@customTypes/visualization";
import { Tooltip, Title } from "@styles/chartLayout";
import * as echarts from "echarts/core";
import { 
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  getNameForDataSeriesFromShortName,
 } from "@utils/helpers";

 import "@styles/echartStyles.css";

const LineChart = ({ title, subtitle, data }: Visualization.LineChartProps) => {
  const { xData, yData } = data;

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
          show: true,
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

  const tooltipFormatter = (params: any) => {
    const { seriesName, value, name } = params;
    const originalValue = getOriginalValueFromNormalizedValueAndDataSeriesName(
      yData,
      value,
      seriesName,
    );
    const longName = getNameForDataSeriesFromShortName(yData, seriesName);
    const displayName = longName ? longName : seriesName;

    if (originalValue !== null) {
      
      return `
      <div class="tooltip-content">
        ${displayName === seriesName ? echarts.format.encodeHTML(displayName) : echarts.format.encodeHTML(displayName)}
        &nbsp;(${echarts.format.encodeHTML(seriesName)})<br/>
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
    //legend: {},
    tooltip: {
      show: true,
      renderMode: 'html',
      className: 'echarts-tooltip',
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
