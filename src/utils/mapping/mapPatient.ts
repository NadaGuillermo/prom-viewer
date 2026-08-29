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
