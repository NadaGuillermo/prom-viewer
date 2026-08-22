import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as echartsCore from "echarts/core";

import { ReactEChartsWrapper } from "@components/ReactEChartsWrapper";
import * as exportUtils from "@utils/export";

// jsdom has no canvas 2D context, so the real echarts.init() cannot render.
// We stub it with a fake chart instance and only assert on the wrapper's own
// behavior (mount/unmount lifecycle, export button, loading state), not on
// chart pixel output.
const fakeChart = {
  setOption: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
};

vi.mock("echarts/core", async (importOriginal) => ({
  ...(await importOriginal<typeof echartsCore>()),
  init: vi.fn(() => fakeChart),
}));

vi.mock("@utils/export", async (importOriginal) => ({
  ...(await importOriginal<typeof exportUtils>()),
  captureAndDownloadElement: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  Object.values(fakeChart).forEach((fn) => fn.mockClear());
});

describe("ReactEChartsWrapper", () => {
  it("initializes the chart and applies the given option", async () => {
    render(<ReactEChartsWrapper chartId="" option={{}} />);

    await waitFor(() => expect(fakeChart.setOption).toHaveBeenCalled());
  });

  it("does not render a download button by default", () => {
    render(<ReactEChartsWrapper chartId="" option={{}} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders a download button when enableExport is true", () => {
    render(<ReactEChartsWrapper chartId="" option={{}} enableExport />);

    expect(
      screen.getByRole("button", { name: "Save as image" }),
    ).toBeInTheDocument();
  });

  it("calls the loading API based on the loading prop", async () => {
    const { rerender } = render(<ReactEChartsWrapper chartId="" option={{}} loading />);

    await waitFor(() => expect(fakeChart.showLoading).toHaveBeenCalled());

    rerender(<ReactEChartsWrapper chartId="" option={{}} loading={false} />);

    await waitFor(() => expect(fakeChart.hideLoading).toHaveBeenCalled());
  });

  it("downloads the container as an image when the export button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ReactEChartsWrapper
        chartId=""
        option={{}}
        enableExport
        exportFileName="my-chart"
      />,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Save as image" }),
      ).toBeEnabled(),
    );

    await user.click(screen.getByRole("button", { name: "Save as image" }));

    expect(exportUtils.captureAndDownloadElement).toHaveBeenCalledTimes(1);
    const [, fileName] = vi.mocked(exportUtils.captureAndDownloadElement).mock
      .calls[0];
    expect(fileName).toMatch(/^my-chart_.+\.png$/);
  });

  it("disposes the chart instance on unmount", () => {
    const { unmount } = render(<ReactEChartsWrapper chartId="" option={{}} />);

    unmount();

    expect(fakeChart.dispose).toHaveBeenCalled();
  });
});
