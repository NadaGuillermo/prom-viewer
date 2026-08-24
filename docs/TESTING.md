# Testing

Unit and integration tests use [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/react), colocated next to the code they test.

```bash
yarn test           # run once
yarn test:watch     # watch mode
yarn test:coverage  # with a coverage report
```

## Stack

- **Runner:** Vitest, configured in `vite.config.ts` (`test`: `environment: "jsdom"`, `globals: true`, `setupFiles: ["./src/test/setup.ts"]`)
- **Component testing:** `@testing-library/react` + `@testing-library/user-event`, with matchers from `@testing-library/jest-dom`
- **API mocking:** a Node-side MSW server (`src/test/mocks/server.ts`) reuses the same fixture-backed handlers as browser dev-mode mocking (`src/mocks/handlers.ts`) — no separate test fixtures to maintain
- **Global setup** (`src/test/setup.ts`): starts/stops the MSW server and resets React Testing Library after each test; also stubs a few things components rely on that don't exist by default in an isolated jsdom render — a `ResizeObserver` polyfill (needed by the ECharts wrapper), a `#portal-root` mount point mirroring `index.html` (needed by `Portal` and the react-tooltip-based components), and the FontAwesome icon registration that normally happens once in `App.tsx` (`library.add(fas)`)

## Conventions

- Prefer `screen.getByRole`/other accessible queries over `getByTestId` (see the [RTL documentation](https://testing-library.com/docs/queries/about/))
- Chart components (`LineChart`, `RadarChart`, `ReactEChartsWrapper`) are smoke-tested only: jsdom has no `<canvas>` 2D context, so `echarts/core`'s `init` is mocked in those test files, and assertions focus on the wrapper's own lifecycle/props (mount/unmount, export button, loading state) rather than actual chart rendering
- Test file naming convention: `Component.test.tsx`, `utils.test.ts`

## Known Coverage Gaps

- Tests focus on utility functions for the data transformations and the React components.
- Therefore, there are no unit tests for the FHIR data-fetching layer (`src/services/fhir`) and the incorporation of the configuration file settings (`src/utils/config`). However, they are indirectly tested via the MSW in the integration test of `App.tsx`.
- Since only a few `Mapping.Questionnaire` fixtures are used in tests, many questionnaire-specific code paths/optional attributes aren't covered (e.g. `isGlobalScore`, `isDomainScore`, `dimension`, `referenceRange`, …)
- Some reshaping functions with complex input parameters difficult to mock in `src/utils/visualization/utils.ts` (e.g. `createTableData`, `extractItemsDataSeries`, `createDomainDimensionsRecord`) are untested
- The interactive calendar widget inside `DateRangePicker` (a `cally` custom element) isn't exercised in tests; only its static button label and Clear-button behavior are
- There are no test assertions for ECharts chart options (see chart smoke-testing note above)

## E2E Tests

For testing the application as a SMART-on-FHIR client, you can use the [**smart-dev-sandbox**](https://github.com/smart-on-fhir/smart-dev-sandbox), a GitHub repository (⚠️Not actively maintained anymore!) that provides a Dockerized version of the official [SMART Health IT sandbox](https://launch.smarthealthit.org/). The advantage is that the local setup allows you to upload and manage your own FHIR resources (the official sandbox is hosted remotely and posting data to the servers is not possible). The sandbox supports simulating both EHR launch and standalone launch scenarios.

If you also would like to fetch the configuration files from a remote source, you can set up a simple static file server (e.g., using [Apache](https://httpd.apache.org/) or [nginx](https://nginx.org/en/)) to host those files. If the application and configuration files are served from different origins, you'll probably need to configure the server for cross-origin resource sharing (see [MDN docs on CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)).
