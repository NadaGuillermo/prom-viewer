import type { Mapping } from "@utils/mapping";
import React from "react";
import type { Errors } from "@utils/errors";
import { ITEM_TYPES } from "@utils/mapping";
export namespace Visualization {

  type ItemType = ITEM_TYPES.item | ITEM_TYPES.score;

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

  interface ChartProps {
    title?: string;
    subtitle?: string;
    height?: number;
    data: ChartData;
  }

  interface RangeState {
  start: string;
  end: string;
}

}
