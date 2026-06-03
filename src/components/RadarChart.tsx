import { ReactEChartsWrapper } from "@components/ReactEChartsWrapper";
import type { Visualization } from "@utils/visualization/types";

const RadarChart = ({
  title,
  subtitle,
  data,
  dimensions,
}: Visualization.RadarProps) => {
  
  // const allDimensions = Object.values(data.data).flatMap((dimensions) => dimensions);
  // const uniqueDimensions = [...new Set(dimensions)].sort();

  const chartData = Object.entries(data).map(([questionnaire, questionnaireDimensions]) => ({
    name: questionnaire,
    value: dimensions.map((dimension) => {
      if (questionnaireDimensions.includes(dimension)) {
        return Math.min(Math.random() + Math.random(), 0.95);
      } else {
        return 0;
      }
    }),
  }));
      
  const radarIndicators = dimensions.map((dimension) => ({
    name: dimension,
    max: 1,
  }));


  // assume one dataseries per dimension in data.yData!!!

  // calculate dimension value per questionnaire and date -> one dataSeries per dimension
  // const dataByQuestionnaire: Record<string, Visualization.DataSeries[]> = {};
  // data.yData.forEach((series) => {
  //   if (!dataByQuestionnaire[series.questionnaire]) {
  //     dataByQuestionnaire[series.questionnaire] = [];
  //   }
  //   dataByQuestionnaire[series.questionnaire].push(series);
  // })

  // const dimensionsOfData = [
  //   ...new Set(data.yData.map((series) => series.dimension)),
  // ];

  // const sortedDimensionsOfData = dimensions.flatMap((dimension) =>
  //   dimensionsOfData.filter((dim) => dim === dimension),
  // );
  // // console.log("Sorted Data Dimensions: ", sortedDataDimensions);

  // const radarIndicators = sortedDimensionsOfData.map((dimension) => ({
  //   name: dimension,
  //   max: 1, // assuming normalized scores between 0 and 1
  // }));

  // const questionnaires = [... new Set(data.yData.map((series) => series.questionnaire))];

  // const chartData = questionnaires.map((questionnaire) => ({
  //   name: data.yData.find((series) => series.questionnaire === questionnaire)?.questionnaireName,
  //   value: sortedDimensionsOfData.map((dimension) => {
  //     const seriesForDimension = data.yData.find(
  //       (series) => series.dimension === dimension,
  //     );
  //     if (seriesForDimension) {
  //       const index = questionnaires.indexOf(questionnaire);
  //       return seriesForDimension.data[index] === null
  //         ? 0
  //         : seriesForDimension.data[index]; // handle null as 0 (or null)
  //     } else {
  //       return 0; // or null, depending on how you want to handle missing data
  //     }
  //   }),
  // }));

  const options: Visualization.EChartsOption = {
    title: {
      text: title,
      subtext: subtitle,
    },
    legend: {
      orient: 'vertical',
      //left: 'right',
      // top: 'middle',
      // right: "25%",
      // align: 'left',
      //padding: [5, 200, 5, 5],
      // bottom: 50,
      textStyle: {
        overflow: "break",
      }
    },
    radar: {
      indicator: radarIndicators,
      //shape: 'circle',
      // splitNumber: 0,
      axisLine: {
        show: true, //false,
      },
      splitLine: {
        show: true, //false,
      },
    },
    series: [
      {
        type: "radar",
        symbol: "circle",
        symbolSize: 8,
        lineStyle: {
          width: 2,
        },
        areaStyle: {
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          //shadowBlur: 10,
          opacity: 0.2,
        },
        emphasis: {
          lineStyle: {
            width: 4,
          },
          areaStyle: {
            opacity: 0.4,
          },
        },
        data: chartData,
      },
    ],
  };

  return (
    <>
      <ReactEChartsWrapper option={options} chartHeight={400} />
    </>
  );
};

export default RadarChart;
