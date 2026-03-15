import { ReactEChartsWrapper } from "@utils/ReactEChartsWrapper";
import type { Visualization } from "@customTypes/visualization";

export interface BarChartProps {
  timeXAxis: boolean;
}

export const BarChart = ({ timeXAxis }: BarChartProps) => {
  let options: Visualization.EChartsOption;
  if (timeXAxis) {
    options = {
      title: {
        text: "Dimension 1",
      },
      legend: {},
      tooltip: {},
      xAxis: {
        data: [
          "08.08.2025",
          "08.09.2025",
          "08.10.2025",
          "08.11.2025",
          "08.12.2025",
          "08.01.2026",
          "08.02.2026",
        ],
      },
      yAxis: {},
      series: [
        {
          name: "Item 1",
          type: "bar",
          data: [90, 80, 80, 60, 50, 50, 50],
        },
        {
          name: "Item 2",
          type: "bar",
          data: [60, 60, 50, 90, 50, 70, 80],
        },
        {
          name: "Item 3",
          type: "bar",
          data: [60, 60, 50, 90, 50, 70, 80],
        },
        {
          name: "Item 4",
          type: "bar",
          data: [60, 50, 70, 70, 40, 35, 85],
        },
        {
          name: "Item 5",
          type: "bar",
          data: [40, 40, 55, 60, 55, 70, 90],
        },
        {
          name: "Item 6",
          type: "bar",
          data: [35, 50, 40, 90, 90, 30, 85],
        },
      ],
    };
  } else {
    options = {
      title: {
        text: "Dimension 1",
      },
      legend: {},
      xAxis: {
        data: ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"],
      },
      yAxis: {},
      series: [
        {
          name: "08.08.2025",
          type: "bar",
          data: [90, 60, 60, 60, 40, 35], // [90, 80, 80, 60, 50, 50, 50]
        },
        {
          name: "08.09.2025",
          type: "bar",
          data: [60, 60, 50, 90, 50, 70], // [60, 60, 50, 90, 50, 70, 80]
        },
        {
          name: "08.10.2025",
          type: "bar",
          data: [60, 60, 50, 90, 50, 70], // [60, 60, 50, 90, 50, 70, 80]
        },
        {
          name: "08.11.2025",
          type: "bar",
          data: [60, 50, 70, 70, 40, 35], // [60, 50, 70, 70, 40, 35, 85]
        },
        {
          name: "08.12.2025",
          type: "bar",
          data: [40, 40, 55, 60, 55, 70], // [40, 40, 55, 60, 55, 70, 90]
        },
        {
          name: "08.01.2026",
          type: "bar",
          data: [35, 50, 40, 90, 90, 30], // [35, 50, 40, 90, 90, 30, 85]
        },
        {
          name: "08.02.2026",
          type: "bar",
          data: [50, 80, 80, 85, 90, 85],
        },
      ],
    };
  }

  return <ReactEChartsWrapper option={options} />;
};
