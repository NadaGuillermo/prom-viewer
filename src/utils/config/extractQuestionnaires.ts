/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import * as _ from "lodash-es";

import type * as NormalizedFHIR from "@utils/normalization";
import type * as Errors from "@utils/errors";
import { issueFactories } from "@utils/errors";
import type * as Config from "./types";

export const extractQuestionnairesFromConfig = (
  config: Config.PromConfig,
): string[] => {
  const questionnaires: string[] = config.questionnaires.map(
    (q) => q.questionnaire,
  );
  return [...new Set(questionnaires)];
};

export const findQuestionnairesNotListedInConfig = (
  questionnairesUrlsFromConfig: string[],
  questionnaireResponses: NormalizedFHIR.QuestionnaireResponse[],
  questionnaires: NormalizedFHIR.Questionnaire[],
): Errors.Result<string[]> => {
  const questionnairesNotInConfig = _.difference(
    questionnairesUrlsFromConfig,
    questionnaireResponses.map((response) => response.questionnaire),
  );
  const issues: Errors.DataIssue[] = [];
  questionnairesNotInConfig.forEach((url) => {
    const questionnaire = questionnaires.find((q) => q.url === url);
    if (questionnaire !== undefined) {
      issues.push(issueFactories.questionnaire.missingInConfig(questionnaire));
    }
  });
  return {
    data: questionnairesNotInConfig,
    issues: issues,
  };
};
