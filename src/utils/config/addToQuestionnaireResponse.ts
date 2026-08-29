import type { Mapping } from "@utils/mapping/types";
import { addObservationItemsToQuestionnaireResponse } from "./utils";
import type { Errors } from "@utils/errors";
import { issueFactories } from "@utils/errors";
import * as _ from "lodash-es";
import type { Config } from "./types";

export const addConfigurationsToQuestionnaireResponse = (
  response: Mapping.QuestionnaireResponse,
  observations: Mapping.Observation[],
  config: Config.PromConfig,
): Errors.Result<Mapping.QuestionnaireResponse> => {
  const issues: Errors.DataIssue[] = [];

  const responseLinkIds = Object.keys(response.items);
  const questionnaireLinkIds = Object.keys(response.questionnaire.items);
  const linkIdsInResponseButNotInQuestionnaire = _.difference(
    responseLinkIds,
    questionnaireLinkIds,
  );

  if (linkIdsInResponseButNotInQuestionnaire.length > 0) {
    linkIdsInResponseButNotInQuestionnaire.forEach((linkId) => {
      issues.push(issueFactories.questionnaireResponse.unreferencedItem(response, linkId));
    });
  }
  // LinkIds in Q but not in R not a problem since they won't be displayed

  /**
   * 1. Observation items
   */
  const responseWithConfigSettings = addObservationItemsToQuestionnaireResponse(
    response,
    observations,
    config,
  );
  return {
    data: responseWithConfigSettings,
    issues: issues,
  };
};
