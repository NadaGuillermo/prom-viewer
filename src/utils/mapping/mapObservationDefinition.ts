import type { NormalizedFHIR } from "@utils/normalization";
import type { Mapping } from "./types";
import { type Errors } from "@utils/errors";

export const mapObservationDefinition = (
  normalizedObservationDefinition: NormalizedFHIR.ObservationDefinition,
): Errors.Result<Mapping.ObservationDefinition> => {
  const issues: Errors.DataIssue[] = [];

  const range = normalizedObservationDefinition.range;
  const scoreHealthCorrelation =
    normalizedObservationDefinition.scoreHealthCorrelation;
  const referenceRange: Mapping.ReferenceRange[] | undefined =
    normalizedObservationDefinition.referenceRange?.map((range) => {
      return {
        range: range.range,
        name: range.context ?? "Reference Value",
      };
    });

  //?.filter((range) => Array.isArray(range.range));
  // const referenceValue = normalizedObservationDefinition.referenceRange?.filter((range) => typeof range.range === "number");

  return {
    data: {
      id: normalizedObservationDefinition.id,
      url: normalizedObservationDefinition.url,
      range: range,
      scoreHealthCorrelation: scoreHealthCorrelation,
      referenceRange: referenceRange,
      // ...(referenceValue && {referenceValue: referenceValue}),
    },
    issues: issues,
  };
};
