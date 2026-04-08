
// Globale Definitionen (defaults) für options -> Einheitlichkeit
// https://echarts.apache.org/en/option.html


/** 
 * title
 * * textStyle
 * * padding
 * legend
 * * left
 * * top
 * * orient
 * * padding
 * * itemGap
 * * itemWidth
 * * itemHeight
 * * inactiveColor
 * * textStyle
 * grid
 * xAxis
 * yAxis
 * tooltip
 * * formatter
 * * valueFormatter
 * * backgroundColor
 * * borderColor
 * * borderWidth
 * * padding: 10,
 * * textStyle
 * axisPointer
 * toolbox -> image export
 * matrix
 * color
 * textStyle
 */


/** Title */
interface TitleProps {
    text?: string;
    subtext?: string;
    // padding?: number | number[];
}

export const Title = ({
    text = '',
    subtext = '',
    // padding = [10, 5, 10, 5],
}: TitleProps) => {
    return {
        text,
        subtext,
        // padding,
    }

}

interface TooltipProps  {
    show?: boolean;
    trigger?: 'item' | 'axis' | 'none';
    axisPointer?: {
        type: 'cross' | 'line' | 'shadow' | 'none';
    };
}

export const Tooltip = ({
    trigger = 'item',
    axisPointer = {
      type: 'none'
    }
}: TooltipProps) => {
   return {
    trigger,
    axisPointer,
   }
  };

