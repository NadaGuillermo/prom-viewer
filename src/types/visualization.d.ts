import { use } from "echarts/core";
import type { CSSProperties } from "react";
import { CanvasRenderer } from "echarts/renderers";
import { VariableDomains as Domains } from "@customTypes/variableDomains";

import {
  HeatmapChart,
  ScatterChart,
  LineChart,
  BarChart,
  PieChart,
} from "echarts/charts";
import {
  LegendComponent,
  GridComponent,
  TooltipComponent,
  ToolboxComponent,
  VisualMapComponent,
  TitleComponent,
  DataZoomComponent,
  MatrixComponent,
} from "echarts/components";
import type { ComposeOption, SetOptionOpts } from "echarts/core";
import type {
  BarSeriesOption,
  LineSeriesOption,
  ScatterSeriesOption,
} from "echarts/charts";
import type {
  TitleComponentOption,
  GridComponentOption,
} from "echarts/components";

// Register the required components
use([
  LegendComponent,
  ScatterChart,
  LineChart,
  BarChart,
  HeatmapChart,
  PieChart,
  MatrixComponent,
  VisualMapComponent,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  ToolboxComponent, // A group of utility tools, which includes export, data view, dynamic type switching, data area zooming, and reset.
  DataZoomComponent, // Used in Line Graph Charts
  CanvasRenderer, // If you only need to use the canvas rendering mode, the bundle will not include the SVGRenderer module, which is not needed.
]);

export namespace Visualization {
  // Combine an Option type with only required components and charts via ComposeOption
  type EChartsOption = ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | TitleComponentOption
    | GridComponentOption
    | ScatterSeriesOption
  >;

  interface ReactEChartsWrapperProps {
    option: EChartsOption;
    style?: CSSProperties;
    settings?: SetOptionOpts;
    loading?: boolean;
    theme?: "light" | "dark";
  }

  /** Charts generell */

  interface DataSeries {
    name: string;
    data: Domains.NumberOrNull[];
  }

  interface ScoreDataSeries extends DataSeries{
    originalScores: Domains.NumberOrNull[];
  }

  interface OriginalAndNormalizedScore {
    originalScore: number;
    normalizedScore: number;
  }

  interface ChartData {
    xData: string[];
    yScoreData?: ScoreDataSeries[];
    yItemsData: DataSeries[];
  }

  interface ChartProps {
    title: string;
    xData: string[];
    yData: DataSeries[];
  }

  /** Line Chart */

  interface LineChartProps extends ChartProps {}

  /** Matrix */

  interface MatrixProps extends ChartProps {}

  interface MatrixItem {
    id: string;
    label: string;
    values: number[];
  }

  interface MatrixDimension {
    id: string;
    label: string;
    items: MatrixItem[];
    dimensionValues: number[];
  }

  interface CollapsibleMatrixProps {
    dimensions: MatrixDimension[];
    columns: string[];
    allRowsExpanded: boolean;
  }

  interface RowMeta {
    rowIndex: number;
    dimensionId: string;
    isDimension: boolean;
    itemId?: string;
    label: string;
  }
}
