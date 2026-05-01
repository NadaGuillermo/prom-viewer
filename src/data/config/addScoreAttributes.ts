import type { PromData } from "@data/mapping/types";

export const addRangeAndScoreHealthCorrelationToQuestionnaireScoreItems = (
  questionnaire: PromData.Questionnaire,
  config: any,
): Record<string, PromData.Item> => {
  const items: Record<string, PromData.Item> = {};
  const questionnaireScoreDefinitions =
    config.promConfiguration.questionnaireConfigurations.find(
      (elem: any) => elem.questionnaire === questionnaire.url,
    )?.scoreDefinitions;
  Object.entries(questionnaire.items).forEach(([linkId, item]) => {
    // check if items is array of objects or array of strings
    const scoreDefinition = questionnaireScoreDefinitions.find(
      (elem: any) =>
        elem.items.includes(linkId) ||
        elem.items.map((item: any) => item.item).includes(linkId),
    );
    const range = scoreDefinition?.range;
    const lower = range?.lower;
    const upper = range?.upper;
    const scoreHealthCorrelation = scoreDefinition?.scoreHealthCorrelation;

    items[linkId] = item as PromData.QuestionnaireScoreItem;
    // add range
    if (
      lower !== undefined &&
      upper !== undefined &&
      !isNaN(lower) &&
      !isNaN(upper)
    ) {
      items[linkId].range = [Number(lower), Number(upper)];
    }
    // add scoreHealthCorrelation
    if (scoreHealthCorrelation !== undefined) {
      items[linkId].scoreHealthCorrelation = scoreHealthCorrelation;
    }
  });
  return items;
};
