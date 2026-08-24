import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import * as echartsCore from "echarts/core";

import App from "./App";
import { server } from "./test/mocks/server";

// jsdom has no canvas 2D context; stub echarts so the chart components under
// App mount without crashing. Mirrors ReactEChartsWrapper.test.tsx.
vi.mock("echarts/core", async (importOriginal) => ({
  ...(await importOriginal<typeof echartsCore>()),
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
  })),
}));

const EORTC_QUESTIONNAIRE_NAME =
  "EORTC QLQ-C30 Quality of Life Questionnaire Version 3.0";

// Renders the real App tree against the MSW fixtures in src/mocks/ (mock
// mode is the .env default) and waits past the loading/processing screens.
async function renderApp() {
  render(<App />);
  await waitFor(() => {
    expect(screen.queryByText(/loading|processing/i)).not.toBeInTheDocument();
  });
}

describe("App - happy path (mock mode)", () => {
  it("renders patient info and the configured questionnaires once config + FHIR data have loaded", async () => {
    await renderApp();

    expect(screen.getByText("Kim Musterperson")).toBeInTheDocument();
    // EORTC QLQ-C30 is one of the two questionnaires listed in proms.json.
    expect(
      screen.getByRole("checkbox", { name: EORTC_QUESTIONNAIRE_NAME }),
    ).toBeChecked();
  });
});

describe("App - load failures", () => {
  it("shows the config ErrorPage when the config fetch fails", async () => {
    server.use(
      http.get(`${import.meta.env.BASE_URL}config/proms.json`, () =>
        HttpResponse.json({ error: "boom" }, { status: 500 }),
      ),
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: "Failed to load configuration file",
      }),
    ).toBeInTheDocument();
  });

  it("shows the FHIR ErrorPage when a FHIR fixture fetch fails", async () => {
    // The PHQ-9 bundle is one of the fixtures MockFhirDataSource always
    // loads; forcing a network error on it fails the FHIR Promise.all in
    // loadFhirData, regardless of proms.json not listing PHQ-9 itself.
    server.use(
      http.get(
        `${import.meta.env.BASE_URL}bundles/mii-exa-pro-phq-9-bundle.json`,
        () => HttpResponse.error(),
      ),
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Failed to load FHIR data" }),
    ).toBeInTheDocument();
  });
});

describe("App - filtering", () => {
  it("deselecting a questionnaire updates the active-filter indicator", async () => {
    const user = userEvent.setup();
    await renderApp();

    const checkbox = screen.getByRole("checkbox", {
      name: EORTC_QUESTIONNAIRE_NAME,
    });
    expect(checkbox).toBeChecked();
    expect(screen.getByLabelText("Show filters")).toBeInTheDocument();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(
      screen.getByLabelText("Show filters, some filters are active"),
    ).toBeInTheDocument();
  });
});

describe("App - data issues", () => {
  it("surfaces a warning banner and reveals it via Show Details", async () => {
    const user = userEvent.setup();
    // A Patient fixture missing both name parts trips
    // issueFactories.patient.missingName (level "warning", showUser: true).
    server.use(
      http.get(`${import.meta.env.BASE_URL}patients/kim-musterperson.json`, () =>
        HttpResponse.json({ resourceType: "Patient", id: "kim-musterperson" }),
      ),
    );

    await renderApp();

    expect(
      screen.getByText("Some Questionnaires could not be processed."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show Details" }));

    expect(screen.getByText("Patient has no name.")).toBeInTheDocument();
  });
});
