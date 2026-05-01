import type { PromData } from "@data/mapping/types";

export const addDimensionToQuestionnaireItems = (
  questionnaire: PromData.Questionnaire,
  config: any,
): Record<string, PromData.Item> => {
  const items: Record<string, PromData.Item> = {};
  const questionnaireItemDimensionMapping =
    config.promConfiguration.questionnaireConfigurations.find(
      (elem: any) => elem.questionnaire === questionnaire.url,
    )?.dimensionMapping;
  Object.entries(questionnaire.items).forEach(([linkId, item]) => {
    const dimension = questionnaireItemDimensionMapping.find((elem: any) =>
      elem.items.includes(linkId),
    )?.dimension;
    items[linkId] = item;
    if (dimension !== undefined) {
      items[linkId].dimension = dimension;
    }
  });
  return items;
};
