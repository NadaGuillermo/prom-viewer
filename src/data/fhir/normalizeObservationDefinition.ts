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

  const lowerBoundNumber = Number(lowerBoundary);
  const upperBoundNumber = Number(upperBoundary);

  const scoreHealthCorrelation = range?.extension?.find((ext: any) => {
    const coding = ext.valueCodeableConcept?.coding;
    return coding != undefined;
  }).valueCodeableConcept?.coding?.find((cod: any) => {
    return cod.code != undefined;
  })?.code;

  // error wenn lowerBound und upperBound definiert, aber keine Zahlen
  if ((lowerBoundary !== undefined && isNaN(lowerBoundNumber)) || (upperBoundary !== undefined && isNaN(upperBoundNumber))) {
    issues.push({
      id: `issue-observationDefinition-${Math.random().toString(36).substring(2, 9)}`,
      level: 'warning',
      message: `Range in ObservationDefinition with id ${resource.id} cannot be converted to a number. Range is: [${lowerBoundary}, ${upperBoundary}].`,
      resourceId: resource.id,
      resourceType: "ObservationDefinition",
      linkId: undefined,
    });
  }

  return {
    data: {
    id: resource.id, // sollte immer gegeben sein
    url: resource.url, // immer gegeben
    ...(!isNaN(lowerBoundNumber) && !isNaN(upperBoundNumber) && { range: [lowerBoundNumber, upperBoundNumber] }),
    ...(scoreHealthCorrelation !== undefined && { scoreHealthCorrelation: scoreHealthCorrelation }),
    //code: observationDefinitionCode, // immer gegeben
    },
    issues: issues,
  };
};
