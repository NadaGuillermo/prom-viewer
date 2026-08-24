/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "mock" (default) reads FHIR data from src/mocks/ fixtures via MSW; "smart" fetches via SMART on FHIR */
  readonly VITE_DATA_SOURCE?: "mock" | "smart";
  /** base url of the open, unauthenticated FHIR servers hosting Questionnaire and ObservationDefinition */
  readonly VITE_FHIR_QUESTIONNAIRE_BASE_URL: string;
  readonly VITE_FHIR_OBSDEF_BASE_URL: string;
  /** SMART on FHIR client id used by the launch page */
  readonly VITE_SMART_CLIENT_ID: string;
  /** "local" (default) reads config files from src/mocks/ via MSW; "remote" fetches them from VITE_CONFIG_SERVER_URL */
  readonly VITE_CONFIG_SOURCE?: "local" | "remote";
  /** base url to fetch config files from when VITE_CONFIG_SOURCE=remote */
  readonly VITE_CONFIG_SERVER_URL?: string;
  /** Server url for SMART on FHIR standalone launch */
  readonly VITE_SMART_STANDALONE_SERVER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
