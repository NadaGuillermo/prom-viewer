/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import * as _ from "lodash-es";

import type * as Mapping from "@utils/mapping/types";
import { addObservationItemsToQuestionnaireResponse } from "./utils";
import type * as Errors from "@utils/errors";
import { issueFactories } from "@utils/errors";
import type * as Config from "./types";

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
      issues.push(
        issueFactories.questionnaireResponse.unreferencedItem(response, linkId),
      );
    });
  }
  // LinkIds that are in Questionnaire but not in QuestionnaireResponse aren't a problem since they won't be displayed

  /**
   * Add:
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
