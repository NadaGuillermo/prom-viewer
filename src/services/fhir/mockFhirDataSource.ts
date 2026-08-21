import type { FhirDataSource } from "./types";
import { extractResourcesFromBundles, findPatientResource } from "./bundleUtils";

/**
 * @param modules - result of import.meta.glob() over a fixture folder; only its keys are used
 * @returns the bare file names (without extension) present in that folder
 * @description Shared discovery step for resolveFixtureNames: turns glob keys into fixture names.
 */
function namesFromGlob(modules: Record<string, unknown>): string[] {
  return Object.keys(modules).map((path) => (path.split("/").pop() ?? path).replace(/\.json$/, ""));
}

/**
 * @param modules - result of import.meta.glob() over a fixture folder
 * @param curated - optional allow-list of names to load; omit to load every fixture found on disk
 * @returns the file names (without extension) to load for this folder
 * @description Single discovery strategy for both curated and auto-discovered folders. Metadata
 * fixtures (Patient, Questionnaire, ObservationDefinition) pass no curated list, so every fixture
 * found is loaded. Patient-data fixtures (bundles, responses, observations) pass a curated list so
 * the programmer decides which ones are displayed; entries no longer present on disk are dropped.
 */
function resolveFixtureNames(modules: Record<string, unknown>, curated?: string[]): string[] {
  const discovered = namesFromGlob(modules);
  if (curated === undefined) {
    return discovered;
  }
  const available = new Set(discovered);
  return curated.filter((name) => available.has(name));
}

const BUNDLE_NAMES: string[] = resolveFixtureNames(
  import.meta.glob("../../mocks/fhir/data/bundles/*.json"),
  [
    "mii-exa-pro-eortc-qlq-c30-bundle",
    "mii-exa-pro-phq-9-bundle",
    // "mii-exa-pro-promis-29-bundle",
  ],
);

const RESPONSE_NAMES: string[] = resolveFixtureNames(
  import.meta.glob("../../mocks/fhir/data/questionnaireResponses/*.json"),
  [
    "mii-exa-pro-euroqol-eq5d5l-response-1",
    "mii-exa-pro-euroqol-eq5d5l-response-2",
    "mii-exa-pro-euroqol-eq5d5l-response-3",
    "mii-exa-pro-euroqol-eq5d5l-response-4",
    "mii-exa-pro-euroqol-eq5d5l-response-5",
    "mii-exa-pro-euroqol-eq5d5l-response-6",
    // "mii-exa-pro-promis-29-response",
  ],
);

const OBSERVATION_NAMES: string[] = resolveFixtureNames(
  import.meta.glob("../../mocks/fhir/data/observations/*.json"),
  [], // none loaded standalone; only extracted from bundles
);

const PATIENT_NAMES: string[] = resolveFixtureNames(
  import.meta.glob("../../mocks/fhir/data/patients/*.json"),
);

const QUESTIONNAIRE_NAMES: string[] = resolveFixtureNames(
  import.meta.glob("../../mocks/fhir/data/questionnaires/*.json"),
);

const OBSERVATION_DEFINITION_NAMES: string[] = resolveFixtureNames(
  import.meta.glob("../../mocks/fhir/data/observationDefinitions/*.json"),
);


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
