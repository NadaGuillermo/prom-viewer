import type * as NormalizedFHIR from "@utils/normalization";
import type * as Mapping from "./types";
import type * as Errors from "@utils/errors";

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

  return {
    data: {
      id: normalizedObservationDefinition.id,
      url: normalizedObservationDefinition.url,
      range: range,
      scoreHealthCorrelation: scoreHealthCorrelation,
      referenceRange: referenceRange,
    },
    issues: issues,
  };
};
