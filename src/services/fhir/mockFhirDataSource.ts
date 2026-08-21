import type { FhirDataSource } from "./types";
import { extractResourcesFromBundles, findPatientResource } from "./bundleUtils";

const BUNDLE_NAMES: string[] = [
  "mii-exa-pro-eortc-qlq-c30-bundle-1",
  // "mii-exa-pro-phq-9-bundle",
  // "mii-exa-pro-promis-29-bundle", // Questionnaire fehlt
];

// Standalone Patient fixtures (src/mocks/fhir/data/patients/<name>.json). Empty until such
// a fixture is added; the bundle-contained Patient is picked up regardless.
const PATIENT_NAMES: string[] = [];

const QUESTIONNAIRE_NAMES: string[] = [
  "mii-qst-pro-euroqol-eq5d5l-collectable",
  // "mii-qst-pro-promis-29",
];

const RESPONSE_NAMES: string[] = [
  "mii-exa-pro-euroqol-eq5d5l-response-1",
  "mii-exa-pro-euroqol-eq5d5l-response-2",
  "mii-exa-pro-euroqol-eq5d5l-response-3",
  "mii-exa-pro-euroqol-eq5d5l-response-4",
  "mii-exa-pro-euroqol-eq5d5l-response-5",
  "mii-exa-pro-euroqol-eq5d5l-response-6",
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

async function fetchMockResourcesByName(
  folder: string,
  names: string[],
): Promise<any[]> {
  const results: any[] = [];
  for (const name of names) {
    const result = await fetch(`${import.meta.env.BASE_URL}${folder}/${name}.json`);
    results.push(await result.json());
  }
  return results;
}

/**
 * Loads FHIR resources from the mock JSON fixtures in src/mocks/fhir/data/,
 * served via MSW request handlers instead of a real FHIR server. Questionnaire/ObservationDefinition are still resolved by
 * matching each fixture's own `url` field against the requested canonical
 * urls, so the mock exercises the same reference-driven filtering as
 * SmartFhirDataSource, just against a fixed, pre-loaded catalog.
 */
export class MockFhirDataSource implements FhirDataSource {
  async fetchPatientQuestionnaireResponses(): Promise<any[]> {
    const responses = await fetchMockResourcesByName("questionnaireResponses", RESPONSE_NAMES);
    const bundles = await fetchMockResourcesByName("bundles", BUNDLE_NAMES);
    const bundleResponses = extractResourcesFromBundles(bundles, "QuestionnaireResponse");
    return [...responses, ...bundleResponses];
  }

  async fetchPatientObservations(): Promise<any[]> {
    const observations = await fetchMockResourcesByName("observations", OBSERVATION_NAMES);
    const bundles = await fetchMockResourcesByName("bundles", BUNDLE_NAMES);
    const bundleObservations = extractResourcesFromBundles(bundles, "Observation");
    return [...observations, ...bundleObservations];
  }

  async fetchQuestionnairesByUrls(urls: string[]): Promise<any[]> {
    const questionnaires = await fetchMockResourcesByName("questionnaires", QUESTIONNAIRE_NAMES);
    const bundles = await fetchMockResourcesByName("bundles", BUNDLE_NAMES);
    const bundleQuestionnaires = extractResourcesFromBundles(bundles, "Questionnaire");
    return [...questionnaires, ...bundleQuestionnaires].filter((questionnaire) =>
      urls.includes(questionnaire.url),
    );
  }

  async fetchObservationDefinitionsByUrls(urls: string[]): Promise<any[]> {
    const observationDefinitions = await fetchMockResourcesByName(
      "observationDefinitions",
      OBSERVATION_DEFINITION_NAMES,
    );
    return observationDefinitions.filter((observationDefinition) =>
      urls.includes(observationDefinition.url),
    );
  }

  /**
   * @returns the raw FHIR Patient resource found among the mock fixtures, or undefined
   * @description Looks for a standalone Patient fixture first, then falls back to any Patient contained in the mock bundles. Returns undefined if none is found.
   */
  async fetchPatient(): Promise<any | undefined> {
    const patients = await fetchMockResourcesByName("patients", PATIENT_NAMES);
    const bundles = await fetchMockResourcesByName("bundles", BUNDLE_NAMES);
    for (const candidate of [...patients, ...bundles]) {
      const patient = findPatientResource(candidate);
      if (patient !== undefined) {
        return patient;
      }
    }
    return undefined;
  }
}
