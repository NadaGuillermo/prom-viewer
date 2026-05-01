import { ReactEChartsWrapper } from "@components/ReactEChartsWrapper";
import type { Visualization } from "@customTypes/visualization";
import type { VariableDomains as Domains } from "@customTypes/variableDomains";
import * as echarts from "echarts/core";
import {
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  isScoreSeries,
  getLabelFromOriginalValueAndDataSeriesName,
} from "@utils/helpers";

const Matrix = ({
  title,
  subtitle,
  data,
  //questionnaires,
}: Visualization.MatrixProps) => {
  // data already one dimension !!!

  const matrixYData = data.yData;
  // console.log("Matrix Y Data: ", matrixYData);

  const scores = matrixYData.filter(
    (dataseries) => dataseries.seriesType === "score",
  );
  // const items = data.yData.filter(dataseries =>
  //   dataseries.seriesType === "item"
  // );
  const xData = data.xData;

  // const itemsGroupedByDimension = groupItemsByDimension(items);
  // const dimensionScoresGroupedByDimension = groupItemsByDimension(dimensionScores);

  // add additional row to xData
  // xData.unshift("");

  const chartData: [string, string, Domains.NumberOrNull][] = [];
  matrixYData.forEach((series) => {
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

  // console.log("chartData: ", chartData);
  // console.log("matrixYData: ", matrixYData.length);
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
      matrixYData,
      value[2],
      value[1],
    );
    const valueIsScore = isScoreSeries(scores, value[1]);
    const originalValueString =
      originalValue !== null ? originalValue.toString() : "";

    return valueIsScore
      ? `{score|${originalValueString}}`
      : `{item|${originalValueString}}`;
  };

  const yAxisFormatter = (value: string) => {
    const isScore = isScoreSeries(scores, value);
    return isScore ? `{score|${value}}` : `{item|${value}}`;
  };

  const tooltipFormatter = (params: any) => {
    const { value, name } = params;
    const originalValue = getOriginalValueFromNormalizedValueAndDataSeriesName(
      matrixYData,
      value[2],
      value[1],
    );
    const questionnaireName = matrixYData.find(
      (series) => series.name === value[1],
    )?.questionnaireName;
    const questionnaireLabel = questionnaireName ? ` ${questionnaireName}` : "";

    if (originalValue !== null) {
      const label = getLabelFromOriginalValueAndDataSeriesName(
        matrixYData,
        originalValue,
        value[1],
      );
      // console.log("Matrix Label: ", label);
      const labelString = label ? ` (${label})` : "";
      return (
        echarts.format.encodeHTML(questionnaireLabel) +
        ": " +
        echarts.format.encodeHTML(value[1]) +
        "<br/>" +
        echarts.format.encodeHTML(name) +
        ":" +
        "&nbsp;" +
        "<b>" +
        echarts.format.encodeHTML(originalValue.toString()) +
        "</b>" +
        labelString
      );
    }
    return echarts.format.encodeHTML(value[2]);
  };

  const options: Visualization.EChartsOption = {
    animation: false,
    title: {
      text: title,
      subtext: subtitle,
    },
    tooltip: {
      formatter: (params: any) => tooltipFormatter(params),
    },
    xAxis: [
      {
        type: "category",
        data: xData,
        splitLine: {
          show: false,
        },
        // axisLabel: {
        //   fontSize: 12,
        // }
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
      data: matrixYData.map((d) => d.name),
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
          score: { fontWeight: "bold", fontSize: 12 },
          item: { fontSize: 12 },
        },
      },
    },
    visualMap: {
      type: "piecewise",
      pieces: [
        {
          min: 0.65,
          max: 1,
          label: "Good",
          color: "#80F1BE",
          symbol: "circle",
          symbolSize: 25,
        },
        {
          min: 0.3,
          max: 0.65,
          label: "Moderate",
          color: "#fec42c",
          symbol: "rect",
          symbolSize: 25,
        },
        {
          max: 0.3,
          label: "Severe",
          color: "#FF684A",
          symbol: "diamond",
          symbolSize: 25,
        },
      ],
      showLabel: true,
      show: false,
      // orient: "horizontal",
      // left: "center",
      // bottom: "10%",
    },
    // seriesData,
    series: {
      type: "scatter",
      // coordinateSystem: "matrix",
      data: chartData,
      itemStyle: {
        opacity: 1,
      },
      label: {
        show: true,
        formatter: (params: any) => labelWithOriginalScores(params), // params.value[2].toFixed(3), //labelWithOriginalScores(params),
        rich: {
          score: { fontWeight: "bold", fontSize: 10 },
          item: { fontSize: 10 },
        },
      },
    },
  };
  // style={{ width: "100%", height: `${data.length * 25}px` }}

  let chartHeight = 0;
  if (matrixYData.length === 0) {
    chartHeight = 0;
  } else if (matrixYData.length === 1) {
    chartHeight = (matrixYData.length + 3) * 44;
  } else if (matrixYData.length === 2) {
    chartHeight = (matrixYData.length + 3) * 40;
  } else {
    chartHeight =
      (matrixYData.length + 3) *
      (40 - 2 * Math.ceil(Math.log2(matrixYData.length)));
  }

  //chartHeight = 45 * matrixYData.length + 135 - matrixYData.length; // adjust the multiplier based on the number of series to optimize spacing

  return (
    <>
      <ReactEChartsWrapper option={options} chartHeight={chartHeight} />
    </>
  );
};

export default Matrix;
