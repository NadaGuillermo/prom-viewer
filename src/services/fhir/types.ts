/**
 * Source of raw FHIR resources, abstracting over where/how they are fetched
 * (mock JSON in public/, or a real SMART on FHIR + open definitions server).
 * All resources are returned raw/untyped: FHIR resource shapes are too varied
 * to usefully model as TypeScript types, so callers normalize them downstream
 * (see src/utils/fhir/normalize*.ts).
 */
export interface FhirDataSource {
  /**
   * @param patientId - id of the patient in the SMART launch context (unused by mock sources)
   * @returns raw FHIR QuestionnaireResponse resources for the patient
   * @description Fetches the patient's QuestionnaireResponse resources.
   */
  fetchPatientQuestionnaireResponses(patientId?: string): Promise<any[]>;

  /**
   * @param patientId - id of the patient in the SMART launch context (unused by mock sources)
   * @returns raw FHIR Observation resources for the patient
   * @description Fetches the patient's Observation resources.
   */
  fetchPatientObservations(patientId?: string): Promise<any[]>;

  /**
   * @param urls - canonical Questionnaire urls to resolve
   * @returns raw FHIR Questionnaire resources matching the given urls
   * @description Fetches Questionnaire definitions referenced by canonical url.
   */
  fetchQuestionnairesByUrls(urls: string[]): Promise<any[]>;

  /**
   * @param urls - canonical ObservationDefinition urls to resolve
   * @returns raw FHIR ObservationDefinition resources matching the given urls
   * @description Fetches ObservationDefinition definitions referenced by canonical url.
   */
  fetchObservationDefinitionsByUrls(urls: string[]): Promise<any[]>;

  /**
   * @param patientId - id of the patient in the SMART launch context (unused by mock sources)
   * @returns the raw FHIR Patient resource, or undefined if none could be found
   * @description Fetches the patient resource. Optional: SMART already obtains the patient directly through the launch context, so only sources without such a context (e.g. mock) need to implement this.
   */
  fetchPatient?(patientId?: string): Promise<any | undefined>;
}
