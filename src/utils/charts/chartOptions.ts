import type {
  TitleComponentOption,
  GridComponentOption,
  LegendComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
  LineSeriesOption,
  TooltipComponentOption,
  RadarSeriesOption,
  RadarComponentOption,
} from "echarts";

import { chartColorRecord } from "./chartColors";

const lineChartSeriesOption: LineSeriesOption = {
  connectNulls: true,
  symbol: "circle",
  symbolSize: 7,
  emphasis: {
    focus: "series",
    scale: true,
    lineStyle: {
      width: 3,
      opacity: 1,
    },
    itemStyle: {
      opacity: 1,
    }
  },
  lineStyle: {
    width: 3,
  },
}

const groupedLineChartSeriesOption: LineSeriesOption = {
  connectNulls: true,
  symbol: "circle",
  symbolSize: 7,
  emphasis: {
    disabled: true,
  },
  lineStyle: {
    width: 3,
  },
}

const titleOption: TitleComponentOption = {
   textStyle: {
    color: chartColorRecord.title,
    fontSize: 18,
    fontStyle: "normal",
    fontWeight: "bolder",
    fontFamily: "sans-serif"
  },
  subtextStyle: {
    color: chartColorRecord.subTitle,
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "normal",
    fontFamily: "sans-serif"
  }
}

const legendOption: LegendComponentOption = {
  show: true,
  orient: "horizontal",
  padding: 2,
  itemGap: 12,
  itemHeight: 14,
  itemWidth: 25,
  textStyle: {
    color: chartColorRecord.text,
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "normal",
    fontFamily: "sans-serif",
  }
};

const gridOption: GridComponentOption = {
  show: false,
  left: 0,
  top: 60,
  right: 0,
  bottom: 60,
};

const tooltipOption: TooltipComponentOption = {
  showDelay: 0,
  hideDelay: 100,
  transitionDuration: 0.4,
  displayTransition: true,
  backgroundColor: chartColorRecord.tooltipBackground,
  borderWidth: 1.5,
  textStyle: {
    fontSize: 14,
    color: chartColorRecord.textLight,
    fontFamily: "sans-serif",
    fontWeight: "normal",
    fontStyle: "normal",
  }
};

const singleLineChartTitleOption: TitleComponentOption = {
  ...titleOption,
};

const singleLineChartLegendOption: LegendComponentOption = {
  ...legendOption,
};

const singleLineChartGridOption: GridComponentOption = {
  ...gridOption,
};

const singleLineChartXAxisOption: XAXisComponentOption = {
  show: true,
  position: "bottom",
  axisLine: {
    show: true,
    lineStyle: {
      color: chartColorRecord.axisLine,
      width: 1,
      type: "solid",
    }
  },
  axisTick: {
    show: false,
  },
  axisLabel: {
    show: true,
    fontSize: 12,
    color: chartColorRecord.text,
    fontFamily: "sans-serif",
    fontWeight: "normal",
    fontStyle: "normal",
  },
  splitLine: {
    show: false,
  },
};

const singleLineChartYAxisOption: YAXisComponentOption = {
  show: true,
  position: "left",
  splitNumber: 5,
  axisLine: {
    show: true,
    lineStyle: {
      color: chartColorRecord.axisLine,
      width: 1,
      type: "solid",
    }
  },
  axisTick: {
    show: false,
  },
  axisLabel: {
    show: true,
    fontSize: 12,
    color: chartColorRecord.text,
    fontFamily: "sans-serif",
    fontWeight: "normal",
    fontStyle: "normal",
  },
  splitLine: {
    show: true,
    lineStyle: {
      color: chartColorRecord.splitLine,
      width: 1,
      type: "solid",
    }
  },
};

const singleLineChartTooltipOption: TooltipComponentOption = {
  ...tooltipOption,
}

export const singleLineChartOptions = {
  title: singleLineChartTitleOption,
  legend: singleLineChartLegendOption,
  grid: singleLineChartGridOption,
  xAxis: singleLineChartXAxisOption,
  yAxis: singleLineChartYAxisOption,
  tooltip: singleLineChartTooltipOption,
  series: lineChartSeriesOption,
}

const justYAxisLineChartTitleOption: TitleComponentOption = {
  show: false,
};

const justYAxisLineChartLegendOption: LegendComponentOption = {
  show: false,
}

const justYAxisLineChartGridOption: GridComponentOption = {
  show: false,
  top: 0,
  left: 0,
  right: 8,
  bottom: 0,
}

const justYAxisLineChartXAxisOption: XAXisComponentOption = {
  show: false,
}

const justYAxisLineChartYAxisOption: YAXisComponentOption = {
  position: "right",
  show: true,
  splitNumber: 1,
  axisLabel: {
    show: true,
    margin: -2,
    align: "right",
    showMinLabel: true,
    showMaxLabel: true,
    fontSize: 12,
    color: chartColorRecord.text,
    fontFamily: "sans-serif",
    fontWeight: "normal",
    fontStyle: "normal",
  },
  splitLine: {
    show: false,
  },
  axisLine: {
    show: false,
  },
  axisTick: {
    show: true,
    inside: false,
    length: 8,
    alignWithLabel: false,
    lineStyle: {
      color: chartColorRecord.splitLine,
      width: 1,
    }
  }
}

