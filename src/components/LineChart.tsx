import { ReactEChartsWrapper } from "@utils/ReactEChartsWrapper";
import type { Visualization } from "@customTypes/visualization";
import { Tooltip, Title } from "@styles/chartLayout";

const LineChart = ({ title, xData, yData }: Visualization.LineChartProps) => {
  const seriesData: any[] = [];

  yData.forEach((series) => {
    seriesData.push({
      name: series.name,
      type: "line",
      data: series.data,
      connectNulls: true,
    });
  });

  const options: Visualization.EChartsOption = {
    title: Title({ text: title }),
    legend: {},
    tooltip: {},
    xAxis: {
      type: "category",
      data: xData,
    },
    yAxis: {
      type: "value",
    },
    series: seriesData,
  };
  return (
    <>
      <ReactEChartsWrapper option={options} />
    </>
  );
};

export default LineChart;
