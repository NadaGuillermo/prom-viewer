import type { NormalizedFHIR } from "./types";
import type { Mapping } from "@data/globalTypes";
import { getQuestionnaireResponseIdFromObservationReferenceAttribute } from "./utils";

export const normalizeObservation = (resource: any): Mapping.Result<NormalizedFHIR.Observation> => {
    const issues: Mapping.DataIssue[] = []

    const questionnaireResponse = getQuestionnaireResponseIdFromObservationReferenceAttribute(resource);
    // TODO wie wirklich aussieht
    const observationDefinition = resource.extension?.find((ext: any) => ext.instantiatsCanonical !== undefined)?.instantiatesCanonical; // url
    // const observationText = resource.code?.coding?.find((cod: any) => cod.display !== undefined && cod.code !== undefined)?.display;
    const observationValue = resource.valueQuantity ? resource.valueQuantity.value : null;

    if (questionnaireResponse === undefined || observationDefinition === undefined) {
        issues.push({
            id: `issue-observation-${resource.id}-${Math.random().toString(36).substring(2, 9)}`,
            level: 'error',
            message: `Observation with id ${resource.id} does not reference any ${questionnaireResponse === undefined ? "QuestionnaireResponse" : ""} 
                ${questionnaireResponse === undefined && observationDefinition !== undefined ? "and" : ""} 
                ${observationDefinition === undefined ? "ObservationDefinition" : ""} and will therefore be omitted.}`,
        });
    }

    return {
        data: {
        id: resource.id, // sollte immer gegeben sein
        questionnaireResponse: questionnaireResponse, // id or undefined
        observationDefinition: observationDefinition, // id or undefined
        // code: observationCode, // immer geben
        value: observationValue, // optional
        },
        issues,
    };
}