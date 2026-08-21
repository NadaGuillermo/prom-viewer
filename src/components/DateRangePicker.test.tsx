import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DateRangePicker from "@components/DateRangePicker";

describe("DateRangePicker", () => {
  it("shows a placeholder when no range is selected", () => {
    render(
      <DateRangePicker
        rangeHandler={vi.fn()}
        dateValue=""
        range={{ start: "", end: "" }}
        dateFormat="YYYY-MM-DD"
      />,
    );

    expect(screen.getByText("Pick start and end date")).toBeInTheDocument();
  });

  it("shows the formatted date range when both dates are selected", () => {
    render(
      <DateRangePicker
        rangeHandler={vi.fn()}
        dateValue=""
        range={{ start: "2024-01-15", end: "2024-02-20" }}
        dateFormat="DD.MM.YYYY"
      />,
    );

    expect(
      screen.getByText("15.01.2024 – 20.02.2024"),
    ).toBeInTheDocument();
  });

  it("calls rangeHandler with a clear event when Clear is clicked", async () => {
    const user = userEvent.setup();
    const rangeHandler = vi.fn();
    render(
      <DateRangePicker
        rangeHandler={rangeHandler}
        dateValue=""
        range={{ start: "2024-01-15", end: "2024-02-20" }}
        dateFormat="YYYY-MM-DD"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(rangeHandler).toHaveBeenCalledTimes(1);
    expect(rangeHandler.mock.calls[0][0]).toBeInstanceOf(Event);
    expect(rangeHandler.mock.calls[0][0].type).toBe("clear");
  });
});
