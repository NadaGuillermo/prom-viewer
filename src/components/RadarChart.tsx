import { lazy, memo, Suspense } from "react";
import * as echarts from "echarts/core";
import type {
  TitleComponentOption,
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
  RadarSeriesOption,
  RadarComponentOption,
  DefaultLabelFormatterCallbackParams as CallbackDataParams,
} from "echarts";
import * as _ from "lodash-es";

import type * as Visualization from "@utils/visualization/types";
import type * as Charts from "@utils/charts";
import { tolColorPalette } from "@utils/charts";
import type * as GlobalTypes from "@customTypes/globalTypes";

const ReactEChartsWrapper = lazy(() =>
  import("@components/ReactEChartsWrapper").then((module) => ({
    default: module.ReactEChartsWrapper,
  })),
);

interface Props {
  id: string;
  data: Record<string, Visualization.DataSeries[]>;
  dates: string[];
  date: string;
  title?: string;
  subtitle?: string;
  height?: number;
  colors?: string[];
  titleOptions?: TitleComponentOption;
  legendOptions?: LegendComponentOption;
  gridOptions?: GridComponentOption;
  tooltipOptions?: TooltipComponentOption;
  radarOptions?: RadarComponentOption;
  seriesOptions?: RadarSeriesOption;
  showLegendTooltip?: boolean;
  enableExport?: boolean;
  exportFileName?: string;
}

/**
 * RadarChart component renders a radar chart using ECharts library.
 */
