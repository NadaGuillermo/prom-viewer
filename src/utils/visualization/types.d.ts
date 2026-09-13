import type * as GlobalTypes from "@customTypes/globalTypes"
import type { ItemType } from "@utils/mapping";

export type NumberOrTuple = number | [number, number];

export interface ReferenceRange {
  value: NumberOrTuple;
  normalizedValue: NumberOrTuple;
  name: string;
  description?: string;
}

export interface DataSeries {
  id: string;
  name: string;
  shortName: string;
  data: GlobalTypes.NumberOrNull[];
  originalData: GlobalTypes.NumberOrNull[];
  dataLabels: string[];
  seriesType: ItemType;
  questionnaireId: string;
  questionnaireName: string;
  referenceValues?: ReferenceRange[];
}

export interface ChartData {
  xData: string[];
  yData: DataSeries[];
}

export interface RangeState {
  start: string;
  end: string;
}
