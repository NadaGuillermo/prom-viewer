import type {
  Observation,
  ObservationDefinition as BaseObservationDefinition,
  Patient,
  Questionnaire,
  QuestionnaireResponse,
} from "fhir/r4";

/**
 * The MII (Medizininformatik-Initiative) ObservationDefinition profile this app
 * targets adds a canonical `url`, which base FHIR R4 doesn't define on
 * ObservationDefinition (only R5 does) - extend the R4 type locally to match.
 */
export type ObservationDefinition = BaseObservationDefinition & { url?: string };

/**
 * Source of raw FHIR resources, abstracting over where/how they are fetched
 * (mock JSON in src/mocks/, served via MSW, or a real SMART on FHIR + open definitions server).
 * Resources are returned as raw FHIR R4 resources; callers normalize them
 * downstream (see src/utils/normalization/normalize*.ts).
 */
export interface FhirDataSource {
  /**
   * @param patientId - id of the patient in the SMART launch context (unused by mock sources)
   * @returns raw FHIR QuestionnaireResponse resources for the patient
   * @description Fetches the patient's QuestionnaireResponse resources.
   */
  fetchPatientQuestionnaireResponses(patientId?: string): Promise<QuestionnaireResponse[]>;

  /**
   * @param patientId - id of the patient in the SMART launch context (unused by mock sources)
   * @returns raw FHIR Observation resources for the patient
   * @description Fetches the patient's Observation resources.
   */
  fetchPatientObservations(patientId?: string): Promise<Observation[]>;

  /**
   * @param urls - canonical Questionnaire urls to resolve
   * @returns raw FHIR Questionnaire resources matching the given urls
   * @description Fetches Questionnaire definitions referenced by canonical url.
   */
  fetchQuestionnairesByUrls(urls: string[]): Promise<Questionnaire[]>;

  /**
   * @param urls - canonical ObservationDefinition urls to resolve
   * @returns raw FHIR ObservationDefinition resources matching the given urls
   * @description Fetches ObservationDefinition definitions referenced by canonical url.
   */
  fetchObservationDefinitionsByUrls(urls: string[]): Promise<ObservationDefinition[]>;

  /**
   * @param patientId - id of the patient in the SMART launch context (unused by mock sources)
   * @returns the raw FHIR Patient resource, or undefined if none could be found
   * @description Fetches the patient resource. Optional: SMART already obtains the patient directly through the launch context, so only sources without such a context (e.g. mock) need to implement this.
   */
  fetchPatient?(patientId?: string): Promise<Patient | undefined>;
}
