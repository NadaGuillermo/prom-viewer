import type { ObservationDefinition } from "@services/fhir/types";
import type * as NormalizedFHIR from "./types";
import type * as Errors from "@utils/errors";

export const normalizeObservationDefinition = (
  resource: ObservationDefinition,
): Errors.Result<NormalizedFHIR.ObservationDefinition> => {
  const issues: Errors.DataIssue[] = [];

  const observationRange = resource.qualifiedInterval?.find((interval) => interval.category !== undefined && interval.category === "absolute")?.range;
  const lowerBoundary = observationRange?.low?.value;
  const upperBoundary = observationRange?.high?.value;
  const range = lowerBoundary !== undefined && upperBoundary !== undefined ? [lowerBoundary, upperBoundary] as [number, number] : undefined;
  // const lowerBoundNumber = Number(lowerBoundary);
  // const upperBoundNumber = Number(upperBoundary);
  const scoreHealthCorrelation: string | undefined = observationRange?.extension
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
      if (range[0] !== undefined && range[1] !== undefined) {
        referenceRange.push({range: [range[0], range[1]], context: context});
      } else {
        if (range[0] !== undefined) {
          referenceRange.push({range: range[0], context: context});
        }
        if (range[1] !== undefined) {
          referenceRange.push({range: range[1], context: context});
        }
      }
    })
  }

  return {
    data: {
      id: resource.id!, // sollte immer gegeben sein
      url: resource.url!, // immer gegeben
      range: range,
      referenceRange: referenceRange.length > 0 ? referenceRange : undefined,
      //...(referenceValue.length > 0 && {referenceValue: referenceValue}),
      scoreHealthCorrelation: scoreHealthCorrelation,
      //code: observationDefinitionCode, // immer gegeben
    },
    issues: issues,
  };
};
