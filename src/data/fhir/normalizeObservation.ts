import type { NormalizedFHIR } from "./types";

export const normalizeObservation = (resource: any): NormalizedFHIR.Observation => {

    const observationCode = resource.code?.coding?.find((elem:any) => {
        elem.code !== undefined
    })?.code;

    return {
        id: resource.id, // sollte immer gegeben sein
        code: observationCode, // immer geben
        value: resource.valueQuantity?.value, // optional
    };
}