import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import GridTable from "@components/GridTable";

describe("GridTable", () => {
  it("renders nothing but the shell when data is empty", () => {
    const { container } = render(<GridTable data={{}} />);

    expect(container.querySelectorAll(".tw\\:grid > div").length).toBe(1);
  });

  it("renders a column per date", () => {
    render(
      <GridTable
        data={{
          "2024-01-01": ["PHQ-9"],
          "2024-02-01": ["PHQ-9"],
        }}
      />,
    );

    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
    expect(screen.getByText("2024-02-01")).toBeInTheDocument();
  });

  it("renders one row per unique questionnaire across all dates", () => {
    render(
      <GridTable
        data={{
          "2024-01-01": ["PHQ-9", "PROMIS-29"],
          "2024-02-01": ["PHQ-9"],
        }}
      />,
    );

    expect(screen.getAllByText("PHQ-9")).toHaveLength(1);
    expect(screen.getAllByText("PROMIS-29")).toHaveLength(1);
  });

  it("marks a response as present only for dates that include that questionnaire", () => {
    render(
      <GridTable
        data={{
          "2024-01-01": ["PHQ-9"],
          "2024-02-01": [],
        }}
      />,
    );

    const marks = screen.getAllByLabelText("Response exists");
    expect(marks).toHaveLength(1);
  });
});
