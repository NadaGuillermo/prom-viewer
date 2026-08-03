import type Client from "fhirclient/lib/Client";

import type { FhirDataSource } from "./types";
import { extractResourcesFromBundle } from "./bundleUtils";

async function fetchDefinitionByUrl(
  definitionsBaseUrl: string,
  resourceType: "Questionnaire" | "ObservationDefinition",
  canonicalUrl: string,
): Promise<any[]> {
  const searchUrl = `${definitionsBaseUrl}/${resourceType}?url=${encodeURIComponent(canonicalUrl)}`;
  const response = await fetch(searchUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const bundle = await response.json();
  return extractResourcesFromBundle(bundle, resourceType);
}

async function fetchDefinitionsByUrls(
  definitionsBaseUrl: string,
  resourceType: "Questionnaire" | "ObservationDefinition",
  canonicalUrls: string[],
): Promise<any[]> {
  const results = await Promise.all(
    canonicalUrls.map((url) =>
      fetchDefinitionByUrl(definitionsBaseUrl, resourceType, url),
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
  private readonly definitionsBaseUrl: string;

  constructor(client: Client, definitionsBaseUrl: string) {
    this.client = client;
    this.definitionsBaseUrl = definitionsBaseUrl;
  }

  async fetchPatientQuestionnaireResponses(): Promise<any[]> {
    return this.client.patient.request("QuestionnaireResponse", {
      pageLimit: 0,
      flat: true,
    });
  }

  async fetchPatientObservations(): Promise<any[]> {
    return this.client.patient.request("Observation", {
      pageLimit: 0,
      flat: true,
    });
  }

  async fetchQuestionnairesByUrls(urls: string[]): Promise<any[]> {
    return fetchDefinitionsByUrls(this.definitionsBaseUrl, "Questionnaire", urls);
  }

  async fetchObservationDefinitionsByUrls(urls: string[]): Promise<any[]> {
    return fetchDefinitionsByUrls(this.definitionsBaseUrl, "ObservationDefinition", urls);
  }
}
