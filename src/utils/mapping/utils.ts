import type { Mapping } from "@utils/mapping";

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