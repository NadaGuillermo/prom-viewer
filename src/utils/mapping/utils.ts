import type { Mapping } from "@utils/mapping";
import { formatDate, getDateFormatPattern } from "@utils/dateFormat";

// Formats using the runtime-configured date pattern (see
// /public/config/dateFormat.json), falling back to ISO if it's missing or
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
    return (item as Mapping.QuestionnaireScoreItem).range !== undefined;
  };