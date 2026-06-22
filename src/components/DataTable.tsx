import type { Visualization } from "@utils/visualization";

import { truncateAtWord } from "@utils/visualization";
import { Tooltip } from "react-tooltip";
import Portal from "@components/Portal";

interface Props {
  data: Visualization.ChartData;
  maxHeight?: string;
}

const DataTable = ({
  data, 
  maxHeight = "600px"
}: Props) => {
  const xData = data.xData;
  console.log("css table original x data: ", xData);
  const yData = data.yData;
  console.log("simple table data yData: ", yData);

  const columns = xData.length + 2;

   return (
    <div
      className={`tw:w-full tw:overflow-x-auto tw:overflow-y-auto`}
      style={{ maxHeight: maxHeight }}
    >
      <div
        className={`tw:grid tw:gap-0 tw:min-w-xs`}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        <div className="tw:col-span-2 tw:border-b tw:py-2 border-medium" />
        {xData.map((date) => (
          <div
            key={date}
            className="tw:col-span-1 tw:border-b tw:py-2 border-medium"
          >
            <div className="tw:text-sm tw:font-bold tw:text-center tw:whitespace-pre-wrap tw:px-2 text-light"
            >
              {date}
            </div>
          </div>
        ))}
        {yData.map((row) => (
          <>
            <div
              key={row.id}
              className={`tw:col-span-2 tw:border-b border-light
            tw:py-2 tw:px-2`}
            >
              <div className={`tw:text-sm tw:whitespace-pre-wrap tw:break-normal ${row.seriesType === "score" ? "tw:font-bold" : "tw:font-normal"}`}>
                {row.name !== truncateAtWord(row.name, 80) ? (   
                  <>
                    <div data-tooltip-id={`${row.id}`}>
                      {
                      truncateAtWord(row.name, 80)
                      }
                    </div>
                    <Portal>
                      <Tooltip id={`${row.id}`} place="top" opacity={1} className="custom-tooltip tooltip-neutral">
                        <div className="tw:w-52">
                          <div className="tw:text-left tw:text-sm tw:whitespace-pre-wrap tw:break-normal">
                            {
                              row.name
                            }
                          </div>
                        </div>                          
                      </Tooltip>
                    </Portal>
                  </>
                  )
                  :
                  <div>
                    {
                      row.name.slice(0, 80)
                    }
                  </div>
                }
              </div>
            </div>
            {xData.map((date, index) => (
              <div
                key={`${date}:${row.id}`}
                className={`tw:col-span-1 tw:flex tw:justify-center 
              tw:items-center tw:border-b border-light
              tw:py-2 `}
              >
                <div className={`tw:text-sm ${row.seriesType === "score" ? "tw:font-bold" : "tw:font-normal"}`}>
                  {row.originalData[index] !== null ?
                    row.originalData[index]
                    : ""
                  }                                      
                </div>
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}

export default DataTable;