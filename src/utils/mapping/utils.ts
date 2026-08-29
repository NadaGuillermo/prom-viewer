import type * as Mapping from "@utils/mapping";
import { formatDate, getDateFormatPattern } from "@utils/dateFormat";
// Formats using the runtime-configured date pattern (see
// src/mocks/config/data/dateFormat.json), falling back to ISO if it's missing or
// invalid.
export const convertFhirDateTimeToDateFormat = (isoDate: string): string => {
  return formatDate(isoDate, getDateFormatPattern());
};

export const isQuestionnaireItem = (
    item: Mapping.Item,
  ): item is Mapping.QuestionnaireItem => {
    return (item as Mapping.QuestionnaireItem).answerOptions !== undefined &&
      (item as Mapping.QuestionnaireItem).answerOptions.length > 0;
  };

export const isScoreItem = (
    item: Mapping.Item,
  ): item is Mapping.QuestionnaireScoreItem => {
    return (item as Mapping.QuestionnaireScoreItem).range !== undefined && (item as Mapping.QuestionnaireScoreItem).scoreHealthCorrelation !== undefined;
  };

export const isDimensionScore = (
  item: Mapping.Item
) => {
  return item.isDimensionScore !== undefined && item.isDimensionScore === true;
}

export const isScoreHealthCorrelation = (value: string): value is Mapping.ScoreHealthCorrelation => {
  return value === "increase" || value === "decrease";
}

export const isItemType = (value: string): value is Mapping.ItemType => {
  return value === "score" || value === "item" || value === "dimensionScore";
}