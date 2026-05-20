import { type Mapping, SCORE_HEALTH_CORRELATIONS } from "@utils/mapping";
import type { GlobalTypes } from "@customTypes/globalTypes";

export const addDomainToQuestionnaireItems = (
  questionnaire: Mapping.Questionnaire,
  config: any,
): Record<string, Mapping.Item> => {
  const items: Record<string, Mapping.Item> = {};
  const questionnaireDomainItemMapping = config.questionnaires.find(
    (q: any) => q.questionnaire === questionnaire.url,
  )?.domainItemMapping;
  Object.entries(questionnaire.items).forEach(([linkId, item]) => {
    const domain = questionnaireDomainItemMapping.find((dim: any) =>
      dim.questions.map((question: any) => question.itemId).includes(linkId),
    )?.domain;
    items[linkId] = item;
    if (domain !== undefined) {
      items[linkId].domain = domain;
    }
  });
  return items;
};

export const getEmptyAnswerOptions = (
  questionnaire: Mapping.Questionnaire,
): string[] => {
  const questionnaireItems = questionnaire.items;
  const answerOptionsNotDefined: string[] = [];

  const isScoreItem = (
    item: Mapping.Item,
  ): item is Mapping.QuestionnaireScoreItem => {
    return (item as Mapping.QuestionnaireScoreItem).range !== undefined;
  };

  Object.entries(questionnaireItems).forEach(([linkId, item]) => {
    if (!isScoreItem(item)) {
      const answerOptions = item.answerOptions;
      if (answerOptions.length === 0) {
        answerOptionsNotDefined.push(linkId);
      }
    }
  });
  return answerOptionsNotDefined;
};

export const addRangeAndScoreHealthCorrelationToQuestionnaireScoreItems = (
  questionnaire: Mapping.Questionnaire,
  observationDefinitions: Mapping.ObservationDefinition[],
  config: any,
): GlobalTypes.Result<Record<string, Mapping.Item>> => {
  const issues: GlobalTypes.DataIssue[] = [];
  const items: Record<string, Mapping.Item> = {};
  const questionnaireDomainItemMapping = config.questionnaires.find(
    (q: any) => q.questionnaire === questionnaire.url,
  )?.domainItemMapping;
  const observationDefinitionUrlsInConfig =
    questionnaireDomainItemMapping.flatMap((dim: any) =>
      dim.questions.map((question: any) => question.observationDefinition),
    );
  const correspondingObservationDefinitions = observationDefinitions.filter(
    (observationDefinition) =>
      observationDefinitionUrlsInConfig.includes(observationDefinition.url),
  );

  Object.entries(questionnaire.items).forEach(([linkId, item]) => {
    let range: [number, number] | undefined = undefined;
    let scoreHealthCorrelation: string | undefined = undefined;

    // check if ObservationDefinition exists for this item
    const domainItemMapping = questionnaireDomainItemMapping?.find(
      (dim: any) =>
        dim.questions.map((question: any) => question.itemId).includes(linkId),
    );
    const observationDefinitionUrl = domainItemMapping?.questions.find(
      (question: any) => question.itemId === linkId,
    )?.observationDefinition;
    if (observationDefinitionUrl !== undefined) {
      const correspondingObservationDefinition =
        correspondingObservationDefinitions?.find(
          (observationDefinition) =>
            observationDefinition.url === observationDefinitionUrl,
        );
      if (correspondingObservationDefinition !== undefined) {
        range = correspondingObservationDefinition.range ?? undefined;
        scoreHealthCorrelation =
          correspondingObservationDefinition.scoreHealthCorrelation ??
          undefined;
      }

      // config
      const scoreDefinitionId = domainItemMapping?.questions.find(
        (question: any) => question.itemId === linkId,
      )?.scoreDefinitionId;
      const scoreDefinition = config.scoreDefinitions.find(
        (scoreDefinition: any) => scoreDefinition.id === scoreDefinitionId,
      );

      // config overwrited ObservationDefinition
      if (scoreDefinition !== undefined) {
        const configRange: [number, number] = [
          Number(scoreDefinition.range[0]),
          Number(scoreDefinition.range[1]),
        ];
        const configScoreHealthCorrelation =
          scoreDefinition.scoreHealthCorrelation;
        if (
          range !== undefined &&
          (range[0] !== configRange[0] || range[1] !== configRange[1])
        ) {
          issues.push({
            id: `issue-observationDefinition-${Math.random().toString(36).substring(2, 9)}`,
            level: "warning",
            message: `Range definition for score with linkId ${linkId} in ObservationDefinition with url ${observationDefinitionUrl} and range 
              definition in configuration file for score with id ${scoreDefinitionId} contradict each other: 
              range in ObservationDefinition is ${range[0]} ${range[1]} and 
              range in configuration file is ${configRange}.
              The latter will be used.`,
            resourceId: correspondingObservationDefinition
              ? correspondingObservationDefinition.id
              : undefined,
            resourceType: "ObservationDefinition",
            linkId: linkId,
          });
        }
        if (
          scoreHealthCorrelation !== undefined &&
          scoreHealthCorrelation !== configScoreHealthCorrelation
        ) {
          issues.push({
            id: `issue-observationDefinition-${Math.random().toString(36).substring(2, 9)}`,
            level: "warning",
            message: `ScoreHealthCorrelation definition for score with linkId ${linkId} in ObservationDefinition with url ${observationDefinitionUrl} and scoreHealthCorrelation 
              definition in configuration file for score with id ${scoreDefinitionId} contradict each other: 
              scoreHealthCorrelation in ObservationDefinition is ${scoreHealthCorrelation} and 
              scoreHealthCorrelation in configuration file is ${configScoreHealthCorrelation}.
              The latter will be used.`,
            resourceId: correspondingObservationDefinition
              ? correspondingObservationDefinition.id
              : undefined,
            resourceType: "ObservationDefinition",
            linkId: linkId,
          });
        }
        // overwrite values
        range = configRange;
        scoreHealthCorrelation = configScoreHealthCorrelation;

        items[linkId] = item as Mapping.QuestionnaireScoreItem;
        // add range
        if (
          range !== undefined &&
          !isNaN(range[0]) &&
          !isNaN(range[1]) &&
          range[0] <= range[1]
        ) {
          items[linkId].range = [range[0], range[1]];
        } else {
          issues.push({
            id: `issue-observationDefinition-${Math.random().toString(36).substring(2, 9)}`,
            level: "error",
            message: `No range could be found for score with linkId ${linkId} in ObservationDefinition with url ${observationDefinitionUrl} or it is invalid.
              Range was: ${isNaN(range[0]) || isNaN(range[1]) || range === undefined ? "undefined" : range}. The score will be omitted.`,
            resourceId: correspondingObservationDefinition
              ? correspondingObservationDefinition.id
              : undefined,
            resourceType: "ObservationDefinition",
            linkId: linkId,
          });
        }
        // add scoreHealthCorrelation
        if (
          scoreHealthCorrelation !== undefined &&
          scoreHealthCorrelation in SCORE_HEALTH_CORRELATIONS
        ) {
          items[linkId].scoreHealthCorrelation = scoreHealthCorrelation;
        } else {
          issues.push({
            id: `issue-observationDefinition-${Math.random().toString(36).substring(2, 9)}`,
            level: "error",
            message: `No scoreHealthCorrelation could be found for score with linkId ${linkId} in ObservationDefinition with url ${observationDefinitionUrl} or is invalid.
              ScoreHealthCorrelation was: ${scoreHealthCorrelation}. The score will be omitted.`,
            resourceId: correspondingObservationDefinition
              ? correspondingObservationDefinition.id
              : undefined,
            resourceType: "ObservationDefinition",
            linkId: linkId,
          });
        }
      }
    } else {
      items[linkId] = item;
    }
  });
  return {
    data: items,
    issues: issues,
  };
};

