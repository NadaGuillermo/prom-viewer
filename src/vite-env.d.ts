/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "mock" (default) reads FHIR data from public/ fixtures; "smart" fetches via SMART on FHIR */
  readonly VITE_DATA_SOURCE?: "mock" | "smart";
  /** base url of the open, unauthenticated FHIR server hosting Questionnaire/ObservationDefinition */
  readonly VITE_FHIR_DEFINITIONS_BASE_URL: string;
  /** SMART on FHIR client id used by the launch page */
  readonly VITE_SMART_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
