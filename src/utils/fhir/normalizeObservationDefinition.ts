import type { NormalizedFHIR } from "./types";
import { type Errors } from "@utils/errors";

export const normalizeObservationDefinition = (
  resource: any,
): Errors.Result<NormalizedFHIR.ObservationDefinition> => {
  const issues: Errors.DataIssue[] = [];

  const range = resource.qualifiedInterval?.find((interval: any) => {
    return interval.range != undefined;
  }).range;
  const lowerBoundary = range?.low?.value;
  const upperBoundary = range?.high?.value;

  const lowerBoundNumber = Number(lowerBoundary);
  const upperBoundNumber = Number(upperBoundary);

  const scoreHealthCorrelation = range?.extension
    ?.find((ext: any) => {
      const coding = ext.valueCodeableConcept?.coding;
      return coding != undefined;
    })
    .valueCodeableConcept?.coding?.find((cod: any) => {
      return cod.code != undefined;
    })?.code;

  return {
    data: {
      id: resource.id, // sollte immer gegeben sein
      url: resource.url, // immer gegeben
      ...(!isNaN(lowerBoundNumber) &&
        !isNaN(upperBoundNumber) && {
          range: [lowerBoundNumber, upperBoundNumber],
        }),
      ...(scoreHealthCorrelation !== undefined && {
        scoreHealthCorrelation: scoreHealthCorrelation,
      }),
      //code: observationDefinitionCode, // immer gegeben
    },
    issues: issues,
  };
};
