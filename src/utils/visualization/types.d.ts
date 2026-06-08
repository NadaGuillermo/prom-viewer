// import type { CSSProperties } from "react";
import type { Mapping } from "@utils/mapping";
import React from "react";
import type { Errors } from "@utils/errors";
import { ITEM_TYPES } from "@utils/mapping";


// import type { ComposeOption, SetOptionOpts } from "echarts/core";
// import type {
//   BarSeriesOption,
//   LineSeriesOption,
//   ScatterSeriesOption,
//   CustomSeriesOption,
//   HeatmapSeriesOption,
//   RadarSeriesOption,
//   SankeySeriesOption,
// } from "echarts/charts";
// import type {
//   TitleComponentOption,
//   GridComponentOption,
// } from "echarts/components";

export namespace Visualization {


   // type NumberOrNull = number | null;

    // type ScoreHealthCorrelation = SCORE_HEALTH_CORRELATIONS.increase | SCORE_HEALTH_CORRELATIONS.decrease;

    type ItemType = ITEM_TYPES.item | ITEM_TYPES.score;

  // Combine an Option type with only required components and charts via ComposeOption
  // type EChartsOption = ComposeOption<
  //   | BarSeriesOption
  //   | LineSeriesOption
  //   // | TitleComponentOption
  //   // | GridComponentOption
  //   | ScatterSeriesOption
  //   | CustomSeriesOption
  //   | HeatmapSeriesOption
  //   | RadarSeriesOption
  //   | SankeySeriesOption
  // >;

  // interface ReactEChartsWrapperProps {
  //   option: EChartsOption;
  //   style?: CSSProperties;
  //   settings?: SetOptionOpts;
  //   loading?: boolean;
  //   theme?: "light" | "dark";
  //   chartHeight?: number;
  //   useMinHeight?: boolean;
  // }

  /** Charts generell */

  interface DataSeries {
    id: string; // linkId
    name: string;
    shortName: string;
    data: NumberOrNull[];
    originalData: NumberOrNull[];
    dataLabels: string[];
    seriesType: ItemType;
    // domain: string;
    questionnaireId: string; // questionnaireId
    questionnaireName: string;
    // isDomainScore: boolean;
    // isDimensionScore: boolean;
    // isGlobalScore: boolean;
    // referencedItems?: string[]; // linkIds of items used for score calculation
    // dimension?: string;
  }

  interface ChartData {
    xData: string[];
    yData: DataSeries[];
  }

  // interface RadarData {
  //   data: Record<string, string[]>;
  // }

  interface ChartProps {
    title?: string;
    subtitle?: string;
    height?: number;
    data: ChartData;
  }

  /** Line Chart */

  interface HeatmapProps extends ChartProps {
    // yScoreData?: DataSeries[];
    // questionnaires: Mapping.Questionnaire[];
  }

  interface TableProps extends ChartProps {
    dimensions: string[];
    errors?: Errors.DataIssue[];
  }

  interface RadarProps {
    title?: string;
    subtitle?: string;
    data: Record<string, string[]>;
    dimensions: string[];
  }

  interface MatrixProps {
    title?: string;
    subtitle?: string;
    data: RadarData;
    dimensions: string[];
  }

  interface CollapseProps {
    title: string;
    children: React.ReactNode;
  }

  interface ErrorModalProps {
    data: Errors.DataIssue[];
    open: boolean;
    onClose: () => void;
  }

  interface QuestionnaireCardProps {
    questionnaire: {
      name: string;
      dimensions: string [];
    }
    dimensions: string [];
    lengthOfLongestQuestionnaireName: number;
  }

  interface DatePickerProps {
    isStart: boolean;
  }

  interface DomainCardProps {
    domain: string;
    dimensionsByQuestionnaireName: Record<string, string[]>;
    colors?: string[];
  }

  interface SankeyProps {
    data: Record<string, Record<string, string[]>>;
  }

  interface RangeState {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  rangeHandler: (event: Event) => void;
  dateValue: string;
  range: RangeState;
}

  /* interface MatrixItem {
    id: string;
    label: string;
    values: number[];
  } */

  // interface MatrixDimension {
  //   id: string;
  //   name: string;
  //   questionnaire: Mapping.Questionnaire;
  //   dimensionValues: Domains.NumberOrNull[];
  //   items: Record<string, Domains.NumberOrNull[]>;
  // }

  // interface CollapsibleMatrixProps {
  //   dimensions: MatrixDimension[];
  //   columns: string[];
  //   allRowsExpanded: boolean;
  // }

  // interface RowMeta {
  //   rowIndex: number;
  //   dimensionId: string;
  //   isDimension: boolean;
  //   itemId?: string;
  //   label: string;
  // }
}
