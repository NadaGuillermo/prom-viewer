import { ReactEChartsWrapper } from "@utils/ReactEChartsWrapper";
import type { Visualization } from "@customTypes/visualization";
import { Tooltip, Title } from "@styles/chartLayout";
import * as echarts from "echarts/core";
import { getOriginalValueFromNormalizedValueAndDataSeriesName } from "@utils/helpers";

const LineChart = ({
  title,
  subtitle,
  data,
}: Visualization.LineChartProps) => {
  const { xData, yData } = data;

  const generateSeriesList = () => {
    const seriesList:any[] = [];
    yData.forEach((dataseries) => {
      const series = {
        name: dataseries.name,
        type: "line",
        data: dataseries.data,
        connectNulls: true,
        emphasis: {
        focus: 'series',
      },
      endLabel: {
        show: true,
        formatter: '{a}',
        distance: 20
      },
      // select: {
      //   selectedMode: "series",
      // }
      };
      seriesList.push(series);
    });
    return seriesList;
  };

  const SPLIT_NUMBER = 5;

  const yAxisFormatter = (value: number, index: number) => {
    if (index === 0) {
      return `{health|Worst Health}`;
    }
    if (index === SPLIT_NUMBER) {
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

    if (originalValue !== null) {
      return (
        echarts.format.encodeHTML(seriesName) +
        "<br/>" +
        echarts.format.encodeHTML(name) +
        ":" +
        "&nbsp;" +
        "<b>" +
        echarts.format.encodeHTML(originalValue.toString()) +
        "</b>"
      );
    }

    return echarts.format.encodeHTML(value);
  };

  const options: Visualization.EChartsOption = {
    title: Title({
      text: title,
      subtext: subtitle,
    }),
    //legend: {},
    tooltip: {
      formatter: (params: any) => tooltipFormatter(params),
    },
    xAxis: {
      type: "category",
      data: xData,
    },
    yAxis: {
      type: "value",
      splitNumber: SPLIT_NUMBER,
      axisLine: {
        show: true,
      },
      axisLabel: {
        formatter: (value: number, index: number) => yAxisFormatter(value, index),
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
      <ReactEChartsWrapper option={options} chartHeight={350} />
    </>
  );
};

export default LineChart;
