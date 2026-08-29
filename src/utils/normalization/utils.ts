import type { Observation } from "fhir/r4";
import type { NormalizedFHIR } from "./types";

/**
 * @param resource - a raw FHIR Observation resource
 * @returns the canonical url of the ObservationDefinition the observation instantiates, or undefined
 * @description Reads the workflow-instantiatesCanonical extension used to link an Observation to its ObservationDefinition.
 */
export const getObservationDefinitionCanonicalUrlFromObservation = (resource: Observation): string | undefined => {
  return resource.extension?.find(
    (ext) => ext.url === "http://hl7.org/fhir/StructureDefinition/workflow-instantiatesCanonical"
  )?.valueCanonical;
}

// ok
export const getQuestionnaireResponseIdFromObservationReferenceAttribute = (resource: Observation): string |undefined => {
  const questionnaireResponse: string | undefined = resource.derivedFrom?.find((entry) => entry.reference !== undefined)?.reference;

  if (questionnaireResponse === undefined) {
    return undefined;
  }

  // reference has form "QuestionnaireResponse/[id]"

  const splitPosition = questionnaireResponse.indexOf("/");
  if (splitPosition === -1) {
    return undefined;
  }

  return questionnaireResponse.slice(splitPosition + 1);
}

export const isAnswerOptionCode = (
  answerOption: NormalizedFHIR.AnswerOption
): answerOption is NormalizedFHIR.AnswerOptionCode => {
  return (answerOption as NormalizedFHIR.AnswerOptionCode).code !== undefined;
}

export const isAnswerCode = (
  answer: NormalizedFHIR.Answer
): answer is NormalizedFHIR.AnswerCode => {
  return (answer as NormalizedFHIR.AnswerCode).code !== undefined;
}
