import type * as Mapping from "@utils/mapping";
import type * as Errors from "@utils/errors";
import { issueFactories } from "@utils/errors";
import {
  addDomainToQuestionnaireItems,
  addRangeAndScoreHealthCorrelationToQuestionnaireScoreItems,
  addShortNamesToQuestionnaireItems,
  addDimensionAndDomainScoreFlagsToQuestionnaireItems,
  getEmptyAnswerOptions,
  addReferenceRangesAndValuesToQuestionnaireScoreItems,
} from "./utils";
import type * as Config from "./types";

export const addConfigurationsToQuestionnaire = (
  questionnaire: Mapping.Questionnaire,
  observationDefinitions: Mapping.ObservationDefinition[],
  config: Config.PromConfig,
): Errors.Result<Mapping.Questionnaire> => {
  const issues: Errors.DataIssue[] = [];

  /**
   * Add:
   * 1. Domains
   * 2. Score attributes
   * 3. Item short names
   * 4. Type of item (dimension/domain score, simple item)
   * 5. Reference values
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

  // Item short names
  const questionnaireItemsWithShortNamesAndErrorMessages =
    addShortNamesToQuestionnaireItems(questionnaireWithConfigSettings, config);
  questionnaireWithConfigSettings.items =
    questionnaireItemsWithShortNamesAndErrorMessages.data;
  questionnaireItemsWithShortNamesAndErrorMessages.issues.forEach((issue) => {
    issues.push(issue);
  });

  // Dimension and domain score flags
  const questionnaireItemsWithScoreFlagsAndErrorMessages =
    addDimensionAndDomainScoreFlagsToQuestionnaireItems(
      questionnaireWithConfigSettings,
      config,
    );
  questionnaireWithConfigSettings.items =
    questionnaireItemsWithScoreFlagsAndErrorMessages.data;
  questionnaireItemsWithScoreFlagsAndErrorMessages.issues.forEach((issue) => {
    issues.push(issue);
  });

  // Reference ranges and values
  const questionnaireItemsWithReferenceValuesAndErrorMessages =
    addReferenceRangesAndValuesToQuestionnaireScoreItems(
      questionnaireWithConfigSettings,
      observationDefinitions,
      config,
    );
  questionnaireWithConfigSettings.items =
    questionnaireItemsWithReferenceValuesAndErrorMessages.data;
  questionnaireItemsWithReferenceValuesAndErrorMessages.issues.forEach(
    (issue) => {
      issues.push(issue);
    },
  );

  // Check for simple items with no answer options and throw error
  const itemsWithEmptyAnswerOptions = getEmptyAnswerOptions(
    questionnaireWithConfigSettings,
  );
  if (itemsWithEmptyAnswerOptions.length > 0) {
    itemsWithEmptyAnswerOptions.forEach((linkId) => {
      issues.push(
        issueFactories.questionnaire.missingItemAnswerOption(
          questionnaireWithConfigSettings,
          linkId,
        ),
      );
    });
  }

  return {
    data: questionnaireWithConfigSettings,
    issues: issues,
  };
};
