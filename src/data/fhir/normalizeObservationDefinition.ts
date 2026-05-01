import type { NormalizedFHIR } from "./types";
import type { Mapping } from "@data/globalTypes";

export const normalizeObservationDefinition = (
  resource: any,
): Mapping.Result<NormalizedFHIR.ObservationDefinition> => {
  const issues: Mapping.DataIssue[] = [];

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

  // error wenn range und scoreHealthCorrelation undefined
  // if (lowerBoundary === undefined || upperBoundary === undefined || scoreHealthCorrelation === undefined) {
  //   issues.push({
  //     id: `issue-observationDefinition-${resource.id}-${Math.random().toString(36).substring(2, 9)}`,
  //     level: 'error',
  //     message: `ObservationDefinition with id ${resource.id} does not specify a range or scoreHealthCorrelation.`,
  //   });
  // }

  return {
    data: {
    id: resource.id, // sollte immer gegeben sein
    range: [lowerBoundary, upperBoundary], // optional
    scoreHealthCorrelation: scoreHealthCorrelation, // optional
    //code: observationDefinitionCode, // immer gegeben
    },
    issues,
  };
};
