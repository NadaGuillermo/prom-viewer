/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import type { Observation } from "fhir/r4";
import type * as NormalizedFHIR from "./types";

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

/**
 * @param resource - a raw FHIR Observation resource
 * @returns the id of the QuestionnaireResponse referenced in the observation's `derivedFrom` attribute, or undefined if no such reference exists
 */
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

/**
 * @param answerOption - the normalized answer option to check
 * @returns true if `answerOption` is a coded answer option, i.e. it defines a `code` (narrows the type to `AnswerOptionCode`)
 */
export const isAnswerOptionCode = (
  answerOption: NormalizedFHIR.AnswerOption
): answerOption is NormalizedFHIR.AnswerOptionCode => {
  return (answerOption as NormalizedFHIR.AnswerOptionCode).code !== undefined;
}

/**
 * @param answer - the normalized answer to check
 * @returns true if `answer` is a coded answer, i.e. it defines a `code` (narrows the type to `AnswerCode`)
 */
export const isAnswerCode = (
  answer: NormalizedFHIR.Answer
): answer is NormalizedFHIR.AnswerCode => {
  return (answer as NormalizedFHIR.AnswerCode).code !== undefined;
}
