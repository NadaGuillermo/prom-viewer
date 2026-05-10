import type { NormalizedFHIR } from "@data/fhir";
import type { PromData } from "@data/mapping/types";
import type { Mapping } from "@data/globalTypes";

export const mapNormalizedObservationDefinitionToPromDataObservationDefinition = (normalizedObservationDefinition: NormalizedFHIR.ObservationDefinition): Mapping.Result<PromData.ObservationDefinition> => {
    const issues: Mapping.DataIssue[] = [];

    return {
    data: {
        id: normalizedObservationDefinition.id,
        url: normalizedObservationDefinition.url,
        ...(normalizedObservationDefinition.range !== undefined && { range: normalizedObservationDefinition.range }),
        ...(normalizedObservationDefinition.scoreHealthCorrelation !== undefined && { scoreHealthCorrelation: normalizedObservationDefinition.scoreHealthCorrelation}),
    },
    issues: issues,
}
}