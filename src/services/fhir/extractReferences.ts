import { getObservationDefinitionCanonicalUrlFromObservation } from "@utils/fhir/utils";

/**
 * @param responses - raw FHIR QuestionnaireResponse resources
 * @returns deduplicated list of canonical Questionnaire urls referenced by the responses
 * @description Reads QuestionnaireResponse.questionnaire to determine which Questionnaires must be fetched next.
 */
export function extractQuestionnaireCanonicalUrls(responses: any[]): string[] {
  const urls = responses
    .map((response) => response.questionnaire)
    .filter((url): url is string => url !== undefined);
  return [...new Set(urls)];
}

/**
 * @param observations - raw FHIR Observation resources
 * @returns deduplicated list of canonical ObservationDefinition urls referenced by the observations
 * @description Reads the workflow-instantiatesCanonical extension to determine which ObservationDefinitions must be fetched next.
 */
export function extractObservationDefinitionCanonicalUrls(observations: any[]): string[] {
  const urls = observations
    .map((observation) => getObservationDefinitionCanonicalUrlFromObservation(observation))
    .filter((url): url is string => url !== undefined);
  return [...new Set(urls)];
}
