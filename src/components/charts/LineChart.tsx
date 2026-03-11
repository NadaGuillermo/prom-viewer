import { ReactEChartsWrapper, type EChartsOption } from "@utils/ReactEChartsWrapper";
import { Tooltip, Title } from "@utils/chartLayout";

const LineChart = () => {
  const options: EChartsOption = {
    title: Title({text: "Dimension Scores"}),
    legend: {
      
    },
    tooltip: {
      
    },
    xAxis: {
      type: "category",
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
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Score 1",
        data: [90, 30, 24, 76, 53, 66, 89],
        type: "line",
      },
      {
        name: "Score 2",
        data: [50, 23, 72, 75, 99, 100, 56],
        type: "line",
      },
    ],
  };
  return (
    <>
      <ReactEChartsWrapper option={options} />
    </>
  );
};

export default LineChart;
