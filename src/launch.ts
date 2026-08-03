import FHIR from "fhirclient";

FHIR.oauth2.authorize({
  clientId: import.meta.env.VITE_SMART_CLIENT_ID || "http://launch.smarthealthit.org",
  // Scoped to exactly the resource types the app fetches (see src/services/fhir),
  // rather than blanket patient/*.read.
  scope: "launch openid fhirUser patient/QuestionnaireResponse.read patient/Observation.read",
  // Derived from BASE_URL so this doesn't silently break if the deployed base path changes.
  redirectUri: `${import.meta.env.BASE_URL}index.html`,
});
