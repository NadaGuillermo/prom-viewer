import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FilterOptionsDisplay from "@components/FilterOptionsDisplay";
import type { Mapping } from "@utils/mapping";

const questionnaires: Mapping.Questionnaire[] = [
  {
    id: "q1",
    title: "PHQ-9",
    url: "https://example.org/q1",
    items: {},
  },
  {
    id: "q2",
    title: "PROMIS-29",
    url: "https://example.org/q2",
    items: {},
  },
];

const dates = ["2024-01-01", "2024-02-01"];

const baseProps = {
  questionnaires,
  selectedQuestionnaires: ["q1"],
  questionnaireSelectionHandler: vi.fn(),
  dates,
  selectedDates: ["2024-01-01"],
  dateSelectionHandler: vi.fn(),
  datePickerValue: "",
  datePickerRange: { start: "", end: "" },
  rangeSelectionHandler: vi.fn(),
  resetHandler: vi.fn(),
  filteredSelectedDates: dates,
  filteredSelectedQuestionnaires: questionnaires.map((q) => q.id),
  inactiveDates: [],
  inactiveQuestionnaires: [],
  dateFormat: "YYYY-MM-DD",
};

describe("FilterOptionsDisplay", () => {
  it("renders a checkbox per questionnaire reflecting selection state", () => {
    render(<FilterOptionsDisplay {...baseProps} />);

    expect(screen.getByRole("checkbox", { name: "PHQ-9" })).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "PROMIS-29" }),
    ).not.toBeChecked();
  });

  it("disables checkboxes listed as inactive", () => {
    render(
      <FilterOptionsDisplay
        {...baseProps}
        inactiveQuestionnaires={["q2"]}
        inactiveDates={["2024-02-01"]}
      />,
    );

    expect(screen.getByRole("checkbox", { name: "PROMIS-29" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "2024-02-01" })).toBeDisabled();
  });

  it("calls questionnaireSelectionHandler with the questionnaire id when toggled", async () => {
    const user = userEvent.setup();
    const questionnaireSelectionHandler = vi.fn();
    render(
      <FilterOptionsDisplay
        {...baseProps}
        questionnaireSelectionHandler={questionnaireSelectionHandler}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "PROMIS-29" }));

    expect(questionnaireSelectionHandler).toHaveBeenCalledWith("q2");
  });

  it("calls dateSelectionHandler with the date when toggled", async () => {
    const user = userEvent.setup();
    const dateSelectionHandler = vi.fn();
    render(
      <FilterOptionsDisplay
        {...baseProps}
        dateSelectionHandler={dateSelectionHandler}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "2024-02-01" }));

    expect(dateSelectionHandler).toHaveBeenCalledWith("2024-02-01");
  });

  it("calls resetHandler when Reset Filters is clicked", async () => {
    const user = userEvent.setup();
    const resetHandler = vi.fn();
    render(<FilterOptionsDisplay {...baseProps} resetHandler={resetHandler} />);

    await user.click(screen.getByRole("button", { name: "Reset Filters" }));

    expect(resetHandler).toHaveBeenCalledTimes(1);
  });
});
