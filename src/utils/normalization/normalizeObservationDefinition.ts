import type { ObservationDefinition } from "@services/fhir/types";
import type { NormalizedFHIR } from "./types";
import { type Errors } from "@utils/errors";

export const normalizeObservationDefinition = (
  resource: ObservationDefinition,
): Errors.Result<NormalizedFHIR.ObservationDefinition> => {
  const issues: Errors.DataIssue[] = [];

  const range = resource.qualifiedInterval?.find((interval) => interval.category !== undefined && interval.category === "absolute")?.range;
  const lowerBoundary = range?.low?.value;
  const upperBoundary = range?.high?.value;
  const lowerBoundNumber = Number(lowerBoundary);
  const upperBoundNumber = Number(upperBoundary);
  const scoreHealthCorrelation: string | undefined = range?.extension
    ?.find((ext) => ext.url === "https://www.medizininformatik-initiative.de/fhir/ext/modul-pro/StructureDefinition/mii-ex-pro-score-score-health-correlation")?.valueString;


  const referenceIntervals = resource.qualifiedInterval?.filter((interval) => interval.category !== undefined && (interval.category === "critical" || interval.category === "reference"));
  const referenceRangeRaw: {range: [number | undefined, number | undefined], context: string | undefined}[] | undefined = referenceIntervals ? referenceIntervals.map((interval) => {return {range: [interval.range?.low?.value, interval.range?.high?.value] as [number | undefined, number | undefined], context: interval.context?.coding?.find((coding) => coding.system === "http://terminology.hl7.org/CodeSystem/referencerange-meaning")?.code}}) : undefined;
  // implicitely assume healthScoreCorrelation same as for absolute interval
  const referenceRange: NormalizedFHIR.ReferenceRange[] = [];
  // let referenceValue: NormalizedFHIR.ReferenceRange[] = [];
  if (referenceRangeRaw !== undefined) {
    referenceRangeRaw.forEach((rangeRaw) => {
      const range = rangeRaw.range;
      const context = rangeRaw.context;
      if (range[0] !== undefined && range[1] !== undefined && !isNaN(range[0]) && !isNaN(range[1])) {
        referenceRange.push({range: [Number(range[0]), Number(range[1])], ...(context && {context: context})});
      } else {
        if (range[0] !== undefined && !isNaN(range[0])) {
          referenceRange.push({range: Number(range[0]), ...(context && {context: context})});
        }
        if (range[1] !== undefined && !isNaN(range[1])) {
          referenceRange.push({range: Number(range[1]), ...(context && {context: context})});
        }
      }
    })
  }

  return {
    data: {
      id: resource.id!, // sollte immer gegeben sein
      url: resource.url!, // immer gegeben
      ...(!isNaN(lowerBoundNumber) &&
        !isNaN(upperBoundNumber) && {
          range: [lowerBoundNumber, upperBoundNumber],
        }),
      ...(referenceRange.length > 0 && {referenceRange: referenceRange}),
      //...(referenceValue.length > 0 && {referenceValue: referenceValue}),
      ...(scoreHealthCorrelation !== undefined && {
        scoreHealthCorrelation: scoreHealthCorrelation,
      }),
      //code: observationDefinitionCode, // immer gegeben
    },
    issues: issues,
  };
};
