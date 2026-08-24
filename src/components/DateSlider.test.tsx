import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DateSlider from "@components/DateSlider";

const dates = ["2024-01-01", "2024-02-01", "2024-03-01"];

describe("DateSlider", () => {
  it("renders nothing when there are no dates", () => {
    const { container } = render(
      <DateSlider dates={[]} selectedDate="" changeDate={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the selected date", () => {
    render(
      <DateSlider
        dates={dates}
        selectedDate="2024-02-01"
        changeDate={vi.fn()}
      />,
    );

    expect(screen.getByText("2024-02-01")).toBeInTheDocument();
  });

  it("disables the previous button on the first date", () => {
    render(
      <DateSlider
        dates={dates}
        selectedDate="2024-01-01"
        changeDate={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Previous date" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next date" })).toBeEnabled();
  });

  it("disables the next button on the last date", () => {
    render(
      <DateSlider
        dates={dates}
        selectedDate="2024-03-01"
        changeDate={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Next date" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Previous date" }),
    ).toBeEnabled();
  });

  it("calls changeDate with the previous direction when clicked", async () => {
    const user = userEvent.setup();
    const changeDate = vi.fn();
    render(
      <DateSlider
        dates={dates}
        selectedDate="2024-02-01"
        changeDate={changeDate}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Previous date" }));

    expect(changeDate).toHaveBeenCalledWith("2024-02-01", dates, "previous");
  });

  it("calls changeDate with the next direction when clicked", async () => {
    const user = userEvent.setup();
    const changeDate = vi.fn();
    render(
      <DateSlider
        dates={dates}
        selectedDate="2024-02-01"
        changeDate={changeDate}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Next date" }));

    expect(changeDate).toHaveBeenCalledWith("2024-02-01", dates, "next");
  });
});
