import { ReactEChartsWrapper } from "@components/ReactEChartsWrapper";
// import type { Visualization } from "@utils/visualization";
import * as echarts from "echarts/core";
import {
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  isScoreSeries,
  getLabelFromOriginalValueAndDataSeriesName,
  getDataSeriesNameFromShortName, type Visualization,
} from "@utils/visualization";

import "@styles/echartStyles.css";

const Heatmap = ({
  title,
  subtitle,
  data,
  //questionnaires,
}: Visualization.HeatmapProps) => {
  // data already one dimension !!!

  const heatmapDataSeries = data.yData;
  console.log("Heatmap Data Series: ", heatmapDataSeries);

  const scores = heatmapDataSeries.filter(
    (dataseries) => dataseries.seriesType === "score",
  );
  // const items = data.yData.filter(dataseries =>
  //   dataseries.seriesType === "item"
  // );
  const xAxisData = data.xData; //.concat("Health Trend");
  console.log("Heatmap X Data: ", xAxisData);

  // const itemsGroupedByDimension = groupItemsByDimension(items);
  // const dimensionScoresGroupedByDimension = groupItemsByDimension(dimensionScores);

  // add additional row to xAxisData
  // xAxisData.unshift("");

  const chartData: [string, string, number][] = []; // [x,y,value]
  const yAxisData: string[] = [];
  heatmapDataSeries.forEach((series) => {
    yAxisData.push(series.shortName);
    const row: [string, string, number][] = xAxisData.map((x, index) => {
      // if (index < xAxisData.length - 1) {
      return [
        x,
        series.shortName,
        series.data[index] === null ? Infinity : series.data[index],
      ];
      // } else {
      //   return [
      //     x,
      //     series.shortName,
      //     Infinity,
      //   ]
      // }
    });
    chartData.push(...row);
  });

  // const itemDimensions = Object.keys(itemsGroupedByDimension);
  // const scoreDimensions = Object.keys(dimensionScoresGroupedByDimension);

  // const dimensions = new Set([...itemDimensions, ...scoreDimensions]);

  // globalScores.forEach((score) => {
  //   const rows: [string, string, Domains.NumberOrNull][] = xAxisData.map((x, i) => {
  //     return [x, score.name, score.data[i] === null ? Infinity : score.data[i]];
  //   })
  //   chartData.push(...rows);
  // });

  // dimensions.forEach((dimension) => {
  //   dimensionScoresGroupedByDimension[dimension]?.forEach((score) => {
  //     const rows: [string, string, Domains.NumberOrNull][] = xAxisData.map((x, i) => {
  //     return [x, score.name, score.data[i] === null ? Infinity : score.data[i]];
  //   })
  //   chartData.push(...rows);
  //   });
  //   itemsGroupedByDimension[dimension]?.forEach((item) => {
  //     const rows: [string, string, Domains.NumberOrNull][] = xAxisData.map((x, i) => {
  //     return [x, item.name, item.data[i] === null ? Infinity : item.data[i]];
  //   })
  //   chartData.push(...rows);
  //   });
  // });

  // console.log("chartData: ", chartData);
  // console.log("heatmapDataSeries: ", heatmapDataSeries.length);
  // const getRowData = (series: Visualization.DataSeries, xAxisData: string[]) => {
  //   const seriesRows: [string, string, Domains.NumberOrNull][] = xAxisData.map((x, index) => {
  //     return [x, series.name, series.data[index] === null ? Infinity : series.data[index]];
  //   });
  //   return seriesRows;
  // }

  // const seriesData: any[] = yData.map((series) => {
  //   return {
  //     name: series.name,
  //     type: "scatter",
  //     coordinateSystem: "heatmap",
  //     data: getRowData(series, xAxisData),
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
    const originalValue = getOriginalValueFromNormalizedValueAndDataSeriesName(
      heatmapDataSeries,
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

  const yAxisFormatter = (value: string) => {
    const isScore = isScoreSeries(scores, value);
    return isScore ? `{score|${value}}` : `{item|${value}}`;
  };

  const tooltipFormatter = (params: any) => {
    const { value, name } = params;
    const originalValue = getOriginalValueFromNormalizedValueAndDataSeriesName(
      heatmapDataSeries,
      value[2],
      value[1],
    );
    const questionnaireName = heatmapDataSeries.find(
      (series) => series.shortName === value[1]
    )?.questionnaireName;
    const questionnaireLabel = questionnaireName ? `${questionnaireName}` : "";

    if (originalValue !== null) {
      const label = getLabelFromOriginalValueAndDataSeriesName(
        heatmapDataSeries,
        originalValue,
        value[1],
      );
      // console.log("Heatmap Label: ", label);
      const labelString = label ? ` (${label})` : "";
      return `
      <div class="tooltip-content">

      ${echarts.format.encodeHTML(value[1])}
        <br/>
        ${echarts.format.encodeHTML(name)}:
        &nbsp;<b>${echarts.format.encodeHTML(originalValue.toString())}</b>
        ${echarts.format.encodeHTML(labelString)}
        </div>
        `;
    }
    return "";
    // return echarts.format.encodeHTML(value[2]);
    // return `<div class="tooltip-content">
    //   ${echarts.format.encodeHTML(value[2])}
    // </div>`;
  };

  const yAxisTooltipFormatter = (params: any) => {
    const { value } = params;
    //console.log("yAxisTooltipFormatter params: ", params);
    const longName = getDataSeriesNameFromShortName(heatmapDataSeries, value);
    const questionnaireName = heatmapDataSeries.find(
      (series) => series.shortName === value
    )?.questionnaireName;
    const questionnaireLabel = questionnaireName ? `${questionnaireName}` : "";
    return `
      <div class="tooltip-content">
        ${echarts.format.encodeHTML(longName ? longName : value)} (${echarts.format.encodeHTML(questionnaireLabel)})
      </div>
    `;
  };

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
      // position: "top",
    },
    xAxis: [
      {
        type: "category",
        data: xAxisData,
        splitLine: {
          show: false,
        },
        // axisLabel: {
        //   fontSize: 12,
        // }
        position: "top",
      },
      // {
      //   type: "category",
      //   data: xAxisData,
      //   splitLine: {
      //     show: false,
      //   },
      // },
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
          score: { fontSize: 12 },
          item: { fontSize: 12 },
        },
      },
      tooltip: {
        show: true,
        // @ts-ignore
        formatter: (params: any) => yAxisTooltipFormatter(params),
      },
    },
    visualMap: {
      type: "continuous",
      min: 0,
      max: 1,
      unboundedRange: false,
      calculable: true,
      formatter: function (value: any) {
        return ""; // Math.round(value * 100) + '%';
      },
      orient: "horizontal",
      left: "center",
      bottom: 10,
      inverse: false,
      text: ["Best", "Worst"],
      // dimension: 2,
      inRange: {
        color: ["#F6F9FF", "#DCEEFF", "#CDE7E1", "#E8F3D6", "#FFF4D6"],
        // color: ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"],
        // color: ['#2c7bb6', '#abd9e9', '#fdae61', '#d7191c'],
        opacity: 0.8,
      },
      precision: 1,
      hoverLink: false,
      show: true,
    },
    // visualMap: {
    //   show: false,
    //   min: 0,
    //   max: 0,
    //   inRange: {
    //     color: ["transparent"],
    //   },
    // },
    // visualMap: {
    //   type: "piecewise",
    //   pieces: [
    //     {
    //       min: 0.65,
    //       //max: 1,
    //       label: "Good",
    //       color: "#80F1BE",
    //       symbol: "circle",
    //       symbolSize: 25,
    //     },
    //     {
    //       min: 0.3,
    //       max: 0.65,
    //       label: "Moderate",
    //       color: "#fec42c",
    //       symbol: "rect",
    //       symbolSize: 25,
    //     },
    //     {
    //       max: 0.3,
    //       label: "Severe",
    //       color: "#FF684A",
    //       symbol: "diamond",
    //       symbolSize: 25,
    //     },
    //   ],
    //   showLabel: true,
    //   show: false,
    //   // orient: "horizontal",
    //   // left: "center",
    //   // bottom: "10%",
    // },
    // seriesData,
    series: {
      type: "scatter",
      // coordinateSystem: "heatmap",
      symbol: "circle",
      symbolSize: 35,
      data: chartData,
      label: {
        show: true,
        formatter: (params: any) => labelFormatter(params), // params.value[2].toFixed(3), //labelFormatter(params),
        rich: {
          score: { fontSize: 12, color: "#333" },
          item: { fontSize: 12, color: "#333" },
        },
      },
    },
  };
  // style={{ width: "100%", height: `${data.length * 25}px` }}

  // let chartHeight = 0;
  // if (heatmapDataSeries.length === 0) {
  //   chartHeight = 0;
  // } else if (heatmapDataSeries.length === 1) {
  //   chartHeight = (heatmapDataSeries.length + 0) * 40 + 150;
  // } else if (heatmapDataSeries.length === 2) {
  //   chartHeight = (heatmapDataSeries.length + 2) * 40;
  // } else {
  //   chartHeight =
  //     (heatmapDataSeries.length + 3) *
  //     (40 - 2 * Math.ceil(Math.log2(heatmapDataSeries.length)));
  // }

  const chartHeight =
    heatmapDataSeries.length === 0 ? 0 : heatmapDataSeries.length * 50 + 142;

  //chartHeight = 45 * heatmapDataSeries.length + 135 - heatmapDataSeries.length; // adjust the multiplier based on the number of series to optimize spacing

  return (
    <>
      <ReactEChartsWrapper option={options} chartHeight={chartHeight} />
    </>
  );
};

export default Heatmap;
