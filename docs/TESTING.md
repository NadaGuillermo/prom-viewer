# Testing

Unit tests use [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/react), colocated next to the code they test (`Component.test.tsx`, `utils.test.ts`).

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

## Known Coverage Gaps

- Ten domain/dimension/table-reshaping functions in `src/utils/visualization/utils.ts` (e.g. `createTableData`, `extractItemsDataSeries`, `createDomainDimensionsRecord`) are untested — each needs deeply-nested `Mapping.Questionnaire` fixtures with many optional flags (`isGlobalScore`, `isDomainScore`, `dimension`, …)
- The interactive calendar widget inside `DateRangePicker` (a `cally` custom element) isn't exercised — only its static button label and Clear-button behavior are
- ECharts chart-option payloads aren't asserted on (see chart smoke-testing note above)
