import type * as Visualization from "@utils/visualization";
import React from "react";
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

   return (
    <div
      className={`tw:w-full tw:overflow-x-auto tw:overflow-y-auto`}
      style={{ maxHeight: maxHeight }}
    >
      <div
        className={`tw:grid tw:gap-0 tw:min-w-xs`}
        style={{ gridTemplateColumns: `minmax(10rem, 18rem) repeat(${xData.length}, minmax(6rem, max-content))` }}
      >
        <div className="tw:border-b border-medium tw:bg-base-100 tw:sticky tw:top-0 tw:left-0 tw:z-14" />
        {xData.map((date) => (
          <div
            key={date}
            className="tw:border-b tw:py-2 tw:px-2 border-medium tw:bg-base-100 tw:sticky tw:top-0 tw:z-12"
          >
            <div className="tw:text-sm tw:font-bold tw:select-none tw:text-center tw:whitespace-nowrap tw:px-2 tw:text-neutral"
            >
              {date}
            </div>
          </div>
        ))}
        {yData.map((row) => (
          <React.Fragment key={row.id}>
            <div
              className={`tw:sticky tw:left-0 tw:z-10 tw:border-b border-light tw:bg-base-100
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
                      <Tooltip id={`${row.id}`} place="top" opacity={1} className="custom-tooltip tooltip-base">
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
                className={`tw:flex tw:justify-center 
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
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default DataTable;