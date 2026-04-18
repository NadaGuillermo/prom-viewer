import type { NormalizedFHIR } from "./types";

export const normalizeObservationDefinition = (
  resource: any,
): NormalizedFHIR.ObservationDefinition => {
  const range = resource.qualifiedInterval?.find(
    (interval: any) => {return interval.range != undefined}
  ).range;
  const lowerBoundary = range?.low?.value;
  const upperBoundary = range?.high?.value;

  const scoreHealthCorrelation = range?.extension?.find((ext: any) => {
    const coding = ext.valueCodeableConcept?.coding;
    return coding != undefined;
  }).valueCodeableConcept?.coding?.find((cod: any) => {
    return cod.code != undefined;
  })?.code;

  // nur heuristik, echte Referenz finden
  const observationDefinitionCode = resource.code?.coding?.find((elem: any) => {
    return elem.code != undefined;
  })?.code;

  return {
    id: resource.id, // sollte immer gegeben sein
    range: [lowerBoundary, upperBoundary], // optional
    scoreHealthCorrelation: scoreHealthCorrelation, // optional
    code: observationDefinitionCode, // immer gegeben
  };
};
