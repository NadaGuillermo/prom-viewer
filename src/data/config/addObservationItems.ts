import type { PromData } from "@data/mapping/types";

export const addObservationItemsToQuestionnaireResponse = (
  questionnaireResponse: PromData.QuestionnaireResponse,
  observations: PromData.Observation[],
  config: any,
) => {
  const response = questionnaireResponse;
  // find observations for response
  const observationsForResponse = observations.filter(
    (observation) =>
      observation.questionnaireResponse === questionnaireResponse.id,
  );
  // observations as items
  const items: Record<string, PromData.ResponseItem> = {};
  observationsForResponse.forEach((observation) => {
    const observationDefinition = observation.observationDefinition;
    const questionnaireUrl = questionnaireResponse.questionnaire;
    const questionnaireInConfig =
      config.promConfiguration.questionnaireConfigurations.find(
        (elem: any) => elem.questionnaire === questionnaireUrl,
      );
    const linkIdInConfig = questionnaireInConfig.scoreDefinitions
      .find((scoreDef: any) => {
        const observationDefinitions = scoreDef.items.map(
          (item: any) => item.observationDefinition,
        );
        return observationDefinitions.includes(observationDefinition);
      })
      .items.find(
        (item: any) => item.observationDefinition === observationDefinition,
      ).item;

    if (linkIdInConfig !== undefined) {
      items[linkIdInConfig] = {
        linkId: linkIdInConfig,
        answer: observation.value,
      };
    }
  });
  response.items = { ...response.items, ...items };
  return response;
};
