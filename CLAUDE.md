# CLAUDE.md

This file gives Claude Code context about this project. Keep it updated as the project evolves.

## Project Overview

This is a React + TypeScript application using Tailwind CSS. In production, it is supposed to fetch FHIR data on a patient level (Questionnaire, QuestionnaireResponse, Observation, ObservationDefinition) and visualizes the questionnaire responses. The app supports two modes, `mock`and `smart`, specified in `.env`: either mock data in JSON format is fetched from `src/mocks/`, served by MSW (Mock Service Worker) intercepting the app's own `fetch()` calls, or the app launches as a SMART on Fhir app and fetches the resources from a server. Besides FHIR data, configuration files are fetched the same way (currently `src/mocks/config/data/`, served by MSW). In production, the app is supposed to be launched as a SMART on Fhir app rather than a stand-alone web application. It is intended to be used by clinicians.

## Mocking (MSW)

Mock mode does not read static files from `public/` anymore — `src/mocks/` holds the fixtures and the MSW request handlers that serve them, so mocking behaves like a real (if fake) backend rather than a static file server. See the [README's Mocking with MSW section](README.md#mocking-with-msw) for the full folder layout, how the `VITE_DATA_SOURCE`/`VITE_CONFIG_SOURCE` env vars gate which handlers get registered, and how to add new fixtures/handlers. In short: add a `.json` file under the matching `src/mocks/fhir/data/<resource>/` or `src/mocks/config/data/` folder — handlers discover new fixtures automatically via `import.meta.glob`, no handler code changes needed for a new fixture in an existing folder.

## Configuration Files

Mock config is fetched from `src/mocks/config/data/`, served via MSW, alongside FHIR data:

- **proms config** — metadata per questionnaire
- **color config** — colors
- **dateformat config** — date format

## Tech Stack

- **Language:** TypeScript
- **Framework:** React
- **Package manager:** yarn
- **Build tool:** Vite
- **Styling:** Tailwind
- **State management:** React Hooks

## Project Structure

```text
src/
  assets/       # empty folder
  components/   # Reusable UI components
  layouts/      # empty folder
  mocks/        # MSW mock fixtures and request handlers (mock mode only)
  services/     # Functions to fetch FHIR data and configuration files
  styles/       # empty folder
  types/        # Shared TypeScript types
  utils/        # Helper functions
```

## Commands

- Install dependencies: `yarn`
- Start dev server: `yarn dev`
- Build for production: `yarn build`
- Run tests: *(not set up yet)*
- Lint: `yarn lint`
- Lint fix: `yarn lint:fix`
- Format: `yarn format`
- Preview: `yarn preview`
- Type check: `yarn typecheck`

## Code Style & Conventions

- Prefer functional components with hooks over class components
- Use TypeScript types/interfaces for all props and function signatures
- Prefer React useState over external libraries for state management
- Use PascalCase naming for components and camelCase for TypeScript files
- Helper functions in the utils/ folder are grouped by their purpose. If you need to create new helper functions, check if they fall under one of the existing categories. If so, add it there. If not, create a subfolder with an index.ts file where all functions are exported and if necessary a types.d.ts file with type definitions.

## Testing

No test setup yet. When adding one, note the framework here (e.g. Vitest, Jest + React Testing Library) and how to run a single test file.

## Chart Library Instructions

The project uses Apache ECharts. Chart Components need to be manually registered in `ReactEChartsWrapper`. When using a component, check if it is already registered there. If not, do so.

## Things to Avoid

- Never log or hardcode real patient data; use synthetic FHIR resources in examples.
