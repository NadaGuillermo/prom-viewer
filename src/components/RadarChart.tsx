import { ReactEChartsWrapper } from "@components/ReactEChartsWrapper";
import type { Visualization } from "@utils/visualization/types";
import { type Charts,  mutedColorPalette, } from "@utils/charts";
import * as _ from "lodash-es";
import type { GlobalTypes } from "@customTypes/globalTypes";
import * as echarts from "echarts/core";

import type {
  TitleComponentOption,
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
  RadarSeriesOption,
  RadarComponentOption,
} from "echarts";

interface Props {
  title?: string;
  subtitle?: string;
  data: Record<string, Visualization.DataSeries[]>;
  mostRecentResponses: Record<string, string>;
  height?: number;
  colors?: string[];
  titleOptions?: TitleComponentOption;
  legendOptions?: LegendComponentOption;
  gridOptions?: GridComponentOption;
  tooltipOptions?: TooltipComponentOption;
  radarOptions?: RadarComponentOption;
  seriesOptions?: RadarSeriesOption;
  showLegendTooltip?: boolean;
}

const RadarChart = ({
  title,
  subtitle,
  data,
  mostRecentResponses,
  height = 400,
  colors = mutedColorPalette,
  titleOptions,
  legendOptions,
  gridOptions,
  tooltipOptions,
  radarOptions,
  seriesOptions,
  showLegendTooltip = true,
}: Props) => {
  
  const questionnaireNames = _.uniq(Object.values(data).flatMap((series) => series.map((item) => item.questionnaireName)))
    
  const radarIndicators = Object.entries(data).filter(([_, series]) => series.length > 0).map(([domain, _]) => ({
    name: domain,
    max: 1,
  }));

  const chartData: Record<string, Record<string, [GlobalTypes.NumberOrNull, GlobalTypes.NumberOrNull]>> = {};

  questionnaireNames.forEach((questionnaireName) => {
    const questionnaireSeries = Object.values(data).flatMap((series) => series.filter((item) => item.questionnaireName === questionnaireName));
    const questionnaireDomains = Object.entries(data).filter(([_, series]) => series.some((item) => item.questionnaireName === questionnaireName)).map(([domain, _]) => domain);
    let indexOfMostRecentResponse = 0;
    const numberOfDates = questionnaireSeries[0].data.length;
    for (let i = numberOfDates - 1; i >= 0; i--) {
      if (questionnaireSeries.some((series) => series.data[i] !== null)) {
        indexOfMostRecentResponse = i;
        break;
      }
    }
    chartData[questionnaireName] = {};
 
    Object.entries(data).filter(([_, series]) => series.length > 0).forEach(([domain, series]) => {
      let maxValue: GlobalTypes.NumberOrNull = null;
      let minValue: GlobalTypes.NumberOrNull = null;
      chartData[questionnaireName][domain] = [minValue, maxValue];
      if (questionnaireDomains.includes(domain)) {
        const domainSeries = series.filter((item) => item.questionnaireName === questionnaireName);
        const domainSeriesWithMaxValue = domainSeries.reduce((maxItem, item) => {
          if (item.data[indexOfMostRecentResponse] !== null) {
            return item.data[indexOfMostRecentResponse] > maxItem.data[indexOfMostRecentResponse] ? item : maxItem;
          } else {
            return maxItem;
          }
        });
        maxValue = domainSeriesWithMaxValue.data[indexOfMostRecentResponse];
        const domainSeriesWithMinValue = domainSeries.reduce((minItem, item) => {
          if (item.data[indexOfMostRecentResponse] !== null) {
            return item.data[indexOfMostRecentResponse] < minItem.data[indexOfMostRecentResponse] ? item : minItem;
            } else {
            return minItem;
          }
        });
        minValue = domainSeriesWithMinValue.data[indexOfMostRecentResponse];
        chartData[questionnaireName][domain] = [minValue, maxValue];
      }
    })
  });

  const transformedData: Record<string, [[string, GlobalTypes.NumberOrNull][], [string, GlobalTypes.NumberOrNull][]]> = {};

  Object.entries(chartData).forEach(([questionnaireName, domainData]) => {
    const minValues: [string, GlobalTypes.NumberOrNull][] = [];
    const maxValues: [string, GlobalTypes.NumberOrNull][] = [];
    Object.entries(domainData).forEach(([domain, values]) => {
      minValues.push([domain, values[0]]);
      maxValues.push([domain, values[1]]);
    });
    transformedData[questionnaireName] = [minValues, maxValues];
  });

  console.log("transformedData", transformedData);

  const tooltipFormatter = (params: any) => {
    console.log("params: ", params)
    const { seriesName } = params;
    console.log("seriesName: ", seriesName)
   
    const mostRecentDate = mostRecentResponses[seriesName];
    console.log("mostRecentDate: ", mostRecentDate)
    if (mostRecentDate !== undefined) {
       return `
          <div class="tooltip-content">
            ${echarts.format.encodeHTML(seriesName)}<br/>
            <b>${echarts.format.encodeHTML(mostRecentDate)}</b>
          </div>
          `;
    }
     return `
          <div class="tooltip-content">
            ${echarts.format.encodeHTML(seriesName)}
          </div>
          `;
    
  }


  const generateSeriesList = () => {
    const seriesList: any[] = [];
    Object.entries(transformedData).forEach(([questionnaireName, data], i) => {
      const series = [
        // inner values
        {
        ...seriesOptions,
        name: questionnaireName,
        type: "radar",
        z: 2,
        silent: true,
        // symbol: "circle",
        // symbolSize: 8,
        symbol: 'none',
        lineStyle: {
          width: 0,
          opacity: 0,
        },
        areaStyle: {
          // color: 'rgba(0,0,0,1)',
          // shadowColor: 'rgba(0, 0, 0, 0.1)',
          // shadowBlur: 5,
          color: colors[i % colors.length],
          opacity: 0.25,
        },
        itemStyle: {
          color: colors[i % colors.length],
        },
        emphasis: {
        //   lineStyle: {
        //     opacity: 0.4,
        //   },
          // areaStyle: {
          //   opacity: 0.3,
          // },
        },
        data: [data[0].map((item) => item[1])],
      },
      // outer values
        {
        ...seriesOptions,
        name: questionnaireName,
        type: "radar",
        z: 1,
        // symbol: "circle",
        // symbolSize: 8,
        symbol: 'none',
        lineStyle: {
          width: 2,
          opacity: 1
        },
        areaStyle: {
          //shadowColor: 'rgba(0, 0, 0, 0.5)',
          //shadowBlur: 10,
          color: colors[i % colors.length],
          opacity: 0.15,
        },
        itemStyle: {
          color: colors[i % colors.length],
        },
        emphasis: {
          lineStyle: {
            width: 3,
          },
          // areaStyle: {
          //   opacity: 0.2,
          // },
        },
        data: [data[1].map((item) => item[1])],
      },       
    ];
      seriesList.push(...series);
    });
    return seriesList;
  };

  const options: Charts.EChartsOption = {
    title: {
      ...titleOptions,
      ...(title && { text: title }),
      ...(subtitle && { subtext: subtitle }),
    },
    tooltip: {
      ...tooltipOptions,
      show: true,
      confine: true,
      formatter: (params) => tooltipFormatter(params)
    },
    legend: {
      ...legendOptions,
      data: questionnaireNames.map((name) => {
        return {
          name: name,
          textStyle: {
            width: 230,
            overflow: "truncate",
          }
        }
      }),
      // @ts-ignore
      tooltip: {
        ...tooltipOptions,
        show: showLegendTooltip,
        confine: true,
        position: "top",
      },
      type: "scroll",
      orient: 'vertical',
      bottom: 4,
      selectedMode: 'single',
    },
    radar: {
      ...radarOptions,
      indicator: radarIndicators.map((indicator) => {
        const words = indicator.name.split(' ');
        let indicatorName = "";
        for(let word of words) {
          indicatorName += word + "\n";
        }
        return {
          name: indicatorName,
          max: indicator.max,
        }
      }),
      splitNumber: 3,
      radius: "50%",
    },
    grid: {
      ...gridOptions,
    },
    series: generateSeriesList(),
  };

  return (
    <>
      <ReactEChartsWrapper option={options} chartHeight={height} />
    </>
  );
};

export default RadarChart;
