import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import * as echartsCore from "echarts/core";

import LineChart from "@components/LineChart";
import { ITEM_TYPES } from "@utils/mapping";
import type { Visualization } from "@utils/visualization";

// jsdom cannot render into <canvas>, so echarts.init is stubbed (see
// ReactEChartsWrapper.test.tsx). These are smoke tests: they verify LineChart
// mounts/unmounts without throwing for representative data shapes, not the
// rendered chart pixels.
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

const chartData: Visualization.ChartData = {
  xData: ["2024-01-01", "2024-02-01"],
  yData: [
    {
      id: "row-1",
      name: "PHQ-9 Total",
      shortName: "PHQ9",
      data: [0.5, 0.7],
      originalData: [10, 14],
      dataLabels: [],
      seriesType: ITEM_TYPES.score as Visualization.ItemType,
      questionnaireId: "q1",
      questionnaireName: "PHQ-9",
    },
  ],
};

describe("LineChart", () => {
  it("renders without throwing for typical chart data", () => {
    expect(() => render(<LineChart data={chartData} />)).not.toThrow();
  });

  it("renders without throwing when there is no data", () => {
    const emptyData: Visualization.ChartData = { xData: [], yData: [] };

    expect(() => render(<LineChart data={emptyData} />)).not.toThrow();
  });
});
