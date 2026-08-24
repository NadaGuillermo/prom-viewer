import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SidebarToggle from "@components/SidebarToggle";

describe("SidebarToggle", () => {
  it("shows a 'Show filter sidebar' label when the sidebar is hidden", () => {
    render(
      <SidebarToggle
        showSidebar={false}
        toggleShowSidebar={vi.fn()}
        isFilterActive={false}
        resetFilters={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Show filter sidebar" }),
    ).toBeInTheDocument();
  });

  it("shows a 'Hide filter sidebar' label when the sidebar is visible", () => {
    render(
      <SidebarToggle
        showSidebar={true}
        toggleShowSidebar={vi.fn()}
        isFilterActive={false}
        resetFilters={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Hide filter sidebar" }),
    ).toBeInTheDocument();
  });

  it("calls toggleShowSidebar when the toggle button is clicked", async () => {
    const user = userEvent.setup();
    const toggleShowSidebar = vi.fn();
    render(
      <SidebarToggle
        showSidebar={false}
        toggleShowSidebar={toggleShowSidebar}
        isFilterActive={false}
        resetFilters={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Show filter sidebar" }),
    );

    expect(toggleShowSidebar).toHaveBeenCalledTimes(1);
  });

  it("does not render the reset-filters button when no filter is active", () => {
    render(
      <SidebarToggle
        showSidebar={false}
        toggleShowSidebar={vi.fn()}
        isFilterActive={false}
        resetFilters={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Filter is active" }),
    ).not.toBeInTheDocument();
  });

  it("renders the reset-filters button when a filter is active and the sidebar is hidden", async () => {
    const user = userEvent.setup();
    const resetFilters = vi.fn();
    render(
      <SidebarToggle
        showSidebar={false}
        toggleShowSidebar={vi.fn()}
        isFilterActive={true}
        resetFilters={resetFilters}
      />,
    );

    const resetButton = screen.getByRole("button", {
      name: "Filter is active",
    });
    await user.click(resetButton);

    expect(resetFilters).toHaveBeenCalledTimes(1);
  });
});
