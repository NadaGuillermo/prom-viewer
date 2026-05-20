import type { NormalizedFHIR } from "@utils/fhir";
import type { Mapping } from "./types";
import type { GlobalTypes } from "@customTypes/globalTypes";

export const mapNormalizedObservationDefinitionToPromDataObservationDefinition =
  (
    normalizedObservationDefinition: NormalizedFHIR.ObservationDefinition,
  ): GlobalTypes.Result<Mapping.ObservationDefinition> => {
    const issues: GlobalTypes.DataIssue[] = [];

    return {
      data: {
        id: normalizedObservationDefinition.id,
        url: normalizedObservationDefinition.url,
        ...(normalizedObservationDefinition.range !== undefined && {
          range: normalizedObservationDefinition.range,
        }),
        ...(normalizedObservationDefinition.scoreHealthCorrelation !==
          undefined && {
          scoreHealthCorrelation:
            normalizedObservationDefinition.scoreHealthCorrelation,
        }),
      },
      issues: issues,
    };
  };
