import type { Mapping } from "@utils/mapping/types";
import { addObservationItemsToQuestionnaireResponse } from "./utils";
import type { GlobalTypes } from "@customTypes/globalTypes";
import * as _ from "lodash-es";

export const addConfigurationsToQuestionnaireResponse = (
  response: Mapping.QuestionnaireResponse,
  observations: Mapping.Observation[],
  config: any,
): GlobalTypes.Result<Mapping.QuestionnaireResponse> => {
  const issues: GlobalTypes.DataIssue[] = [];

  const responseLinkIds = Object.keys(response.items);
  const questionnaireLinkIds = Object.keys(response.questionnaire.items);
  const linkIdsInResponseButNotInQuestionnaire = _.difference(
    responseLinkIds,
    questionnaireLinkIds,
  );

  if (linkIdsInResponseButNotInQuestionnaire.length > 0) {
    linkIdsInResponseButNotInQuestionnaire.forEach((linkId) => {
      issues.push({
        id: `issue-response-${Math.random().toString(36).substring(2, 9)}`,
        level: "error",
        message: `Item with linkId ${linkId} exists in QuestionnaireResponse with id ${response.id} but does not exist in Questionnaire with url ${response.questionnaire.url}. It will not be displayed.`,
        resourceId: response.id,
        resourceType: "QuestionnaireResponse",
        linkId: linkId,
      });
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
