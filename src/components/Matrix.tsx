import { ReactEChartsWrapper } from "@components/ReactEChartsWrapper";
// import type { Visualization } from "@utils/visualization";
import * as echarts from "echarts/core";
import {
  getOriginalValueFromNormalizedValueAndDataSeriesName,
  isScoreSeries,
  getLabelFromOriginalValueAndDataSeriesName,
  getDataSeriesNameFromShortName, type Visualization,
} from "@utils/visualization";
import * as _ from "lodash-es";


import "@styles/echartStyles.css";

const Matrix = ({
  title,
  subtitle,
  data,
  dimensions,
}: Visualization.MatrixProps) => {

  const chartRecord: Record<string, number[]> = {};

  Object.entries(data.data).forEach(([questionnaire, questionnaireDimensions]) => {
    const dimensionIndicators = dimensions.map((dimension) => {
      if(questionnaireDimensions.includes(dimension)) {
        return 1;
      }
      return 0;
    });
    chartRecord[questionnaire] = dimensionIndicators;
  });

  const xAxisData = dimensions;
  const yAxisData = Object.keys(chartRecord);

  const chartData: [string, string, number][] = []; // [x,y,value]
  
  xAxisData.forEach((dim, index) => {
  Object.entries(chartRecord).forEach(([questionnaire, dimensions]) => {
    
      chartData.push([dim, questionnaire, dimensions[index]]);
    })
  });


  // const labelFormatter = (params: any) => {
  //   const { value } = params;

  //   if (value[2] > 0) {
  //     return `{item|${value[1]}}`;
  //   }
  //   return "";
  // };

  // const yAxisFormatter = (value: string) => {
  //   const isScore = isScoreSeries(scores, value);
  //   return isScore ? `{score|${value}}` : `{item|${value}}`;
  // };

  // const tooltipFormatter = (params: any) => {
  //   const { value, name } = params;
  //   const originalValue = getOriginalValueFromNormalizedValueAndDataSeriesName(
  //     heatmapDataSeries,
  //     value[2],
  //     value[1],
  //   );
  //   const questionnaireName = heatmapDataSeries.find(
  //     (series) => series.shortName === value[1],
  //   )?.questionnaireName;
  //   const questionnaireLabel = questionnaireName ? `${questionnaireName}` : "";

  //   if (originalValue !== null) {
  //     const label = getLabelFromOriginalValueAndDataSeriesName(
  //       heatmapDataSeries,
  //       originalValue,
  //       value[1],
  //     );
  //     // console.log("Heatmap Label: ", label);
  //     const labelString = label ? ` (${label})` : "";
  //     return `
  //     <div class="tooltip-content">

  //     ${echarts.format.encodeHTML(value[1])}
  //       <br/>
  //       ${echarts.format.encodeHTML(name)}:
  //       &nbsp;<b>${echarts.format.encodeHTML(originalValue.toString())}</b>
  //       ${echarts.format.encodeHTML(labelString)}
  //       </div>
  //       `;
  //   }
  //   return "";
  //   // return echarts.format.encodeHTML(value[2]);
  //   // return `<div class="tooltip-content">
  //   //   ${echarts.format.encodeHTML(value[2])}
  //   // </div>`;
  // };

  // const yAxisTooltipFormatter = (params: any) => {
  //   const { value } = params;
  //   //console.log("yAxisTooltipFormatter params: ", params);
  //   const longName = getNameForDataSeriesFromShortName(heatmapDataSeries, value);
  //   const questionnaireName = heatmapDataSeries.find(
  //     (series) => series.shortName === value,
  //   )?.questionnaireName;
  //   const questionnaireLabel = questionnaireName ? `${questionnaireName}` : "";
  //   return `
  //     <div class="tooltip-content">
  //       ${echarts.format.encodeHTML(longName ? longName : value)} (${echarts.format.encodeHTML(questionnaireLabel)})
  //     </div>
  //   `;
  // };

  const options: Visualization.EChartsOption = {
    animation: false,
    title: {
      text: title,
      subtext: subtitle,
    },
  tooltip: {
    position: 'top',
    // formatter: (value: any) => {
    //   const [x, y, v] = value;
    //   return `${xAxisData[x]}<br/>${yAxisData[y]}: ${v ? 'Yes' : 'No'}`;
    // }
  },

  // grid: {
  //   left: 120,   // space for questionnaire names
  //   right: 20,
  //   top: 60,
  //   bottom: 60
  // },

  xAxis: {
    type: 'category',
    data: xAxisData,
    axisLabel: {
      // show: false,
      //rotate: 45,   // helps with long labels
      interval: 0,
      // overflow: "breakAll",
      // width: 60,
     
    },
    axisTick: { show: false },
    axisLine: { show: false }
  },

  yAxis: {
    type: 'category',
    data: yAxisData,
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: {
       //overflow: "break",
      // width: 100,
    }
  },

  visualMap: {
    show: false,   // hide legend scale
    min: 0,
    max: 1,
    inRange: {
      color: ['#f0f0f0', '#2c7be5'] // 0 = light, 1 = strong
    }
  },

  series: [
    {
      type: 'heatmap',
      data: chartData, // format: [[xIndex, yIndex, value], ...]
      itemStyle: {
        borderRadius: 4
      },
      emphasis: {
        itemStyle: {
          borderColor: '#333',
          borderWidth: 1
        }
      }
    }
  ]
};
  // const options: Visualization.EChartsOption = {
  //   animation: false,
  //   title: {
  //     text: title,
  //     subtext: subtitle,
  //   },
  //   matrix: {
  //     x: {
  //       data: xAxisData,
  //     },
  //     y: {
  //      data: yAxisData,
  //     },
  //   },

   
   
   
    
  //   visualMap: {
  //     type: "piecewise",
  //     pieces: [
  //       {
  //         min: 0.5,
  //         max: 1,
  //         // color: "red",
  //         symbol: "circle",
  //         symbolSize: 10,
  //       }
  //     ],    
  //     hoverLink: false,
  //     show: false,
  //   },
  // //   visualMap: {
  // //   type: 'continuous',
  // //   min: 1,
  // //   max: 1,
  // //   //dimension: 2,
  // //   calculable: false,
  // //   orient: 'horizontal',
  // //   top: 5,
  // //   left: 'center'
  // // },
  //   series: {
  //     type: "scatter",
  //     cursor: "default",
  //     emphasis: {
  //       disabled: true,
  //     },
  //     // type: "heatmap",
  //     // coordinateSystem: "heatmap",
  //     coordinateSystem: 'matrix',
  //     data: chartData,
  //     label: {
  //       show: false,
  //       // formatter: (params: any) => params.value[2].toFixed(2)
  //     //   formatter: (params: any) => labelFormatter(params), // params.value[2].toFixed(3), //labelFormatter(params),
  //     //   rich: {
  //     //     score: { fontSize: 12, color: "#333" },
  //     //     item: { fontSize: 12, color: "#333" },
  //     //   },
  //     },
  //   },
  // };
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

 

  return (
    <>
      <ReactEChartsWrapper option={options} chartHeight={200}/>
    </>
  );
};

export default Matrix;
