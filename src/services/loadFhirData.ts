export async function loadFhirQuestionnaire(name: string): Promise<any> {
    const result = await fetch(`public/questionnaires/${name}.json`);
    return result.json();
}

export async function loadFhirQuestionnaireResponse(name: string): Promise<any> {
    const result = await fetch(`public/responses/${name}.json`);
    return result.json();
}

export async function loadFhirBundle(name: string): Promise<any> {
    const result = await fetch(`public/bundles/${name}.json`);
    return result.json();
}

export async function loadFhirObservationDefinition(name: string): Promise<any> {
    const result = await fetch(`public/observationDefinitions/${name}.json`);
    return result.json();
}