const RadarChart = ({
  id,
  data,
  dates,
  date,
  title,
  subtitle,
  height = 400,
  colors = tolColorPalette,
  titleOptions,
  legendOptions,
  gridOptions,
  tooltipOptions,
  radarOptions,
  seriesOptions,
  showLegendTooltip = true,
  enableExport = false,
  exportFileName,
}: Props) => {
  // Extract unique questionnaire names from the data
  const questionnaireNames = _.uniq(
    Object.values(data).flatMap((series) =>
      series.map((item) => item.questionnaireName),
    ),
  );

  // Create radar indicators based on the unique domains in the data
  const radarIndicators = Object.entries(data)
    .filter(([, series]) => series.length > 0)
    .map(([domain]) => ({
      name: domain,
      max: 1,
    }));

  const chartData: Record<
    string,
    Record<string, [GlobalTypes.NumberOrNull, GlobalTypes.NumberOrNull]>
  > = {};

  questionnaireNames.forEach((questionnaireName) => {
    const questionnaireDomains = Object.entries(data)
      .filter(([, series]) =>
        series.some((item) => item.questionnaireName === questionnaireName),
      )
      .map(([domain]) => domain);
    const indexOfDate = dates.indexOf(date);

    chartData[questionnaireName] = {};
    if (indexOfDate > -1) {
      Object.entries(data)
        .filter(([, series]) => series.length > 0)
        .forEach(([domain, series]) => {
          let maxValue: GlobalTypes.NumberOrNull = null;
          let minValue: GlobalTypes.NumberOrNull = null;
          chartData[questionnaireName][domain] = [minValue, maxValue];
          if (questionnaireDomains.includes(domain)) {
            const domainSeries = series.filter(
              (item) => item.questionnaireName === questionnaireName,
            );
            const domainSeriesWithMaxValue = domainSeries.reduce(
              (maxItem, item) => {
                const itemValue = item.data[indexOfDate];
                const maxItemValue = maxItem.data[indexOfDate];
                if (
                  itemValue !== null &&
                  (maxItemValue === null || itemValue > maxItemValue)
                ) {
                  return item;
                } else {
                  return maxItem;
                }
              },
            );
            maxValue = domainSeriesWithMaxValue.data[indexOfDate];
            const domainSeriesWithMinValue = domainSeries.reduce(
              (minItem, item) => {
                const itemValue = item.data[indexOfDate];
                const minItemValue = minItem.data[indexOfDate];
                if (
                  itemValue !== null &&
                  (minItemValue === null || itemValue < minItemValue)
                ) {
                  return item;
                } else {
                  return minItem;
                }
              },
            );
            minValue = domainSeriesWithMinValue.data[indexOfDate];
            chartData[questionnaireName][domain] = [minValue, maxValue];
          }
        });
    }
  });

  const filteredChartData: Record<
    string,
    Record<string, [GlobalTypes.NumberOrNull, GlobalTypes.NumberOrNull]>
  > = {};
  Object.entries(chartData).forEach(([name, domainData]) => {
    if (
      Object.values(domainData).some((valueTuple) => {
        return valueTuple[0] !== null && valueTuple[1] !== null;
      })
    ) {
      filteredChartData[name] = domainData;
    }
  });

  const transformedData: Record<
    string,
    [[string, GlobalTypes.NumberOrNull][], [string, GlobalTypes.NumberOrNull][]]
  > = {};

  Object.entries(filteredChartData).forEach(
    ([questionnaireName, domainData]) => {
      const minValues: [string, GlobalTypes.NumberOrNull][] = [];
      const maxValues: [string, GlobalTypes.NumberOrNull][] = [];
      Object.entries(domainData).forEach(([domain, values]) => {
        minValues.push([domain, values[0]]);
        maxValues.push([domain, values[1]]);
      });
      transformedData[questionnaireName] = [minValues, maxValues];
    },
  );

  const tooltipFormatter = (params: CallbackDataParams) => {
    const { seriesName } = params;
    return `
          <div class="tooltip-content">
            ${echarts.format.encodeHTML(seriesName ?? "")}<br/>
            <b>${echarts.format.encodeHTML(date)}</b>
          </div>
          `;
  };

  const generateSeriesList = () => {
    const seriesList: RadarSeriesOption[] = [];
    Object.entries(transformedData).forEach(([questionnaireName, data], i) => {
      const series = [
        // inner values
        {
          ...seriesOptions,
          name: questionnaireName,
          type: "radar" as const,
          z: 2,
          silent: true,
          symbol: "none",
          lineStyle: {
            width: 0,
            opacity: 0,
          },
          areaStyle: {
            color: colors[i % colors.length],
            opacity: 0.25,
          },
          itemStyle: {
            color: colors[i % colors.length],
          },
          data: [data[0].map((item) => item[1])],
        },
        // outer values
        {
          ...seriesOptions,
          name: questionnaireName,
          type: "radar" as const,
          z: 1,
          symbol: "none",
          lineStyle: {
            width: 2,
            opacity: 1,
          },
          areaStyle: {
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
      formatter: (params) =>
        tooltipFormatter(Array.isArray(params) ? params[0] : params),
    },
    legend: {
      ...legendOptions,
      data: questionnaireNames.map((name) => {
        return {
          name: name,
          textStyle: {
            width: 230,
            overflow: "truncate",
          },
        };
      }),
      // @ts-expect-error: Seems to be a bug in ECharts types
      tooltip: {
        ...tooltipOptions,
        show: showLegendTooltip,
        position: "top",
      },
      selectedMode: "multiple",
    },
    radar: {
      ...radarOptions,
      indicator: radarIndicators.map((indicator) => {
        const words = indicator.name.split(" ");
        let indicatorName = "";
        for (const word of words) {
          indicatorName += word;
          if (indicatorName.length > 3 && word.length > 3) {
            indicatorName += "\n";
          } else {
            indicatorName += " ";
          }
        }
        return {
          name: indicatorName,
          max: indicator.max,
        };
      }),
      splitNumber: 3,
      radius: "50%",
    },
    grid: {
      ...gridOptions,
    },
    series: generateSeriesList(),
  };

  if (
    Object.values(transformedData).every(
      (value) => value[0].length === 0 && value[1].length === 0,
    )
  ) {
    return;
  }

  return (
    <Suspense
      fallback={
        <div
          className="tw:flex tw:h-full tw:w-full tw:items-center tw:justify-center"
          style={{ height }}
        >
          <span className="tw:loading tw:loading-spinner tw:loading-md" />
        </div>
      }
    >
      <ReactEChartsWrapper
        chartId={id}
        option={options}
        chartHeight={height}
        enableExport={enableExport}
        exportFileName={exportFileName ?? title}
      />
    </Suspense>
  );
};

export default memo(RadarChart);
