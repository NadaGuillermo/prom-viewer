import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import NoData from "@components/NoData";

describe("NoData", () => {
  it("renders the default title and message", () => {
    render(<NoData />);

    expect(screen.getByText("No Data Available")).toBeInTheDocument();
    expect(
      screen.getByText(
        "No data could be found for this visualization. Please try adjusting your filters or time range.",
      ),
    ).toBeInTheDocument();
  });

  it("renders a custom title and message", () => {
    render(<NoData title="Nothing here" message="Try again later" />);

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("Try again later")).toBeInTheDocument();
  });

  it("does not render an action button by default", () => {
    render(<NoData />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the action button and calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<NoData action={{ label: "Refresh", onClick }} />);

    const button = screen.getByRole("button", { name: "Refresh" });
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
