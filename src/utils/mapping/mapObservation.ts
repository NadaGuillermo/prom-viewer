/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import type * as NormalizedFHIR from "@utils/normalization";
import type * as Mapping from "./types";
import type * as Errors from "@utils/errors";
import { issueFactories } from "@utils/errors";

export const mapObservation = (
  observation: NormalizedFHIR.Observation,
): Errors.Result<Mapping.Observation> => {
  const issues: Errors.DataIssue[] = [];
  const observationId = observation.id;
  const observationValue = observation.value;
  const questionnaireResponse = observation.questionnaireResponse;
  const observationDefinition = observation.observationDefinition;

  const value = observationValue === null || Number.isNaN(Number(observationValue)) ? null : Number(observationValue);

  if (value === null) {
    issues.push(
      issueFactories.observation.invalidObservationValue(observation),
    );
  }
  
  return {
    data: {
      id: observationId,
      value: value,
      questionnaireResponse: questionnaireResponse,
      observationDefinition: observationDefinition,
    },
    issues: issues,
  };
};
