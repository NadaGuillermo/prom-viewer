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
import { convertFhirDateTimeToDateFormat } from "./utils";
import type * as Errors from "@utils/errors";
import { issueFactories } from "@utils/errors";

export const mapPatient = (
  patient: NormalizedFHIR.Patient,
): Errors.Result<Mapping.Patient> => {
  const issues: Errors.DataIssue[] = [];

  const formattedBirthDate =
    patient.birthDate !== undefined
      ? convertFhirDateTimeToDateFormat(patient.birthDate)
      : undefined;

  if (patient.familyName === undefined || patient.givenName === undefined) {
    issues.push(issueFactories.patient.missingName(patient));
  }

  return {
    data: {
      id: patient.id,
      familyName: patient.familyName ?? "Unknown",
      givenName: patient.givenName ?? "",
      gender: patient.gender,
      birthDate: formattedBirthDate,
    },
    issues: issues,
  };
};
