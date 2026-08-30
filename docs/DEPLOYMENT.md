# Deployment

This file describes the setup that is needed to run the app in production.

## Required Infrastructure

The following infrastructure must be provided for running PROM Viewer as a SMART-on-FHIR app:

1. *Configuration server* hosting the configuration files: `proms.json` is compulsary, `dateFormat.json` and `colors.json` are optional.
2. *Resource server* hosting the Questionnaire and ObservationDefinition resources. If none is provided, the app loads them from the [MII Simplifier](https://simplifier.net/mii-erweiterungsmodul-pro-2025).
3. The app has been registered with an EHR  and has received a `clientId`.
4. The *FHIR server* of the EHR provides the patient data, namely the QuestionnaireResponse, Observation and Patient resources in the MII FHIR format.

**Notes:**

- Without a valid `proms.json` file, the app will throw an error.
- All Questionnaire resources should be located on one server, as well as all ObservationDefinition resources. However, it does not need to be the same server.

## Configuration

The variables in the `.env.` file are configured as follows:

```bash
VITE_DATA_SOURCE=smart

VITE_FHIR_QUESTIONNAIRE_BASE_URL=[base url of resource server]
VITE_FHIR_OBSDEF_BASE_URL=[base url of resource server]

VITE_SMART_CLIENT_ID=clientId

VITE_CONFIG_SOURCE=remote

VITE_CONFIG_SERVER_URL=[base url of configuration server]
```

`VITE_SMART_STANDALONE_SERVER_URL` only needs to be populated with the base url of the FHIR server if a SMART standalone launch is required.
However, the preferred way to launch the app is with an EHR launch.
