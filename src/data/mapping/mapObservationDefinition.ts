import type { NormalizedFHIR } from "@data/fhir";
import type { PromData } from "@data/mapping/types";
import type { Mapping } from "@data/globalTypes";

export const mapNormalizedObservationDefinitionToPromDataObservationDefinition = (normalizedObservationDefinition: NormalizedFHIR.ObservationDefinition): Mapping.Result<PromData.ObservationDefinition> => {
return {
    data: {
        id: normalizedObservationDefinition.id,
        range: normalizedObservationDefinition.range,
        scoreHealthCorrelation: normalizedObservationDefinition.scoreHealthCorrelation,
    },
    issues: [],
}
}