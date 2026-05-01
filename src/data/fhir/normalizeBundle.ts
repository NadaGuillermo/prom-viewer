import type { NormalizedFHIR } from "./types";
import type { Mapping } from "@data/globalTypes";
import { normalizeQuestionnaire } from "./normalizeQuestionnaire";
import { normalizeQuestionnaireResponse } from "./normalizeQuestionnaireResponse";
import { normalizeObservation } from "./normalizeObservation";

export const normalizeBundle = (resource: any): Mapping.Result<NormalizedFHIR.Bundle> => {
  const issues: Mapping.DataIssue[] = [];

  const bundleQuestionnaireEntry = resource.entry.find((e: any) => e.resource?.resourceType === "Questionnaire");
  const bundleQuestionnaireResponseEntry = resource.entry.find((e: any) => e.resource?.resourceType === "QuestionnaireResponse");
  const bundleObservationEntries = resource.entry.filter((e: any) => e.resource?.resourceType === "Observation");


  if (bundleQuestionnaireEntry === undefined || bundleQuestionnaireResponseEntry === undefined) {
    issues.push({
      id: `issue-bundle-${resource.id}-${Math.random().toString(36).substring(2, 9)}`,
      level: 'error',
      message: `Bundle ${resource.id} does not contain a ${bundleQuestionnaireEntry === undefined ? "Questionnaire" : ""} ${bundleQuestionnaireEntry === undefined && bundleQuestionnaireResponseEntry !== undefined ? "and" : ""} ${bundleQuestionnaireResponseEntry === undefined ? "QuestionnaireResponse" : ""} and will therefore be omitted.`,
    });
  }
  const questionnaireWithErrorMessages = bundleQuestionnaireEntry !== undefined ? normalizeQuestionnaire(bundleQuestionnaireEntry.resource) : undefined;
  const questionnaireIssues = questionnaireWithErrorMessages?.issues;
  const questionnaire = questionnaireWithErrorMessages?.data;
  const questionnaireResponseWithErrorMessages = bundleQuestionnaireResponseEntry !== undefined && questionnaire !== undefined ? normalizeQuestionnaireResponse(bundleQuestionnaireResponseEntry.resource, [questionnaire]) : undefined;
  const questionnaireResponseIssues = questionnaireResponseWithErrorMessages?.issues;
  const questionnaireResponse = questionnaireResponseWithErrorMessages?.data;
  const observationsWithErrorMessages = bundleObservationEntries !== undefined ? bundleObservationEntries.map((entry: any) => normalizeObservation(entry.resource)) : undefined;
  const observationIssues = observationsWithErrorMessages?.map((observation: any) => observation.issues).flat();
  const observations = observationsWithErrorMessages?.map((observation: any) => observation.data);

  if (questionnaireIssues) {
    issues.push(...questionnaireIssues);
  }
  if (questionnaireResponseIssues) {
    issues.push(...questionnaireResponseIssues);
  }
  if (observationIssues) {
    issues.push(...observationIssues);
  }

  return {
    data: {
      questionnaire: questionnaire, // can be undefined, filter in next step
      questionnaireResponse: questionnaireResponse, // can be undefined, filter in next step
      observations: observations, // can be undefined, filter in next step
    },
    issues
  }

}