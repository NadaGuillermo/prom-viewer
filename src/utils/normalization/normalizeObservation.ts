import type { Observation } from "fhir/r4";
import type * as NormalizedFHIR from "./types";
import type * as Errors from "@utils/errors";
import { issueFactories } from "@utils/errors";
import {
  getQuestionnaireResponseIdFromObservationReferenceAttribute,
  getObservationDefinitionCanonicalUrlFromObservation,
} from "./utils";

export const normalizeObservation = (
  resource: Observation,
): Errors.Result<NormalizedFHIR.Observation> => {
  const issues: Errors.DataIssue[] = [];

  const questionnaireResponse =
    getQuestionnaireResponseIdFromObservationReferenceAttribute(resource);
  const observationDefinition =
    getObservationDefinitionCanonicalUrlFromObservation(resource); // canonical url
  const observationValue = resource.valueQuantity
    ? (resource.valueQuantity.value ?? null)
    : null;

  if (questionnaireResponse === undefined) {
    issues.push(
      issueFactories.observation.missingQuestionnaireResponse(resource),
    );
  }
  if (observationDefinition === undefined) {
    issues.push(
      issueFactories.observation.missingObservationDefinition(resource),
    );
  }

  return {
    data: {
      id: resource.id!, // should always be given
      questionnaireResponse: questionnaireResponse, // id or undefined
      observationDefinition: observationDefinition, // url or undefined
      value: observationValue,
    },
    issues: issues,
  };
};
