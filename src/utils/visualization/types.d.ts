import type { GlobalTypes } from "@customTypes/globalTypes"
import { ITEM_TYPES } from "@utils/mapping";
export namespace Visualization {

  type ItemType = ITEM_TYPES.item | ITEM_TYPES.score;
  type NumberOrTuple = number | [number, number];

  /** Charts generell */
  type ReferenceRange = {
    value: NumberOrTuple;
    normalizedValue: NumberOrTuple;
    name: string;
    description?: string;
  }

  interface DataSeries {
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

  interface ChartData {
    xData: string[];
    yData: DataSeries[];
  }

  interface RangeState {
  start: string;
  end: string;
}

}
