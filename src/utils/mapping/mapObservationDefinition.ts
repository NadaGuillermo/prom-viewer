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

export const mapObservationDefinition = (
  normalizedObservationDefinition: NormalizedFHIR.ObservationDefinition,
): Errors.Result<Mapping.ObservationDefinition> => {
  const issues: Errors.DataIssue[] = [];

  const range = normalizedObservationDefinition.range;
  const scoreHealthCorrelation =
    normalizedObservationDefinition.scoreHealthCorrelation;
  const referenceRange: Mapping.ReferenceRange[] | undefined =
    normalizedObservationDefinition.referenceRange?.map((range) => {
      return {
        range: range.range,
        name: range.context ?? "Reference Value",
      };
    });

  return {
    data: {
      id: normalizedObservationDefinition.id,
      url: normalizedObservationDefinition.url,
      range: range,
      scoreHealthCorrelation: scoreHealthCorrelation,
      referenceRange: referenceRange,
    },
    issues: issues,
  };
};
