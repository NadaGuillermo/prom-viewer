import type { Patient } from "fhir/r4";

import type * as NormalizedFHIR from "./types";

export const normalizePatient = (resource: Patient): NormalizedFHIR.Patient => {

const id = resource.id;
const name = resource.name?.find((n) => n.family !== undefined && n.given !== undefined);
const familyName = name?.family;
const givenName = name?.given?.join(' ');
const gender = resource.gender;
const birthDate = resource.birthDate;



  return {
      id: id!,
      familyName: familyName,
      givenName: givenName,
      gender: gender,
      birthDate: birthDate
    }
   
}