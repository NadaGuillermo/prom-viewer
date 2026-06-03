import type { NormalizedFHIR } from "./types";
import { issueFactories, type Errors } from "@utils/errors";
import { getQuestionnaireResponseIdFromObservationReferenceAttribute } from "./utils";

export const normalizeObservation = (
  resource: any,
): Errors.Result<NormalizedFHIR.Observation> => {
  const issues: Errors.DataIssue[] = [];

  const questionnaireResponse =
    getQuestionnaireResponseIdFromObservationReferenceAttribute(resource);
  const observationDefinition = resource.extension?.find(
    (ext: any) => ext.valueCanonical !== undefined,
  )?.valueCanonical; // url
  // const observationText = resource.code?.coding?.find((cod: any) => cod.display !== undefined && cod.code !== undefined)?.display;
  const observationValue = resource.valueQuantity
    ? resource.valueQuantity.value
    : null;

    if (questionnaireResponse === undefined) {
      issues.push(issueFactories.observation.missingQuestionnaireResponse(resource));
    }
    if (observationDefinition === undefined) {
      issues.push(issueFactories.observation.missingObservationDefinition(resource));
    }

  return {
    data: {
      id: resource.id, // sollte immer gegeben sein
      questionnaireResponse: questionnaireResponse, // id or undefined
      observationDefinition: observationDefinition, // url or undefined
      // code: observationCode, // immer geben
      value: observationValue, // optional
    },
    issues: issues,
  };
};
