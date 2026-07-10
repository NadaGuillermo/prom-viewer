import type { Mapping } from "@utils/mapping";
import { issueFactories, type Errors } from "@utils/errors";
import {
  addDomainToQuestionnaireItems,
  addRangeAndScoreHealthCorrelationToQuestionnaireScoreItems,
  addShortNamesToQuestionnaireItems,
  addDimensionAndDomainScoreFlagsToQuestionnaireItems,
  getEmptyAnswerOptions,
  addReferenceRangesAndValuesToQuestionnaireScoreItems,
} from "./utils";
import * as _ from "lodash-es";

export const addConfigurationsToQuestionnaire = (
  questionnaire: Mapping.Questionnaire,
  observationDefinitions: Mapping.ObservationDefinition[],
  config: any,
): Errors.Result<Mapping.Questionnaire> => {
  const issues: Errors.DataIssue[] = [];

  // const questionnaireLinkIds = Object.keys(questionnaire.items);
  // const configLinkIds: string[] =
  //   config.questionnaires
  //     .find((q: any) => q.questionnaire === questionnaire.url)
  //     ?.domainItemMapping.flatMap((dim: any) =>
  //       dim.questions.map((question: any) => question.itemId),
  //     ) ?? [];

  // const linkIdsInConfigButNotInQuestionnaire = _.difference(configLinkIds, questionnaireLinkIds);
  // const linkIdsInQuestionnaireButNotInConfig = _.difference(
  //   questionnaireLinkIds,
  //   configLinkIds,
  // );

  // if (linkIdsInConfigButNotInQuestionnaire.length > 0) {
  //     linkIdsInConfigButNotInQuestionnaire.forEach((linkId) => {
  //         issues.push({
  //             id: `issue-questionnaire-${Math.random().toString(36).substring(2, 9)}`,
  //             level: 'warning',
  //             message: `Item with linkId ${linkId} is mentioned in the configuration file but does not exist in Questionnaire with url ${questionnaire.url}.`,
  //             resourceId: questionnaire.id,
  //             resourceType: "Questionnaire",
  //             linkId: linkId,
  //         });
  //     });
  // }

  // if (linkIdsInQuestionnaireButNotInConfig.length > 0) {
  //   linkIdsInQuestionnaireButNotInConfig.forEach((linkId) => {
  //     issues.push({
  //       id: `issue-questionnaire-${Math.random().toString(36).substring(2, 9)}`,
  //       level: "warning",
  //       message: `Item with linkId ${linkId} is not mentioned in the configuration file but exists in Questionnaire with url ${questionnaire.url}.`,
  //       resourceId: questionnaire.id,
  //       resourceType: "Questionnaire",
  //       linkId: linkId,
  //     });
  //   });
  // }

  /**
   * 1. Domains
   * 2. Score attributes
   * 3. Item short names
   */
  const questionnaireWithConfigSettings = questionnaire;

  // Domains
  const questionnaireItemsWithDomains = addDomainToQuestionnaireItems(
    questionnaireWithConfigSettings,
    config,
  );
  questionnaireWithConfigSettings.items = questionnaireItemsWithDomains;

  // Score attributes
  const questionnaireItemsWithScoreAttributesAndErrorMessages =
    addRangeAndScoreHealthCorrelationToQuestionnaireScoreItems(
      questionnaireWithConfigSettings,
      observationDefinitions,
      config,
    );
  questionnaireWithConfigSettings.items =
    questionnaireItemsWithScoreAttributesAndErrorMessages.data;
  questionnaireItemsWithScoreAttributesAndErrorMessages.issues.forEach(
    (issue) => {
      issues.push(issue);
    },
  );

  // Short names
  const questionnaireItemsWithShortNamesAndErrorMessages =
    addShortNamesToQuestionnaireItems(questionnaireWithConfigSettings, config);
  questionnaireWithConfigSettings.items =
    questionnaireItemsWithShortNamesAndErrorMessages.data;
  questionnaireItemsWithShortNamesAndErrorMessages.issues.forEach((issue) => {
    issues.push(issue);
  });

  // Dimension and Domain Score flags
  const questionnaireItemsWithScoreFlagsAndErrorMessages =
    addDimensionAndDomainScoreFlagsToQuestionnaireItems(questionnaireWithConfigSettings, config);
  questionnaireWithConfigSettings.items =
    questionnaireItemsWithScoreFlagsAndErrorMessages.data;
  questionnaireItemsWithScoreFlagsAndErrorMessages.issues.forEach((issue) => {
    issues.push(issue);
  });

  // Reference ranges and values
  const questionnaireItemsWithReferenceValuesAndErrorMessages = 
    addReferenceRangesAndValuesToQuestionnaireScoreItems(questionnaireWithConfigSettings, observationDefinitions, config);
  questionnaireWithConfigSettings.items = 
  questionnaireItemsWithReferenceValuesAndErrorMessages.data;
  questionnaireItemsWithReferenceValuesAndErrorMessages.issues.forEach((issue) => {
    issues.push(issue);
  })

  
    // empty answer options
  const itemsWithEmptyAnswerOptions = getEmptyAnswerOptions(
    questionnaireWithConfigSettings,
  );
  if (itemsWithEmptyAnswerOptions.length > 0) {
    itemsWithEmptyAnswerOptions.forEach((linkId) => {
      issues.push(issueFactories.questionnaire.missingItemAnswerOption(questionnaireWithConfigSettings, linkId));
    });
  }

  return {
    data: questionnaireWithConfigSettings,
    issues: issues,
  };
};