export const addShortNamesToQuestionnaireItems = (
  questionnaire: Mapping.Questionnaire,
  config: any,
): GlobalTypes.Result<Record<string, Mapping.Item>> => {
  const items: Record<string, Mapping.Item> = {};
  const issues: GlobalTypes.DataIssue[] = [];
  const questionnaireDomainItemMapping = config.questionnaires.find(
    (q: any) => q.questionnaire === questionnaire.url,
  )?.domainItemMapping;
  Object.entries(questionnaire.items).forEach(([linkId, item]) => {
    const domainItemMapping = questionnaireDomainItemMapping?.find(
      (dim: any) =>
        dim.questions.map((question: any) => question.itemId).includes(linkId),
    );
    const shortName = domainItemMapping?.questions.find(
      (question: any) => question.itemId === linkId,
    )?.shortName;
    items[linkId] = item;
    if (shortName !== undefined) {
      items[linkId].shortText = shortName;
    } else {
      // shortText is linkId
      // cut length of linkId (should not be necessary in practice)
      const itemShortText = item.shortText;
      const shortenedItemText = item.shortText.slice(0, 25);
      items[linkId].shortText = shortenedItemText;
      if (shortenedItemText !== itemShortText) {
        // warning
        issues.push({
          id: `issue-questionnaire-${Math.random().toString(36).substring(2, 9)}`,
          level: "warning",
          message: `The name for item with linkId ${linkId} in Questionnaire with 
            url ${questionnaire.url} had to be shortened 
            to ${shortenedItemText} since it exceeds the maximum of 25 characters.`,
          resourceId: questionnaire.id,
          resourceType: "Questionnaire",
          linkId: linkId,
        });
      }
    }
  });
  return {
    data: items,
    issues: issues,
  };
};

export const addObservationItemsToQuestionnaireResponse = (
  questionnaireResponse: Mapping.QuestionnaireResponse,
  observations: Mapping.Observation[],
  config: any,
): Mapping.QuestionnaireResponse => {
  const response = questionnaireResponse;
  // find observations for response
  const observationsForResponse = observations.filter(
    (observation) =>
      observation.questionnaireResponse === questionnaireResponse.id,
  );
  // observations as items
  const items: Record<string, Mapping.ResponseItem> = {};
  observationsForResponse.forEach((observation) => {
    const observationDefinition = observation.observationDefinition;
    const questionnaireUrl = questionnaireResponse.questionnaire.url;
    const questionnaireDomainItemMapping = config.questionnaires.find(
      (q: any) => q.questionnaire === questionnaireUrl,
    )?.domainItemMapping;

    const domainItemMapping = questionnaireDomainItemMapping?.find(
      (dim: any) =>
        dim.questions
          .map((question: any) => question.observationDefinition)
          .includes(observationDefinition),
    );
    const linkId = domainItemMapping?.questions.find(
      (question: any) =>
        question.observationDefinition === observationDefinition,
    )?.itemId;
    // only if observationDefinition given, otherwise don't do anything since no mapping possible
    if (linkId !== undefined) {
      items[linkId] = {
        linkId: linkId,
        answer: observation.value,
      };
    }
  });
  response.items = { ...response.items, ...items };
  return response;
};
