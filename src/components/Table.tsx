import { ReactEChartsWrapper } from "@components/ReactEChartsWrapper";
// import type { Visualization } from "@utils/visualization";
// import type { VariableDomains as Domains } from "@customTypes/variableDomains";
import * as echarts from "echarts/core";

import "@styles/echartStyles.css";

import {
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  isScoreSeries,
  getNameForDataSeriesFromShortName, type Visualization,
} from "@utils/visualization";
import { globalDimension } from "@utils/mapping";

import * as _ from "lodash-es";

const Table = ({
  title,
  subtitle,
  data,
  dimensions,
  errors,
}: Visualization.TableProps) => {
  // data already for one questionnaire

  // add questionnaire name to yData
  const matrixDataSeries = data.yData;
  //   .map((series) => {
  //     const label = series.name;
  //     return { ...series, name: label };
  //   });
  console.log("Table: Data Series: ", matrixDataSeries);
  const scores = matrixDataSeries.filter(
    (dataseries) => dataseries.seriesType === "score",
  );

  const globalScores = scores.filter(
    (score) => score.domain === globalDimension,
  );

  // const otherScores = scores.filter(
  //   (score) =>
  //     score.dimension === otherDimension,
  // );

  // console.log("Other Scores in Table: ", otherScores);

  const dimensionScores = _.difference(scores, globalScores);

  const dimensionScoresSorted = dimensions.flatMap((dimension) =>
    dimensionScores.filter((score) => score.domain === dimension),
  );

  const itemsNotReferencedInScores = matrixDataSeries.filter(
    (dataseries) =>
      dataseries.seriesType === "item" &&
      !scores.some((score) => score.referencedItems?.includes(dataseries.id)),
  );

  const dimensionScoresWithReferencedItems = dimensionScoresSorted.map(
    (score) => {
      const referencedItems = matrixDataSeries.filter(
        (dataseries) =>
          dataseries.seriesType === "item" &&
          score.referencedItems?.includes(dataseries.id),
      );
      return { score: score, items: referencedItems };
    },
  );

  const sortedMatrixDataSeries = [
    ...globalScores,
    //...otherScores,
    ...dimensionScoresWithReferencedItems.flatMap((scoreWithItems) => [
      scoreWithItems.score,
      ...scoreWithItems.items,
    ]),
    ...itemsNotReferencedInScores,
  ];

  // const items = data.yData.filter(dataseries =>
  //   dataseries.seriesType === "item"
  // );
  const xAxisData = [...data.xData]; //.concat("Health Trend");
  console.log("table original x data: ", data.xData);

  // add error column if needed
  if (
    errors !== undefined &&
    errors.length > 0 &&
    _.intersection(
      errors.map((error) => error.linkId),
      sortedMatrixDataSeries.map((series) => series.id),
    ).length > 0
  ) {
    xAxisData.push("Issues");
  }

  console.log("Table X Data: ", xAxisData);

  // const itemsGroupedByDimension = groupItemsByDimension(items);
  // const dimensionScoresGroupedByDimension = groupItemsByDimension(dimensionScores);

  // add additional row to xData
  // xData.unshift("");

  const chartData: [string, string, number][] = [];
  const yAxisData: string[] = [];

  sortedMatrixDataSeries.forEach((series) => {
    yAxisData.push(series.shortName);
    const row: [string, string, number][] = xAxisData.map((x, index) => {
      if (index < data.xData.length) {
        // normal data
        return [
          x,
          series.shortName,
          series.data[index] === null ? Infinity : series.data[index],
        ];
      } else if (errors?.map((error) => error.linkId).includes(series.id)) {
        // error
        return [x, series.shortName, -Infinity];
      } else {
        return [x, series.shortName, Infinity];
      }
    });
    chartData.push(...row);
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

  // console.log("chartData in Table: ", chartData);
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
  //       formatter: (params: any) => labelFormatter(params), // params.value[2].toFixed(3), //labelFormatter(params),
  //     },
  //   };
  // });

  const labelFormatter = (params: any) => {
    const { value } = params;
    if (value[2] === Infinity) {
      return "";
    }
    if (value[2] === -Infinity) {
      return "\u26A0";
    }
    const originalValue = getOriginalValueFromNormalizedValueAndDataSeriesName(
      sortedMatrixDataSeries,
      value[2],
      value[1],
    );
    const valueIsScore = isScoreSeries(scores, value[1]);
    const originalValueString =
      originalValue !== null ? originalValue.toString() : "";

    if (originalValueString.length > 0) {
      return valueIsScore
        ? `{score|${originalValueString}}`
        : `{item|${originalValueString}}`;
    }
    return "";
  };

  const tooltipFormatter = (params: any) => {
    const { value, name } = params;
    if (value[2] === -Infinity) {
      const linkId = matrixDataSeries.find(
        (series) => series.shortName === value[1],
      )?.id;
      const errorMessages = errors?.filter((error) => error.linkId === linkId);
      if (errorMessages !== undefined) {
        return `
            <div class="tooltip-content">
              ${errorMessages.map((errorMsg) => {
                return `${echarts.format.encodeHTML(errorMsg.message)} <br/>`;
              })}
              </div>
            `;
      }
    }
    return "";
    // return echarts.format.encodeHTML(value[2]);
    // return `<div class="tooltip-content">
    //   ${echarts.format.encodeHTML(value[2])}
    // </div>`;
  };

  const yAxisFormatter = (value: string) => {
    const isScore = isScoreSeries(scores, value);
    return isScore ? `{score|${value}}` : `{item|${value}}`;
  };

  const yAxisTooltipFormatter = (params: any) => {
    const { value } = params;
    // console.log("yAxisTooltipFormatter params: ", params);
    const longName = getNameForDataSeriesFromShortName(matrixDataSeries, value);
    return `
        <div class="tooltip-content">
          ${echarts.format.encodeHTML(longName ? longName : value)}
        </div>
      `;
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
    tooltip: {
      show: true,
      renderMode: "html",
      className: "echarts-tooltip",
      confine: true,
      formatter: (params: any) => tooltipFormatter(params),
      displayTransition: false,
      transitionDuration: 0,
    },
    xAxis: [
      {
        type: "category",
        data: xAxisData,
        splitLine: {
          show: false,
        },
        // position: "top",
      },
      {
        type: "category",
        data: xAxisData,
        splitLine: {
          show: false,
        },
      },
    ],
    yAxis: {
      type: "category",
      data: yAxisData,
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
      tooltip: {
        show: true,
        // @ts-ignore
        formatter: (params: any) => yAxisTooltipFormatter(params),
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
        formatter: (params: any) => labelFormatter(params), // params.value[2].toFixed(3), //labelFormatter(params),
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
  if (matrixDataSeries.length === 0) {
    chartHeight = 0;
  } else if (matrixDataSeries.length === 1) {
    chartHeight = (matrixDataSeries.length + 3) * 36;
  } else if (matrixDataSeries.length === 2) {
    chartHeight = (matrixDataSeries.length + 3) * 32;
  } else {
    chartHeight =
      (matrixDataSeries.length + 3) *
      (32 - 2 * Math.ceil(Math.log2(matrixDataSeries.length)));
  }

  return (
    <>
      <ReactEChartsWrapper option={options} chartHeight={chartHeight} />
    </>
  );
};

export default Table;
