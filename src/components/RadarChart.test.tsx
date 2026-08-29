import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import * as echartsCore from "echarts/core";

import RadarChart from "@components/RadarChart";
import type * as Visualization from "@utils/visualization";

// jsdom cannot render into <canvas>, so echarts.init is stubbed (see
// ReactEChartsWrapper.test.tsx). These are smoke tests: they verify
// RadarChart mounts without throwing and correctly renders nothing when
// there is no data for the selected date, not the rendered chart pixels.
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

const series = (
  overrides: Partial<Visualization.DataSeries>,
): Visualization.DataSeries => ({
  id: "row-1",
  name: "PHQ-9 Total",
  shortName: "PHQ9",
  data: [0.5, null],
  originalData: [10, null],
  dataLabels: [],
  seriesType: "score",
  questionnaireId: "q1",
  questionnaireName: "PHQ-9",
  ...overrides,
});

const dates = ["2024-01-01", "2024-02-01"];

describe("RadarChart", () => {
  it("renders without throwing when data exists for the selected date", () => {
    const data = { "Physical Function": [series({})] };

    expect(() =>
      render(<RadarChart id="r-1" data={data} dates={dates} date="2024-01-01" />),
    ).not.toThrow();
  });

  it("renders nothing when every domain is null for the selected date", () => {
    const data = { "Physical Function": [series({})] };

    const { container } = render(
      <RadarChart id="r-2" data={data} dates={dates} date="2024-02-01" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the selected date is not in dates", () => {
    const data = { "Physical Function": [series({})] };

    const { container } = render(
      <RadarChart id="r-3" data={data} dates={dates} date="2099-01-01" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for empty data", () => {
    const { container } = render(
      <RadarChart id="r-3" data={{}} dates={dates} date="2024-01-01" />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
