const BUNDLE_NAMES: string[] = [
  "mii-exa-pro-eortc-qlq-c30-bundle",
  "mii-exa-pro-phq-9-bundle",
  // "mii-exa-pro-promis-29-bundle", // Questionnaire fehlt
];

const QUESTIONNAIRE_NAMES: string[] = [
  "mii-qst-pro-euroqol-eq5d5l-collectable",
  "mii-qst-pro-promis-29",
];

const RESPONSE_NAMES: string[] = [
  "mii-exa-pro-euroqol-eq5d5l-response",
  "mii-exa-pro-euroqol-eq5d5l-response copy",
  "mii-exa-pro-euroqol-eq5d5l-response copy 2",
  "mii-exa-pro-euroqol-eq5d5l-response copy 3",
  "mii-exa-pro-promis-29-response",
];

const OBSERVATION_DEFINITION_NAMES: string[] = [
  "fsh-generated-resources-ObservationDefinition-mii-obsdef-pro-score-phq-9",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-ap",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-cf",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-co",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-di",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-dy",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-ef",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-fa",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-fi",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-nv",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-pa",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-pf",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-ql",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-rf",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-sf",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-eortc-qlq-c30-sl",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-score-eq5d5l-index",
  "generated-resources-ObservationDefinition-mii-obsdef-pro-score-eq5d5l-vas",
  "ObservationDefinition-mii-obsdef-pro-promis-29-pain-interference-tscore",
  "ObservationDefinition-mii-obsdef-pro-promis-29-physical-function-tscore",
  "ObservationDefinition-mii-obsdef-pro-promis-29-sleep-disturbance-tscore",
  "ObservationDefinition-mii-obsdef-pro-promis-29-social-function-tscore",
  "resources-ObservationDefinition-mii-obsdef-pro-promis-29-anxiety-tscore",
  "resources-ObservationDefinition-mii-obsdef-pro-promis-29-depression-tscore",
  "resources-ObservationDefinition-mii-obsdef-pro-promis-29-fatigue-tscore",
  "resources-ObservationDefinition-mii-obsdef-pro-promis-29-pain-intensity",
  "resources-ObservationDefinition-mii-obsdef-pro-score-eq5d5l-profile",
];

const OBSERVATION_NAMES: string[] = [];

export async function loadFhirQuestionnaires(): Promise<any[]> {
  const results: any[] = [];
  for (const name of QUESTIONNAIRE_NAMES) {
    const result = await fetch(`/questionnaires/${name}.json`);
    // console.log("Q Fetched", result)
    const questionnaire = await result.json();
    results.push(questionnaire);
  }
  // console.log("Q Results", results)
  return results;
}

export async function loadFhirQuestionnaireResponses(): Promise<any[]> {
  const results: any[] = [];
  for (const name of RESPONSE_NAMES) {
    const result = await fetch(`/responses/${name}.json`);
    const questionnaireResponse = await result.json();
    results.push(questionnaireResponse);
  }
  return results;
}

export async function loadFhirBundles(): Promise<any[]> {
  const results: any[] = [];
  for (const name of BUNDLE_NAMES) {
    const result = await fetch(`/bundles/${name}.json`);
    const bundle = await result.json();
    results.push(bundle);
  }
  return results;
}

export async function loadFhirObservationDefinitions(): Promise<any[]> {
  const results: any[] = [];
  for (const name of OBSERVATION_DEFINITION_NAMES) {
    const result = await fetch(`/observationDefinitions/${name}.json`);
    const observationDefinition = await result.json();
    results.push(observationDefinition);
  }
  return results;
}

export async function loadFhirObservations(): Promise<any[]> {
  const results: any[] = [];
  for (const name of OBSERVATION_NAMES) {
    const result = await fetch(`/observations/${name}.json`);
    const observation = await result.json();
    results.push(observation);
  }
  return results;
}
