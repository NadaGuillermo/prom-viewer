import type * as GlobalTypes from "@customTypes/globalTypes"
import type { ItemType } from "@utils/mapping";

export type NumberOrTuple = number | [number, number];

/** Charts generell */
export interface ReferenceRange {
  value: NumberOrTuple;
  normalizedValue: NumberOrTuple;
  name: string;
  description?: string;
}

export interface DataSeries {
  id: string; // linkId
  name: string;
  shortName: string;
  data: GlobalTypes.NumberOrNull[];
  originalData: GlobalTypes.NumberOrNull[];
  dataLabels: string[];
  seriesType: ItemType;
  // originalReferenceValues?: ReferenceRange[];
  // domain: string;
  questionnaireId: string; // questionnaireId
  questionnaireName: string;
  referenceValues?: ReferenceRange[];
  // isDomainScore: boolean;
  // isDimensionScore: boolean;
  // isGlobalScore: boolean;
  // referencedItems?: string[]; // linkIds of items used for score calculation
  // dimension?: string;
}

export interface ChartData {
  xData: string[];
  yData: DataSeries[];
}

export interface RangeState {
  start: string;
  end: string;
}
