import type { ComposeOption, SetOptionOpts } from "echarts/core";
import type {
  BarSeriesOption,
  LineSeriesOption,
  ScatterSeriesOption,
  CustomSeriesOption,
  HeatmapSeriesOption,
  RadarSeriesOption,
  SankeySeriesOption,
  TitleComponentOption,
  GridComponentOption,
  LegendComponentOption,
  XAXisComponentOption, 
  YAXisComponentOption,
  TooltipComponentOption,
} from "echarts"; // echarts/charts

export namespace Charts {

    type EChartsOption = ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | ScatterSeriesOption
    | CustomSeriesOption
    | HeatmapSeriesOption
    | RadarSeriesOption
    | SankeySeriesOption
    | TitleComponentOption
    | GridComponentOption
    | LegendComponentOption
    | XAXisComponentOption
    | YAXisComponentOption
    | TooltipComponentOption
  >;
}

