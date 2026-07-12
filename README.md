# PROM Viewer

> ⚠️ **Work in progress.** This README reflects the current state of development only. Sections may be incomplete or change as the project evolves.

## Description / Overview

PROM Viewer is a React + TypeScript web application for visualizing patient-reported outcome measures (PROMs) from FHIR data. It is built for clinicians who need to review questionnaire responses (FHIR `Questionnaire`, `QuestionnaireResponse`, `Observation`, `ObservationDefinition`) for a patient in a clear, chart-based interface.

Currently, the app does not connect to a real FHIR server. It runs against mock FHIR resources and configuration files served as static JSON from the `public/` folder.

## Demo

🔗 <a href="https://nadaguillermo.github.io/prom-viewer/" target="_blank"> PROM Viewer Demo </a>

<!-- Screenshot placeholder -->
<!--![Screenshot placeholder](docs/screenshot-placeholder.png)-->

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
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

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `yarn dev`       | Start the dev server with hot reload |
| `yarn build`     | Type-check and build for production  |
| `yarn preview`   | Preview the production build locally |
| `yarn lint`      | Lint the codebase                    |
| `yarn lint:fix`  | Lint and auto-fix issues             |
| `yarn format`    | Format code with Prettier            |
| `yarn typecheck` | Run TypeScript type checking         |

<!-- Screenshot placeholder -->
![Screenshot placeholder](docs/screenshot-placeholder.png)

## Features

- Visualizes FHIR questionnaire responses (mock data for now)
- Charting via ECharts
- Export charts as PNG and table data as CSV
- Date range filtering
- Configurable colors and date formats via config files

More features are planned as the project develops.

## Tech Stack / Built With

- **Language:** TypeScript
- **Framework:** React 19
- **Build tool:** Vite
- **Styling:** Tailwind CSS, daisyUI
- **Charting:** ECharts
- **Package manager:** Yarn
- **Other libraries:** FontAwesome, react-tooltip, html-to-image, lodash

## License

Not specified yet. The project is intended to be released as open-source, with usage open to everyone.