const justYAxisLineChartTooltipOption: TooltipComponentOption = {

}

export const justYAxisLineChartOptions = {
  title: justYAxisLineChartTitleOption,
  legend: justYAxisLineChartLegendOption,
  grid: justYAxisLineChartGridOption,
  xAxis: justYAxisLineChartXAxisOption,
  yAxis: justYAxisLineChartYAxisOption,
  tooltip: justYAxisLineChartTooltipOption,
}

const groupedLineChartTitleOption: TitleComponentOption = {
  show: false,
};

const groupedLineChartLegendOption: LegendComponentOption = {
  show: true,
  top: 4,
  left: 0,
  itemWidth: 0,
  itemHeight: 0,
  selectedMode: false,
  textStyle: {
    color: chartColorRecord.text,
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "normal",
    fontFamily: "sans-serif",
  }
}

const groupedLineChartGridOption: GridComponentOption = {
  show: false,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

const groupedLineChartXAxisOption: XAXisComponentOption = {
  show: false,
}

const groupedLineChartYAxisOption: YAXisComponentOption = {
  show: false,
}

const groupedLineChartTooltipOption: TooltipComponentOption = {
  ...singleLineChartTooltipOption
};

export const groupedLineChartOptions = {
  title: groupedLineChartTitleOption,
  legend: groupedLineChartLegendOption,
  grid: groupedLineChartGridOption,
  xAxis: groupedLineChartXAxisOption,
  yAxis: groupedLineChartYAxisOption,
  tooltip: groupedLineChartTooltipOption,
  series: groupedLineChartSeriesOption,
}

const emptyLineChartTitleOption: TitleComponentOption = {
  show: false,
};

const emptyLineChartLegendOption: LegendComponentOption = {
  show: false,
}

const emptyLineChartGridOption: GridComponentOption = {
  show: false,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

const emptyLineChartXAxisOption: XAXisComponentOption = {
  show: false,
}

const emptyLineChartYAxisOption: YAXisComponentOption = {
  show: false,
}

const emptyLineChartTooltipOption: TooltipComponentOption = {

}

export const emptyLineChartOptions = {
  title: emptyLineChartTitleOption,
  legend: emptyLineChartLegendOption,
  grid: emptyLineChartGridOption,
  xAxis: emptyLineChartXAxisOption,
  yAxis: emptyLineChartYAxisOption,
  tooltip: emptyLineChartTooltipOption,
}

const justXAxisLineChartTitleOption: TitleComponentOption = {
  show: false,
};

const justXAxisLineChartLegendOption: LegendComponentOption = {
  show: false,
}

const justXAxisLineChartGridOption: GridComponentOption = {
  show: false,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

const justXAxisLineChartXAxisOption: XAXisComponentOption = {
  show: true,
  axisLabel: {
    show: true,
    fontSize: 12,
    color: chartColorRecord.text,
    fontFamily: "sans-serif",
    fontWeight: "normal",
    fontStyle: "normal",
  },
  splitLine: {
    show: false,
  },
  axisLine: {
    show: false,
  }
}

const justXAxisLineChartYAxisOption: YAXisComponentOption = {
  show: false,
}

const justXAxisLineChartTooltipOption: TooltipComponentOption = {

}

export const justXAxisLineChartOptions = {
  title: justXAxisLineChartTitleOption,
  legend: justXAxisLineChartLegendOption,
  grid: justXAxisLineChartGridOption,
  xAxis: justXAxisLineChartXAxisOption,
  yAxis: justXAxisLineChartYAxisOption,
  tooltip: justXAxisLineChartTooltipOption,
}

/* Radar Chart */

const radarTitleOption: TitleComponentOption = {
  ...singleLineChartTitleOption
};

const radarLegendOption: LegendComponentOption = {
  ...legendOption,
  padding: 4,
  itemGap: 8,
}

const radarGridOption: GridComponentOption = {
  ...gridOption,
}

const radarTooltip: TooltipComponentOption = {
  ...tooltipOption,
}

const radarOption: RadarComponentOption = {
  axisName: {
    color: chartColorRecord.text,
    fontFamily: "sans-serif",
    fontSize: 12,
    fontStyle: "normal",
    fontWeight: "normal",
  },
  axisLine: {
    show: true,
    lineStyle: {
      color: chartColorRecord.axisLine,
    }
  },
  splitLine: {
    show: true,
    lineStyle: {
      color: chartColorRecord.splitLine,
    }
  },
  splitArea: {
    show: false,
  },
  startAngle: 90,
}

const radarSeriesOption: RadarSeriesOption = {

}

export const radarChartOptions = {
  title: radarTitleOption,
  legend: radarLegendOption,
  grid: radarGridOption,
  tooltip: radarTooltip,
  radar: radarOption,
  series: radarSeriesOption,
}