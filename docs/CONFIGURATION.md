# Configuration

PROM Viewer runs in one of two data modes, toggled via [`.env`](#environment-variables-env): `mock` (default), using local fixtures via Mock Service Worker, or `smart`, fetching live data as a SMART on FHIR app. This doc covers both, plus all environment variables.

## Mocking with MSW

In `mock` mode, the app doesn't hit a real backend. [Mock Service Worker](https://mswjs.io/) (MSW) intercepts the app's `fetch()` calls in the browser and answers them from local fixtures — the app code itself is unaware it's being mocked, since the request/response shape matches what a real FHIR server or config server would produce.

```text
src/mocks/
  fhir/
    data/                     # FHIR fixtures, grouped by resource type
      bundles/
      questionnaires/
      questionnaireResponses/
      observationDefinitions/
      observations/           # empty for now
      patients/
    handlers.ts                # MSW handlers serving GET {BASE_URL}<folder>/:name.json
  config/
    data/                      # proms.json, colors.json, dateFormat.json, ProViewerConfigSchema.json
    handlers.ts                 # MSW handlers serving GET {BASE_URL}config/:name.json
  handlers.ts                   # combines fhir + config handlers
  browser.ts                    # setupWorker(...handlers)
  enableMocking.ts               # starts the worker; called at the top of main.tsx's bootstrap()
```

Each handler answers with the matching fixture's JSON content and a `200`, or a JSON error body with a `404` if no fixture matches — the same shape a real API failure would take, so error-handling code is exercised too.

**Starting/stopping mocking:** controlled per domain by the `.env` switches, not a separate MSW flag:

- `VITE_DATA_SOURCE=mock` (default) enables the FHIR fixture handlers; `VITE_DATA_SOURCE=smart` disables them (the app talks to a real FHIR/SMART server instead).
- `VITE_CONFIG_SOURCE=local` (default) enables the config fixture handlers; `VITE_CONFIG_SOURCE=remote` disables them (config is fetched from `VITE_CONFIG_SERVER_URL` instead).

`enableMocking()` (`src/mocks/enableMocking.ts`) checks both flags at startup and only registers the MSW worker if at least one domain still needs local mocking; this runs in both `yarn dev` and a production build, since mock mode can also be used for a deployed demo.

**Adding new mock data:** drop a new `.json` fixture into the relevant `src/mocks/fhir/data/<folder>/` or `src/mocks/config/data/` directory — handlers pick it up automatically via `import.meta.glob`, no handler code changes needed. To mock a new endpoint/domain entirely, add a new `handlers.ts` (or extend an existing one) and include it in `src/mocks/handlers.ts`.

The MSW browser worker script (`public/mockServiceWorker.js`) is generated infrastructure, not mock data — regenerate it with `yarn msw init public --save` if it's ever missing (e.g. after a clean checkout that doesn't track it, or an MSW version bump).

> **Note:** New mock questionnaire responses, observations, or bundles must also be named in `src/services/fhir/mockFhirDataSource.ts` to appear in the app.

## SMART on FHIR Launch Configuration

SMART on FHIR launch behavior is configured across three places:

| Location | Purpose |
| --- | --- |
| [`.env`](#environment-variables-env) | Selects `mock` vs `smart` data mode and, for `smart` mode, sets the FHIR server base URLs, the SMART client id, and the standalone-launch server url |
| `launch.html` → `src/launch.ts` | Entry point for an **EHR launch**: the app is opened from within an EHR, which supplies the context (`launch` scope) |
| `launch-patient.html` → `src/launch-patient.ts` | Entry point for a **standalone patient launch**: the app is opened directly; the FHIR server is fixed to `VITE_SMART_STANDALONE_SERVER_URL` and a single patient is in context (`launch/patient` scope) |

Both entry points call `FHIR.oauth2.authorize()` (from `fhirclient`) with the same `VITE_SMART_CLIENT_ID`, request scopes for `Patient`, `QuestionnaireResponse`, and `Observation`, then redirect back to `index.html`, which completes the OAuth2 handshake and renders the app (`src/main.tsx`).

Both `launch.html` and `launch-patient.html` are registered as build entries in `vite.config.ts`, so both flows are included in production builds (`yarn build`).

## Environment Variables (`.env`)

Copy or edit the `.env` file at the project root to configure the app. All variables are read at build/dev-server start time (Vite `import.meta.env`).

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_DATA_SOURCE` | `mock` | `mock` reads FHIR data from `src/mocks/` fixtures via MSW; `smart` fetches it via SMART on FHIR from a real server |
| `VITE_FHIR_QUESTIONNAIRE_BASE_URL` | — | Base url of the FHIR server hosting `Questionnaire` resources. Required when `VITE_DATA_SOURCE=smart` |
| `VITE_FHIR_OBSDEF_BASE_URL` | — | Base url of the FHIR server hosting `ObservationDefinition` resources. Required when `VITE_DATA_SOURCE=smart` |
| `VITE_SMART_CLIENT_ID` | — | SMART on FHIR client id used by `launch.html` and `launch-patient.html`. Required when `VITE_DATA_SOURCE=smart` |
| `VITE_SMART_STANDALONE_SERVER_URL` | — | Base url of the FHIR server used for a SMART standalone patient launch (`launch-patient.html`). Required when `VITE_DATA_SOURCE=smart` and the launch URI points to `launch-patient.html` |
| `VITE_CONFIG_SOURCE` | `local` | `local` reads config files (proms, colors, date format) from `src/mocks/config` via MSW; `remote` fetches them from `VITE_CONFIG_SERVER_URL` instead |
| `VITE_CONFIG_SERVER_URL` | — | Base url to fetch config files from when `VITE_CONFIG_SOURCE=remote` |

**Mock mode** (`VITE_DATA_SOURCE=mock`): only `VITE_DATA_SOURCE` and, optionally, the `VITE_CONFIG_*` variables matter — the FHIR/SMART variables are unused.

**Smart mode** (`VITE_DATA_SOURCE=smart`): the `VITE_FHIR_*`, `VITE_SMART_CLIENT_ID`, and (for standalone launch) `VITE_SMART_STANDALONE_SERVER_URL` variables must be set, and the app must be opened via `launch.html` or `launch-patient.html` rather than `index.html` directly so the SMART OAuth2 flow can run.
