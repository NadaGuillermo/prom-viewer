/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import type { Observation, QuestionnaireResponse } from "fhir/r4";
import { getObservationDefinitionCanonicalUrlFromObservation } from "@utils/normalization/utils";

/**
 * @param responses - raw FHIR QuestionnaireResponse resources
 * @returns deduplicated list of canonical Questionnaire urls referenced by the responses
 * @description Reads QuestionnaireResponse.questionnaire to determine which Questionnaires must be fetched next.
 */
export function extractQuestionnaireCanonicalUrls(responses: QuestionnaireResponse[]): string[] {
  const urls = responses
    .map((response) => response.questionnaire)
    .filter((url): url is string => url !== undefined);
  return [...new Set(urls)];
}

/**
 * @param observations - raw FHIR Observation resources
 * @returns deduplicated list of canonical ObservationDefinition urls referenced by the observations
 * @description Reads the workflow-instantiatesCanonical extension to determine which ObservationDefinitions must be fetched next.
 */
export function extractObservationDefinitionCanonicalUrls(
  observations: Observation[],
): string[] {
  const urls = observations
    .map((observation) =>
      getObservationDefinitionCanonicalUrlFromObservation(observation),
    )
    .filter((url): url is string => url !== undefined);
  return [...new Set(urls)];
}
