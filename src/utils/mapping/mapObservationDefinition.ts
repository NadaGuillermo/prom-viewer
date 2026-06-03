import type { NormalizedFHIR } from "@utils/fhir";
import type { Mapping } from "./types";
import { type Errors } from "@utils/errors";

export const mapNormalizedObservationDefinitionToPromDataObservationDefinition =
  (
    normalizedObservationDefinition: NormalizedFHIR.ObservationDefinition,
  ): Errors.Result<Mapping.ObservationDefinition> => {
    const issues: Errors.DataIssue[] = [];

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
