import { ReactEChartsWrapper } from "@utils/ReactEChartsWrapper";
import type { Visualization } from "@customTypes/visualization";
import type { VariableDomains as Domains } from "@customTypes/variableDomains";
// import * as echarts from "echarts/core";

import {
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  isScoreSeries,
} from "@utils/helpers";
import { globalDimension, DIMENSIONS } from "@utils/constants";
import _ from "lodash";


const Table = ({
  title,
  subtitle,
  data,
}: Visualization.TableProps) => {
  
  // data already for one questionnaire
  



  // add questionnaire name to yData
  const matrixYData = data.yData;
  //   .map((series) => {
  //     const label = series.name;
  //     return { ...series, name: label };
  //   });
  const scores = matrixYData.filter(
    (dataseries) => dataseries.seriesType === "score",
  );

  const globalScores = scores.filter(
    (score) =>
      score.dimension === globalDimension,
  );

  // const otherScores = scores.filter(
  //   (score) =>
  //     score.dimension === otherDimension,
  // );

  // console.log("Other Scores in Table: ", otherScores);

  const dimensionScores = _.difference(scores, globalScores);

  // sort dimension scores according to DIMENSIONS in constants.ts
  const dimensionScoresSorted = DIMENSIONS.flatMap((dimension) =>
    dimensionScores.filter((score) => score.dimension === dimension)
  );

  const itemsNotReferencedInScores = matrixYData.filter(
    (dataseries) =>
      dataseries.seriesType === "item" && !scores.some((score) => score.referencedItems?.includes(dataseries.id))
  );

  const dimensionScoresWithReferencedItems = dimensionScoresSorted.map((score) => {
    const referencedItems = matrixYData.filter(
      (dataseries) =>
        dataseries.seriesType === "item" && score.referencedItems?.includes(dataseries.id)
    );
    return {score: score, items: referencedItems};
  });

  const sortedMatrixYData = [
    ...globalScores,
    //...otherScores,
    ...dimensionScoresWithReferencedItems.flatMap((scoreWithItems) => [scoreWithItems.score, ...scoreWithItems.items]),
    ...itemsNotReferencedInScores,
  ];
  
  // const items = data.yData.filter(dataseries =>
  //   dataseries.seriesType === "item"
  // );
  const xData = data.xData;

  // const itemsGroupedByDimension = groupItemsByDimension(items);
  // const dimensionScoresGroupedByDimension = groupItemsByDimension(dimensionScores);

  // add additional row to xData
  // xData.unshift("");

  const chartData: [string, string, Domains.NumberOrNull][] = [];
  sortedMatrixYData.forEach((series) => {
    const rows: [string, string, Domains.NumberOrNull][] = xData.map(
      (x, index) => {
        return [
          x,
          series.name,
          series.data[index] === null ? Infinity : series.data[index],
        ];
      },
    );
    chartData.push(...rows);
  });

  // const itemDimensions = Object.keys(itemsGroupedByDimension);
  // const scoreDimensions = Object.keys(dimensionScoresGroupedByDimension);

  // const dimensions = new Set([...itemDimensions, ...scoreDimensions]);

  // globalScores.forEach((score) => {
  //   const rows: [string, string, Domains.NumberOrNull][] = xData.map((x, i) => {
  //     return [x, score.name, score.data[i] === null ? Infinity : score.data[i]];
  //   })
  //   chartData.push(...rows);
  // });

  // dimensions.forEach((dimension) => {
  //   dimensionScoresGroupedByDimension[dimension]?.forEach((score) => {
  //     const rows: [string, string, Domains.NumberOrNull][] = xData.map((x, i) => {
  //     return [x, score.name, score.data[i] === null ? Infinity : score.data[i]];
  //   })
  //   chartData.push(...rows);
  //   });
  //   itemsGroupedByDimension[dimension]?.forEach((item) => {
  //     const rows: [string, string, Domains.NumberOrNull][] = xData.map((x, i) => {
  //     return [x, item.name, item.data[i] === null ? Infinity : item.data[i]];
  //   })
  //   chartData.push(...rows);
  //   });
  // });

  console.log("chartData in Table: ", chartData);
  // const getRowData = (series: Visualization.DataSeries, xData: string[]) => {
  //   const seriesRows: [string, string, Domains.NumberOrNull][] = xData.map((x, index) => {
  //     return [x, series.name, series.data[index] === null ? Infinity : series.data[index]];
  //   });
  //   return seriesRows;
  // }

  // const seriesData: any[] = yData.map((series) => {
  //   return {
  //     name: series.name,
  //     type: "scatter",
  //     coordinateSystem: "matrix",
  //     data: getRowData(series, xData),
  //     itemStyle: {
  //       opacity: 1,
  //     },
  //     label: {
  //       show: true,
  //       formatter: (params: any) => labelWithOriginalScores(params), // params.value[2].toFixed(3), //labelWithOriginalScores(params),
  //     },
  //   };
  // });

  const labelWithOriginalScores = (params: any) => {
    const { value } = params;
    const originalValue = getOriginalValueFromNormalizedValueAndDataSeriesName(
      sortedMatrixYData,
      value[2],
      value[1],
    );
    const valueIsScore = isScoreSeries(scores, value[1]);
    const originalValueString =
      originalValue !== null && originalValue !== undefined
        ? originalValue.toString()
        : "";

    return valueIsScore
      ? `{score|${originalValueString}}`
      : `{item|${originalValueString}}`;
  };

  const yAxisFormatter = (value: string) => {
    const isScore = isScoreSeries(scores, value);
    return isScore ? `{score|${value}}` : `{item|${value}}`;
  };

  // const tooltipFormatter = (params: any) => {
  //   const { value, name } = params;
  //   const originalValue = getOriginalValueFromNormalizedValueAndDataSeriesName(
  //     sortedMatrixYData,
  //     value[2],
  //     value[1],
  //   );

  //   if (originalValue !== null) {
  //     return (
  //       echarts.format.encodeHTML(value[1]) +
  //       "<br/>" +
  //       echarts.format.encodeHTML(name) +
  //       ":" +
  //       "&nbsp;" +
  //       "<b>" +
  //       echarts.format.encodeHTML(originalValue.toString()) +
  //       "</b>"
  //     );
  //   }
  //   return echarts.format.encodeHTML(value[2]);
  // };

  const options: Visualization.EChartsOption = {
    animation: false,
    title: {
      text: title,
      subtext: subtitle,
    },
    // tooltip: {
    //   formatter: (params: any) => tooltipFormatter(params),
    // },
    xAxis: [
      {
        type: "category",
        data: xData,
        splitLine: {
          show: false,
        },
        // position: "top",
      },
      {
        type: "category",
        data: xData,
        splitLine: {
          show: false,
        },
      },
    ],
    yAxis: {
      type: "category",
      data: sortedMatrixYData.map((d) => d.name),
      splitLine: {
        show: true,
      },
      axisLine: {
        show: false,
      },
      inverse: true,
      axisLabel: {
        formatter: (value: string) => yAxisFormatter(value),
        rich: {
          score: { fontWeight: "bold" },
          // item: { },
        },
      },
    },
    visualMap: {
      show: false,
      min: 0,
      max: 0,
      inRange: {
        color: ["transparent"],
      },
    },
    // seriesData,
    series: {
      type: "heatmap",
      // coordinateSystem: "matrix",
      data: chartData,
      itemStyle: {
        opacity: 1,
      },
      label: {
        show: true,
        color: "#666",
        formatter: (params: any) => labelWithOriginalScores(params), // params.value[2].toFixed(3), //labelWithOriginalScores(params),
        rich: {
          score: { fontWeight: "bold", fontSize: 10 },
          item: { fontSize: 10 },
        },
      },
      emphasis: {
        disabled: true,
      },
    },
  };
  // style={{ width: "100%", height: `${data.length * 25}px` }}
  let chartHeight = 0;
  if (matrixYData.length === 0) {
    chartHeight = 0;
  } else if (matrixYData.length === 1) {
    chartHeight = (matrixYData.length + 3) * 36;
  } else if (matrixYData.length === 2) {
    chartHeight = (matrixYData.length + 3) * 32;
  } else {
    chartHeight = (matrixYData.length + 3) * (32 - 2 * Math.ceil(Math.log2(matrixYData.length)));
  }

  return (
    <>
      <ReactEChartsWrapper option={options} chartHeight={chartHeight} />
    </>
  );
};

export default Table;
