import FHIR from "fhirclient";

FHIR.oauth2.authorize({
  clientId: import.meta.env.VITE_SMART_CLIENT_ID,
  // Defines read access for resource types Patient, QuestionnaireResponse and Observation for a single patient
  // Uses smart v2 syntax
  // For meaning of scopes see https://build.fhir.org/ig/HL7/smart-app-launch/scopes-and-launch-context.html
  scope: "patient/Patient.rs patient/QuestionnaireResponse.rs patient/Observation.rs launch online_access openid fhirUser",
  // Derived from BASE_URL so this doesn't silently break if the deployed base path changes.
  redirectUri: `${import.meta.env.BASE_URL}index.html`,
});
