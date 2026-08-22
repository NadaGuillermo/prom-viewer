import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useContext } from "react";

import LineChartGroup from "@components/LineChartGroup";
import { ShowReferenceValuesContext } from "@components/ShowReferenceValuesContext";
import * as exportUtils from "@utils/export";

vi.mock("@utils/export", async (importOriginal) => ({
  ...(await importOriginal<typeof exportUtils>()),
  captureAndDownloadElement: vi.fn().mockResolvedValue(undefined),
}));

const ContextReader = () => {
  const showReferenceValues = useContext(ShowReferenceValuesContext);
  return <div>context value: {String(showReferenceValues)}</div>;
};

describe("LineChartGroup", () => {
  it("renders its children", () => {
    render(
      <LineChartGroup name="Chart group" id="chart-group-1">
        <div>chart content</div>
      </LineChartGroup>,
    );

    expect(screen.getByText("chart content")).toBeInTheDocument();
  });

  it("does not render the reference values toggle by default", () => {
    render(
      <LineChartGroup name="Chart group" id="chart-group-2">
        <div>chart content</div>
      </LineChartGroup>,
    );

    expect(
      screen.queryByText("Show reference values"),
    ).not.toBeInTheDocument();
  });

  it("renders the reference values toggle when hasReferenceValues is true", () => {
    render(
      <LineChartGroup name="Chart group" id="chart-group-3" hasReferenceValues>
        <div>chart content</div>
      </LineChartGroup>,
    );

    expect(screen.getByText("Show reference values")).toBeInTheDocument();
  });

  it("toggling the reference values checkbox updates the shared context", async () => {
    const user = userEvent.setup();
    render(
      <LineChartGroup name="Chart group" id="chart-group-4" hasReferenceValues>
        <ContextReader />
      </LineChartGroup>,
    );

    expect(screen.getByText("context value: false")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox"));

    expect(screen.getByText("context value: true")).toBeInTheDocument();
  });

  it("enables the download button only after the group has settled, then downloads on click", async () => {
    const user = userEvent.setup();
    render(
      <LineChartGroup name="Chart group" id="chart-group-5">
        <div>chart content</div>
      </LineChartGroup>,
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Save as image" })).toBeEnabled(),
    );

    await user.click(screen.getByRole("button", { name: "Save as image" }));

    expect(exportUtils.captureAndDownloadElement).toHaveBeenCalledTimes(1);
    const [, fileName] = vi.mocked(exportUtils.captureAndDownloadElement).mock
      .calls[0];
    expect(fileName).toMatch(/^chart-group_.+\.png$/);
  });
});
