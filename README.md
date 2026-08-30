# PROM Viewer

> ⚠️ **Work in progress.** This README reflects the current state of development only. Sections may be incomplete or change as the project evolves.

## Description / Overview

PROM Viewer is a React + TypeScript web application for visualizing patient-reported outcome measures (PROMs) from FHIR data. It's built for clinicians who need to review questionnaire responses for a patient in a clear, chart-based interface.

The app supports two data modes, toggled via `.env`: `mock` (default), which runs against mock FHIR resources served through Mock Service Worker, and `smart`, which launches the app as a SMART on FHIR application and fetches real patient data from a FHIR server. See [Configuration](docs/CONFIGURATION.md) for details on both modes.

## Demo

A demo showing the current state of the app (mock data with no clinical meaning):
🔗 [PROM Viewer Demo](https://nadaguillermo.github.io/prom-viewer/)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/NadaGuillermo/prom-viewer.git
   cd prom-viewer
   ```

2. Install dependencies (this project uses Yarn):

   ```bash
   yarn
   ```

## Usage

Start the development server:

```bash
yarn dev
```

Other available commands:

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `yarn dev`            | Start the dev server with hot reload |
| `yarn build`          | Type-check and build for production  |
| `yarn preview`        | Preview the production build locally |
| `yarn lint`           | Lint the codebase                    |
| `yarn lint:fix`       | Lint and auto-fix issues             |
| `yarn format`         | Format code with Prettier            |
| `yarn typecheck`      | Run TypeScript type checking         |
| `yarn test`           | Run the test suite once              |
| `yarn test:watch`     | Run tests in watch mode              |
| `yarn test:coverage`  | Run tests with a coverage report     |

If `yarn dev` started successfully, the console output should look similar to this:

![Dev server start successful](docs/images/dev-server-start.png)

## Configuration

The app runs in `mock` mode by default (no backend needed) or as a `smart` SMART on FHIR app against a real server, toggled via `.env`. Covers MSW mocking, SMART on FHIR launch setup, and all environment variables.

📄 See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for full details.

## Testing

Unit tests use Vitest with React Testing Library, colocated next to the code they test.

```bash
yarn test           # run once
yarn test:watch     # watch mode
yarn test:coverage  # with a coverage report
```

📄 See [docs/TESTING.md](docs/TESTING.md) for stack details, conventions, and known coverage gaps.

## Error Handling

Every normalization and mapping functions returns an (possibly empty) error object. They are bundled and logged to the error console.

📄 See [docs/ERROR_HANDLING.md](docs/ERROR_HANDLING.md) for details.

## Deployment

The app should be deployed as a SMART-on-FHIR app. Environment variables in `.env` must be configured accordingly.

📄 See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for how to set up the app for deployment.

## FHIR Profiles

The FHIR profiles used are `Patient`,  `Questionnaire`, `QuestionnaireResponse`, `Observation`, `ObservationDefinition` as defined by [MII Erweiterungsmodul PRO (2026+)](https://simplifier.net/MII-Erweiterungsmodul-PRO-2025/~introduction). For type checking, the app uses the FHIR R4 types from [Definitely Typed](https://definitelytyped.org/).

Since those profiles are actively developed and haven't matured over a longer time, there are some contraints that come with their usage.

📄 For a list of current issues that affect the app, see [docs/FHIR_CONSTRAINTS.md](docs/FHIR_CONSTRAINTS.md).

## Features

- Visualizes FHIR questionnaire responses
- Domain-centered approach: questionnaire scores are grouped into domains to facilitate better cross-questionnaire comparability
- View responses of multiple different questionnaires simultaneously
- Export charts as PNG and table data as CSV
- Date and questionnaire filtering
- Display reference values in charts
- Configurable colors and date formats via config files
- Runs against mock JSON data or as a SMART on FHIR app (EHR launch or standalone patient launch), toggled via `.env`

## Tech Stack / Built With

- **Language:** TypeScript
- **Framework:** React 19
- **Build tool:** Vite
- **Styling:** Tailwind CSS, daisyUI
- **Charting:** ECharts
- **Package manager:** Yarn
- **Testing:** Vitest, React Testing Library
- **Mocking:** Mock Service Worker (MSW)
- **Other libraries:** FontAwesome, react-tooltip, html-to-image, lodash-es, fhirclient

## License

Not specified yet. The project is intended to be released as open-source, with usage open to everyone.
