import type Client from "fhirclient/lib/Client";
import type { Bundle, Observation, Questionnaire, QuestionnaireResponse } from "fhir/r4";

import type { FhirDataSource, ObservationDefinition } from "./types";
import { extractResourcesFromBundle } from "./bundleUtils";

async function fetchDefinitionByUrl<T extends Questionnaire | ObservationDefinition>(
  definitionsBaseUrl: string,
  resourceType: T["resourceType"],
  canonicalUrl: string,
): Promise<T[]> {
  const searchUrl = `${definitionsBaseUrl}/${resourceType}?url=${encodeURIComponent(canonicalUrl)}`;
  const response = await fetch(searchUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const bundle: Bundle = await response.json();
  return extractResourcesFromBundle<T>(bundle, resourceType);
}

async function fetchDefinitionsByUrls<T extends Questionnaire | ObservationDefinition>(
  definitionsBaseUrl: string,
  resourceType: T["resourceType"],
  canonicalUrls: string[],
): Promise<T[]> {
  const results = await Promise.all(
    canonicalUrls.map((url) =>
      fetchDefinitionByUrl<T>(definitionsBaseUrl, resourceType, url),
    ),
  );
  return results.flat();
}

/**
 * Loads patient data (QuestionnaireResponse, Observation) through a SMART on
 * FHIR client, patient-scoped and authenticated. Questionnaire and
 * ObservationDefinition are canonical definitions, resolved by url against a
 * separate, fixed, unauthenticated definitions server - they are never
 * fetched wholesale, only by reference extracted from the patient data.
 */
export class SmartFhirDataSource implements FhirDataSource {
  private readonly client: Client;
  private readonly questionnaireBaseUrl: string;
  private readonly observationDefinitionBaseUrl: string;

  constructor(client: Client, questionnaireBaseUrl: string, obsdefBaseUrl: string) {
    this.client = client;
    this.questionnaireBaseUrl = questionnaireBaseUrl;
    this.observationDefinitionBaseUrl = obsdefBaseUrl;
  }

  async fetchPatientQuestionnaireResponses(): Promise<QuestionnaireResponse[]> {
    return this.client.patient.request("QuestionnaireResponse", {
      pageLimit: 0,
      flat: true,
    });
  }

  async fetchPatientObservations(): Promise<Observation[]> {
    return this.client.patient.request("Observation", {
      pageLimit: 0,
      flat: true,
    });
  }

  async fetchQuestionnairesByUrls(urls: string[]): Promise<Questionnaire[]> {
    return fetchDefinitionsByUrls<Questionnaire>(this.questionnaireBaseUrl, "Questionnaire", urls);
  }

  async fetchObservationDefinitionsByUrls(urls: string[]): Promise<ObservationDefinition[]> {
    return fetchDefinitionsByUrls<ObservationDefinition>(this.observationDefinitionBaseUrl, "ObservationDefinition", urls);
  }
}
