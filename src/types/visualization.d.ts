import type { CSSProperties } from "react";
import { VariableDomains as Domains } from "@customTypes/variableDomains";
import { PromData } from "@data/mapping";
import React from "react";
import type { Mapping } from "@data/globalTypes";

import type { ComposeOption, SetOptionOpts } from "echarts/core";
import type {
  BarSeriesOption,
  LineSeriesOption,
  ScatterSeriesOption,
  CustomSeriesOption,
  HeatmapSeriesOption,
  RadarSeriesOption,
} from "echarts/charts";
import type {
  TitleComponentOption,
  GridComponentOption,
} from "echarts/components";
import type Radar from "echarts/types/src/coord/radar/Radar.js";

export namespace Visualization {
  // Combine an Option type with only required components and charts via ComposeOption
  type EChartsOption = ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | TitleComponentOption
    | GridComponentOption
    | ScatterSeriesOption
    | CustomSeriesOption
    | HeatmapSeriesOption
    | RadarSeriesOption
  >;

  interface ReactEChartsWrapperProps {
    option: EChartsOption;
    style?: CSSProperties;
    settings?: SetOptionOpts;
    loading?: boolean;
    theme?: "light" | "dark";
    chartHeight?: number;
    useMinHeight?: boolean;
  }

  /** Charts generell */

  interface DataSeries {
    id: string; // linkId
    name: string;
    data: Domains.NumberOrNull[];
    originalData: Domains.NumberOrNull[];
    dataLabels: string[];
    seriesType: Domains.ItemType;
    dimension: string; // vordefinierte Dimensionen in variableDomains definieren -> für Gesamtübersicht
    questionnaire: string; // questionnaireId
    questionnaireName: string;
    referencedItems?: string[]; // linkIds of items used for score calculation
  }

  interface ChartData {
    xData: string[];
    yData: DataSeries[];
  }

  interface ChartProps {
    title?: string;
    subtitle?: string;
    data: ChartData;
  }

  /** Line Chart */

  interface LineChartProps extends ChartProps {
    // scoreRecord?: Record<string, OriginalAndNormalizedScore>;
  }

  /** Matrix */

  interface MatrixProps extends ChartProps {
    // yScoreData?: DataSeries[];
    // questionnaires: PromData.Questionnaire[];
  }

  interface TableProps extends ChartProps {
    dimensions: string[];
  }

  interface RadarProps extends ChartProps {
    dimensions: string[];
  }

  interface CollapseProps {
    title: string;
    children: React.ReactNode;
  }

  interface ErrorModalProps {
    data: Mapping.DataIssue[];
    open: boolean;
    onClose: () => void;
  }

  /* interface MatrixItem {
    id: string;
    label: string;
    values: number[];
  } */

  // interface MatrixDimension {
  //   id: string;
  //   name: string;
  //   questionnaire: PromData.Questionnaire;
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
