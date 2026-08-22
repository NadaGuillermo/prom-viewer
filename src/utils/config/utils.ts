// import * as _ from "lodash-es";
import {
  type Mapping,
  SCORE_HEALTH_CORRELATIONS,
  isScoreItem,
} from "@utils/mapping";
// import type { NormalizedFHIR } from "@utils/fhir";
import { issueFactories, type Errors } from "@utils/errors";
import type { Config } from "./types";

export const addDomainToQuestionnaireItems = (
  questionnaire: Mapping.Questionnaire,
  config: Config.PromConfig,
): Record<string, Mapping.Item> => {
  const items: Record<string, Mapping.Item> = {};
  const questionnaireDomainItemMapping = config.questionnaires.find(
    (q) => q.questionnaire === questionnaire.url,
  )?.domainItemMapping;
  Object.entries(questionnaire.items).forEach(([linkId, item]) => {
    const domain = questionnaireDomainItemMapping?.find((dim) =>
      dim.questions?.map((question) => question.itemId).includes(linkId),
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

export const addReferenceRangesAndValuesToQuestionnaireScoreItems = (
  questionnaire: Mapping.Questionnaire,
  observationDefinitions: Mapping.ObservationDefinition[],
  config: Config.PromConfig,
): Errors.Result<Record<string, Mapping.Item>> => {
  const issues: Errors.DataIssue[] = [];
  const items: Record<string, Mapping.Item> = {};

  const linkIds = Object.keys(questionnaire.items);
  const scoreIds = Object.values(questionnaire.items)
    .filter((item) => isScoreItem(item))
    .map((item) => item.linkId);

  linkIds.forEach((linkId) => {
    const item = questionnaire.items[linkId];
    if (scoreIds.includes(linkId)) {
      const scoreItem = item as Mapping.QuestionnaireScoreItem;
      const questionnaireDomainItemMapping = config.questionnaires.find(
        (q) => q.questionnaire === questionnaire.url,
      )?.domainItemMapping;
      const questionnaireDomainItemMappingQuestionsInConfig =
        questionnaireDomainItemMapping?.find((mapping) =>
          mapping.questions?.find((q) => q.itemId === linkId),
        )?.questions;
      const questionnaireScoreItemInConfig =
        questionnaireDomainItemMappingQuestionsInConfig?.find(
          (q) => q.itemId === linkId,
        );
      const scoreDefinitionInConfig = questionnaireScoreItemInConfig
        ? config.scoreDefinitions.find(
            (scoreDef) =>
              scoreDef.id === questionnaireScoreItemInConfig.scoreDefinitionId,
          )
        : undefined;
      const observationDefinitionURLInConfig =
        questionnaireScoreItemInConfig?.observationDefinition;
      const correspondingObservationDefinition = observationDefinitions.find(
        (obsdef) =>
          observationDefinitionURLInConfig !== undefined &&
          obsdef.url === observationDefinitionURLInConfig,
      );
      if (
        (scoreDefinitionInConfig !== undefined &&
          scoreDefinitionInConfig.referenceRange !== undefined) ||
        (correspondingObservationDefinition !== undefined &&
          correspondingObservationDefinition.referenceRange !== undefined)
      ) {
        const referenceRange: Mapping.ReferenceRange[] = [];
        // reference range from config
        if (
          scoreDefinitionInConfig !== undefined &&
          scoreDefinitionInConfig.referenceRange !== undefined
        ) {
          const referenceRangeInConfig: Config.ReferenceRange[] =
            scoreDefinitionInConfig.referenceRange;
          const scoreItemReferenceRange: Mapping.ReferenceRange[] = [];
          referenceRangeInConfig.forEach((refRange) => {
            if (refRange.range.length === 1) {
              scoreItemReferenceRange.push({
                range: refRange.range[0],
                name: refRange.name,
                ...(refRange.description && {
                  description: refRange.description,
                }),
              });
            }
            if (refRange.range.length === 2) {
              scoreItemReferenceRange.push({
                range: [refRange.range[0], refRange.range[1]],
                name: refRange.name,
                ...(refRange.description && {
                  description: refRange.description,
                }),
              });
            }
          });
          if (scoreItemReferenceRange.length > 0) {
            for (const range of scoreItemReferenceRange) {
              referenceRange.push(range);
            }
            // scoreItem.referenceRange = scoreItemReferenceRange;
          }
        }

        // reference range from observation definition
        if (
          correspondingObservationDefinition !== undefined &&
          correspondingObservationDefinition.referenceRange !== undefined
        ) {
          const referenceRangeInObservationDefinition: Mapping.ReferenceRange[] =
            correspondingObservationDefinition.referenceRange;

          if (referenceRangeInObservationDefinition.length > 0) {
            const scoreItemReferenceRange: Mapping.ReferenceRange[] = [];
            referenceRangeInObservationDefinition.forEach((refRange) => {
              if (typeof refRange.range === "number") {
                scoreItemReferenceRange.push({
                  range: refRange.range,
                  name: refRange.name,
                  ...(refRange.description && {
                    description: refRange.description,
                  }),
                });
              }
              if (Array.isArray(refRange.range)) {
                scoreItemReferenceRange.push({
                  range: [refRange.range[0], refRange.range[1]],
                  name: refRange.name,
                  ...(refRange.description && {
                    description: refRange.description,
                  }),
                });
              }
            });
            if (scoreItemReferenceRange.length > 0) {
              for (const range of scoreItemReferenceRange) {
                referenceRange.push(range);
              }
              // scoreItem.referenceRange = scoreItemReferenceRange;
            }
          }
        }

        if (referenceRange.length > 0) {
          scoreItem.referenceRange = referenceRange;
        }

        // reference ranges defined in config and observation definition
        if (
          scoreDefinitionInConfig !== undefined &&
          scoreDefinitionInConfig.referenceRange !== undefined &&
          correspondingObservationDefinition !== undefined &&
          correspondingObservationDefinition.referenceRange !== undefined
        ) {
          issues.push(
            issueFactories.observationDefinition.additionalReferenceValuesInConfig(
              correspondingObservationDefinition,
            ),
          );
        }
        // Update item with reference range
        items[linkId] = scoreItem;
      } else {
        items[linkId] = item;
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

export const addRangeAndScoreHealthCorrelationToQuestionnaireScoreItems = (
  questionnaire: Mapping.Questionnaire,
  observationDefinitions: Mapping.ObservationDefinition[],
  config: Config.PromConfig,
): Errors.Result<Record<string, Mapping.Item>> => {
  const issues: Errors.DataIssue[] = [];
  const items: Record<string, Mapping.Item> = {};
  const questionnaireDomainItemMapping = config.questionnaires.find(
    (q) => q.questionnaire === questionnaire.url,
  )?.domainItemMapping;
  const observationDefinitionUrlsInConfig =
    questionnaireDomainItemMapping?.flatMap((dim) =>
      dim.questions?.map((question) => question.observationDefinition),
    );
  const correspondingObservationDefinitions = observationDefinitions.filter(
    (observationDefinition) =>
      observationDefinitionUrlsInConfig?.includes(observationDefinition.url),
  );

  Object.entries(questionnaire.items).forEach(([linkId, item]) => {
    // let rangeRaw: [number, number] | undefined;
    // let scoreHealthCorrelationRaw: string | undefined;

    let observationDefinitionRange: [number, number] | undefined = undefined;
    let observationDefinitionScoreHealthCorrelation: string | undefined = undefined;

    let configRange: [number, number] | undefined = undefined;
    let configScoreHealthCorrelation: string | undefined = undefined;

    let correspondingObservationDefinition: Mapping.ObservationDefinition | undefined = undefined;

    const domainItemMapping = questionnaireDomainItemMapping?.find((dim) =>
      dim.questions?.map((question) => question.itemId).includes(linkId),
    );

    // ObservationDefinition
    const observationDefinitionUrl = domainItemMapping?.questions?.find(
      (question) => question.itemId === linkId,
    )?.observationDefinition;
    if (observationDefinitionUrl !== undefined) {
      correspondingObservationDefinition = 
        correspondingObservationDefinitions?.find(
          (observationDefinition) =>
            observationDefinition.url === observationDefinitionUrl,
        );
        // Extract values from ObservationDefinition
      if (correspondingObservationDefinition !== undefined) {
        observationDefinitionRange = correspondingObservationDefinition.range;
        observationDefinitionScoreHealthCorrelation =
          correspondingObservationDefinition.scoreHealthCorrelation;
      }
    }

    // config
    const scoreDefinitionId = domainItemMapping?.questions?.find(
      (question) => question.itemId === linkId,
    )?.scoreDefinitionId;
    const scoreDefinition = config.scoreDefinitions.find(
      (scoreDefinition) => scoreDefinition.id === scoreDefinitionId,
    );

    // Extract values from Config file
      if (scoreDefinition !== undefined) {
        if (scoreDefinition.range !== undefined) {
          configRange = [
          Number(scoreDefinition.range[0]),
          Number(scoreDefinition.range[1]),
        ];
        }
        configScoreHealthCorrelation =
          scoreDefinition.scoreHealthCorrelation;
      }

      // Range
      const rangeRaw = configRange ?? observationDefinitionRange;

      if (observationDefinitionRange !== undefined && configRange !== undefined && 
        (observationDefinitionRange[0] !== configRange[0] || observationDefinitionRange[1] !== configRange[1]) &&
        correspondingObservationDefinition !== undefined) {
        // warning          
        issues.push(
            issueFactories.observationDefinition.contradictingRangeInConfig(
              correspondingObservationDefinition,
            ),
          );
      }

      // ScoreHealthCorrelation
      const scoreHealthCorrelationRaw = configScoreHealthCorrelation ?? observationDefinitionScoreHealthCorrelation;

      if (observationDefinitionScoreHealthCorrelation !== undefined && configScoreHealthCorrelation !== undefined &&
        observationDefinitionScoreHealthCorrelation !== configScoreHealthCorrelation &&
        correspondingObservationDefinition !== undefined
      ) {        
        // warning      
        issues.push(
          issueFactories.observationDefinition.contradictingScoreHealthCorrelationInConfig(
            correspondingObservationDefinition,
          ),
        );        
      }

      const isRangeValid = rangeRaw !== undefined  && !isNaN(rangeRaw[0]) && !isNaN(rangeRaw[1]);
      const isScoreHealthCorrelationValid = scoreHealthCorrelationRaw !== undefined && scoreHealthCorrelationRaw in SCORE_HEALTH_CORRELATIONS;

      if (!isRangeValid && correspondingObservationDefinition) {
        if (rangeRaw !== undefined) {
        issues.push(
                issueFactories.observationDefinition.invalidRange(
                  correspondingObservationDefinition,
                ),
              )
            } else {
              issues.push(
                issueFactories.observationDefinition.missingRange(
                  correspondingObservationDefinition,
                ),
              );
            }
      }
      if (!isScoreHealthCorrelationValid && correspondingObservationDefinition) {
        if (scoreHealthCorrelationRaw !== undefined) {
           issues.push(
                issueFactories.observationDefinition.invalidScoreHealthCorrelation(
                  correspondingObservationDefinition,
                ),
              )}
              else {
            issues.push(
                issueFactories.observationDefinition.missingScoreHealthCorrelation(
                  correspondingObservationDefinition,
                ),
              );  
            }     
      }

      // Check if real range and scoreHealthCorrelation
      const range = isRangeValid ? rangeRaw : undefined;
      const scoreHealthCorrelation = isScoreHealthCorrelationValid ? scoreHealthCorrelationRaw : undefined;

      if (range !== undefined && scoreHealthCorrelation !== undefined) {
        // Score
        const scoreItem = item as Mapping.QuestionnaireScoreItem;
        scoreItem.range = range;
        scoreItem.scoreHealthCorrelation = scoreHealthCorrelation;
        items[linkId] = scoreItem;
      } else if (scoreHealthCorrelation !== undefined) {
        const questionnaireItem = item as Mapping.QuestionnaireItem;
        questionnaireItem.scoreHealthCorrelation = scoreHealthCorrelation;
        items[linkId] = questionnaireItem;
      } else if (range !== undefined) {
        const questionnaireItem = item as Mapping.QuestionnaireItem;
        questionnaireItem.range = range;
        items[linkId] = questionnaireItem;
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
  config: Config.PromConfig,
): Errors.Result<Record<string, Mapping.Item>> => {
  const items: Record<string, Mapping.Item> = {};
  const issues: Errors.DataIssue[] = [];
  const questionnaireDomainItemMapping = config.questionnaires.find(
    (q) => q.questionnaire === questionnaire.url,
  )?.domainItemMapping;
  Object.entries(questionnaire.items).forEach(([linkId, item]) => {
    const domainItemMapping = questionnaireDomainItemMapping?.find((dim) =>
      dim.questions?.map((question) => question.itemId).includes(linkId),
    );
    const shortName = domainItemMapping?.questions?.find(
      (question) => question.itemId === linkId,
    )?.shortName;
    items[linkId] = item;
    if (shortName !== undefined) {
      items[linkId].shortText = shortName;
    }
    // else {
    // shortText is linkId
    // cut length of linkId (should not be necessary in practice)
    // const itemShortText = item.shortText;
    // const shortenedItemText = item.shortText.slice(0, 25);
    // items[linkId].shortText = shortenedItemText;
    // if (shortenedItemText !== itemShortText) {
    //   // warning
    //   issues.push({
    //     id: `issue-questionnaire-${Math.random().toString(36).substring(2, 9)}`,
    //     level: "warning",
    //     message: `The name for item with linkId ${linkId} in Questionnaire with
    //       url ${questionnaire.url} had to be shortened
    //       to ${shortenedItemText} since it exceeds the maximum of 25 characters.`,
    //     resourceId: questionnaire.id,
    //     resourceType: "Questionnaire",
    //     linkId: linkId,
    //   });
    // }
    // }
  });
  return {
    data: items,
    issues: issues,
  };
};

export const addDimensionAndDomainScoreFlagsToQuestionnaireItems = (
  questionnaire: Mapping.Questionnaire,
  config: Config.PromConfig,
): Errors.Result<Record<string, Mapping.Item>> => {
  const items: Record<string, Mapping.Item> = {};
  const issues: Errors.DataIssue[] = [];
  const questionnaireFromConfig = config.questionnaires.find(
    (q) => q.questionnaire === questionnaire.url,
  );
  const questionnaireDomainItemMapping =
    questionnaireFromConfig?.domainItemMapping;
  const globalScoreLinkIds = questionnaireFromConfig?.globalScores;
  Object.entries(questionnaire.items).forEach(([linkId, item]) => {
    const domainItemMapping = questionnaireDomainItemMapping?.find((dim) =>
      dim.questions?.map((question) => question.itemId).includes(linkId),
    );
    const dimension = domainItemMapping?.questions?.find(
      (question) => question.itemId === linkId,
    )?.dimension;
    const isDimensionScore = domainItemMapping?.questions?.find(
      (question) => question.itemId === linkId,
    )?.isDimensionScore;

    items[linkId] = item;
    if (dimension !== undefined && dimension.length > 0) {
      items[linkId].dimension = dimension;
    }
    if (isDimensionScore !== undefined && isDimensionScore) {
      items[linkId].isDimensionScore = true;
    }
    if (
      globalScoreLinkIds !== undefined &&
      globalScoreLinkIds.includes(linkId)
    ) {
      (items[linkId] as Mapping.QuestionnaireScoreItem).isGlobalScore = true;
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
  config: Config.PromConfig,
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
      (q) => q.questionnaire === questionnaireUrl,
    )?.domainItemMapping;

    const domainItemMapping = questionnaireDomainItemMapping?.find((dim) =>
      dim.questions
        ?.map((question) => question.observationDefinition)
        .includes(observationDefinition),
    );
    const linkId = domainItemMapping?.questions?.find(
      (question) =>
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
