import { ReactEChartsWrapper } from "@components/ReactEChartsWrapper";
import type { Visualization } from "@customTypes/visualization";
import { DIMENSIONS } from "@data/mapping/constants";

const RadarChart = ({ title, subtitle, data }: Visualization.RadarProps) => {
  // assume one dataseries per dimension in data.yData

  const dataDimensions = [
    ...new Set(data.yData.map((series) => series.dimension)),
  ];

  const sortedDataDimensions = DIMENSIONS.flatMap((dimension) =>
    dataDimensions.filter((dim) => dim === dimension),
  );
  console.log("Sorted Data Dimensions: ", sortedDataDimensions);

  const radarIndicators = sortedDataDimensions.map((dimension) => ({
    name: dimension,
    max: 1, // assuming normalized scores between 0 and 1
  }));

  const chartData = data.xData.map((date) => ({
    name: date,
    value: sortedDataDimensions.map((dimension) => {
      const seriesForDimension = data.yData.find(
        (series) => series.dimension === dimension,
      );
      if (seriesForDimension) {
        const index = data.xData.indexOf(date);
        return seriesForDimension.data[index] === null
          ? 0
          : seriesForDimension.data[index]; // handle null as 0 (or null)
      } else {
        return 0; // or null, depending on how you want to handle missing data
      }
    }),
  }));

  const options: Visualization.EChartsOption = {
    title: {
      text: title,
      subtext: subtitle,
    },
    legend: {
      // orient: 'vertical',
      //left: 'right',
      // top: 'middle',
      // right: "25%",
      // align: 'left',
      //padding: [5, 200, 5, 5],
      bottom: 50,
    },
    radar: {
      indicator: radarIndicators,
    },
    series: [
      {
        type: "radar",
        emphasis: {
          lineStyle: {
            width: 4,
          },
        },
        data: chartData,
      },
    ],
  };

  return (
    <>
      <ReactEChartsWrapper option={options} chartHeight={350} />
    </>
  );
};

export default RadarChart;
