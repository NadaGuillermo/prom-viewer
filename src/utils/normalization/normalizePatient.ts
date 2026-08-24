import type { Patient } from "fhir/r4";

import type { NormalizedFHIR } from "./types";

export const normalizePatient = (resource: Patient): NormalizedFHIR.Patient => {

const id: string = resource.id!;
const name = resource.name?.find((n) => n.family !== undefined && n.given !== undefined);
const familyName: string | undefined = name?.family;
const givenName: string | undefined = name?.given?.join(' ');
const gender: string | undefined = resource.gender;
const birthDate: string | undefined = resource.birthDate;



  return {
      id: id,
      familyName: familyName,
      givenName: givenName,
      gender: gender,
      birthDate: birthDate
    }
   
}