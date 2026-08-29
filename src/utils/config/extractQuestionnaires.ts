import type { NormalizedFHIR } from "@utils/normalization";
import type { Errors } from "@utils/errors";
import { issueFactories } from "@utils/errors";
import * as _ from "lodash-es";
import type { Config } from "./types";

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
