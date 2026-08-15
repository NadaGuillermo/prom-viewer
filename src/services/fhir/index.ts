import type Client from "fhirclient/lib/Client";

import type { FhirDataSource } from "./types";
import { MockFhirDataSource } from "./mockFhirDataSource";
import { SmartFhirDataSource } from "./smartFhirDataSource";
import {
  extractQuestionnaireCanonicalUrls,
  extractObservationDefinitionCanonicalUrls,
} from "./extractReferences";

export type { FhirDataSource } from "./types";

/**
 * @param client - a ready fhirclient Client instance, required when VITE_DATA_SOURCE is "smart"
 * @returns the FhirDataSource implementation selected by VITE_DATA_SOURCE (defaults to mock)
 * @description Selects the mock or real SMART on FHIR data source based on the build-time env flag.
 */
export function getFhirDataSource(client?: Client): FhirDataSource {
  if (import.meta.env.VITE_DATA_SOURCE === "smart") {
    if (client === undefined) {
      throw new Error("SmartFhirDataSource requires a ready SMART on FHIR client");
    }
    return new SmartFhirDataSource(client, import.meta.env.VITE_FHIR_QUESTIONNAIRE_BASE_URL, import.meta.env.VITE_FHIR_OBSDEF_BASE_URL);
  }
  return new MockFhirDataSource();
}

/**
 * @param dataSource - the FhirDataSource to load resources from
 * @param patientId - id of the patient to load QuestionnaireResponse/Observation for (unused by mock sources)
 * @returns raw FHIR Questionnaire, QuestionnaireResponse, Observation, ObservationDefinition and (if the source provides one) Patient resources
 * @description Loads patient data first, then resolves referenced Questionnaire/ObservationDefinition definitions by the canonical urls found within it. Patient is fetched from the source only when it implements fetchPatient (SMART obtains it separately through the launch context).
 */
export async function loadFhirData(
  dataSource: FhirDataSource,
  patientId?: string,
): Promise<{
  questionnaires: any[];
  responses: any[];
  observations: any[];
  observationDefinitions: any[];
  patient: any | undefined;
}> {
  const [responses, observations, patient] = await Promise.all([
    dataSource.fetchPatientQuestionnaireResponses(patientId),
    dataSource.fetchPatientObservations(patientId),
    dataSource.fetchPatient?.(patientId),
  ]);

  const questionnaireUrls = extractQuestionnaireCanonicalUrls(responses);
  const observationDefinitionUrls = extractObservationDefinitionCanonicalUrls(observations);

  const [questionnaires, observationDefinitions] = await Promise.all([
    dataSource.fetchQuestionnairesByUrls(questionnaireUrls),
    dataSource.fetchObservationDefinitionsByUrls(observationDefinitionUrls),
  ]);

  return { questionnaires, responses, observations, observationDefinitions, patient };
}
