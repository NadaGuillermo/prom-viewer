import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import DataTable from "@components/DataTable";
import { ITEM_TYPES } from "@utils/mapping";
import type { Visualization } from "@utils/visualization";

const longName =
  "This is a deliberately long item name that exceeds eighty characters so truncation kicks in for the row label";

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
    {
      id: "row-2",
      name: longName,
      shortName: "LONG",
      data: [0.2, null],
      originalData: [4, null],
      dataLabels: [],
      seriesType: ITEM_TYPES.item as Visualization.ItemType,
      questionnaireId: "q1",
      questionnaireName: "PHQ-9",
    },
  ],
};

describe("DataTable", () => {
  it("renders a column header per date", () => {
    render(<DataTable data={chartData} />);

    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
    expect(screen.getByText("2024-02-01")).toBeInTheDocument();
  });

  it("renders the original value for each row/date cell", () => {
    render(<DataTable data={chartData} />);

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders short names in full without truncation", () => {
    render(<DataTable data={chartData} />);

    expect(screen.getByText("PHQ-9 Total")).toBeInTheDocument();
  });

  it("truncates long names at 80 characters with an ellipsis", () => {
    render(<DataTable data={chartData} />);

    expect(screen.queryByText(longName)).not.toBeInTheDocument();
    expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
  });
});
