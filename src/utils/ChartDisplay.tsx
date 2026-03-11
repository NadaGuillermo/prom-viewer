import { ReactEChartsWrapper, type EChartsOption } from "@utils/ReactEChartsWrapper";

interface ChartDisplayProps {
  options: EChartsOption;
  chartExpansionFactor?: number;
}


const ChartDisplay = ({ options, chartExpansionFactor=1 }: ChartDisplayProps ) => {
  return (
      <div className={`tw:h-${chartExpansionFactor * 100}`}>
      
        <ReactEChartsWrapper option={options}></ReactEChartsWrapper>
      </div>
  );
}

export default ChartDisplay;

