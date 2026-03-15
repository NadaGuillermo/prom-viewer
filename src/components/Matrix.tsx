import { ReactEChartsWrapper } from "@utils/ReactEChartsWrapper";
import type { Visualization } from "@customTypes/visualization";

export interface MatrixProps {
  showItemDetails: boolean;
}

const Matrix = ({ showItemDetails }: MatrixProps) => {
  const xData = [
    "08.08.2025",
    "08.09.2025",
    "08.10.2025",
    "08.11.2025",
    "08.12.2025",
    "08.01.2026",
    "08.02.2026",
  ];
  let yData: string[];
  if (!showItemDetails) {
    yData = ["Dimension 1", "Dimension 2"];
  } else {
    yData = [
      "Dimension 1",
      "Item 1",
      "Item 2",
      "Item 3",
      "Item 4",
      "Item 5",
      "Item 6",
      "Dimension 2",
      "Item 2.1",
      "Item 2.2",
      "Item 2.3",
    ];
  }

  const xCnt = xData.length;
  const yCnt = yData.length;

  const data: [string, string, number][] = [];
  for (let i = 1; i <= xCnt; ++i) {
    for (let j = 1; j <= yCnt; ++j) {
      data.push([xData[i - 1], yData[j - 1], Math.random()]);
    }
  }

  const options: Visualization.EChartsOption = {
    animation: false,
    matrix: {
      x: {
        data: xData,
      },
      y: {
        data: yData,
      },
      top: "middle",
    },
    visualMap: {
      type: "piecewise",
      pieces: [
        {
          min: 0.65,
          label: "Good",
          color: "#80F1BE",
          symbol: "circle",
          symbolSize: 30,
        },
        {
          min: 0.3,
          max: 0.65,
          label: "Mediocre",
          color: "#fec42c",
          symbol: "rect",
          symbolSize: 30,
        },
        {
          max: 0.3,
          label: "Bad",
          color: "#FF684A",
          symbol: "diamond",
          symbolSize: 30,
        },
      ],
      showLabel: true,
      orient: "horizontal",
      left: "center",
      bottom: "10%",
    },
    series: {
      type: "scatter",
      coordinateSystem: "matrix",
      data,
      itemStyle: {
        opacity: 1,
      },
      label: {
        show: true,
        formatter: (params: any) => params.value[2].toFixed(2),
      },
    },
  };
  return (
    <div style={{ height: `${showItemDetails ? 1000 : 400}px` }}>
      <ReactEChartsWrapper option={options} />
    </div>
  );
};

export default Matrix;
